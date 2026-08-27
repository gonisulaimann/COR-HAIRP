"""
ml.py — ML inference layer for the COR-HARP FastAPI backend.

Wraps the existing train_lstm.py (LSTM model) and optimizer.py (MILP solver)
to expose clean Python functions without Streamlit dependencies.
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np
import pandas as pd
import torch

# Add hairp_app to path so we can import the existing modules
_HAIRP_DIR = Path(__file__).resolve().parent.parent / "hairp_app"
if str(_HAIRP_DIR) not in sys.path:
    sys.path.insert(0, str(_HAIRP_DIR))

from train_lstm import (
    BornoLSTM,
    TARGET_LGAS,
    build_feature_matrix,
    extract_conflict,
    extract_food_prices,
    extract_ipc,
    extract_idp,
    scan_data_files,
)
from train_lstm_v2 import BornoLSTMv2
from optimizer import BornoOptimizer, SolveResult


# ── Constants ───────────────────────────────────────────────────────────────

DATA_DIR = Path(__file__).resolve().parent.parent / "data:"
MODEL_DIR = _HAIRP_DIR / "models"
# Prefer v2 model if available, fallback to v1
_V2_PATH = MODEL_DIR / "borno_lstm_v2.pth"
_V1_PATH = MODEL_DIR / "borno_lstm.pth"
MODEL_PATH = _V2_PATH if _V2_PATH.exists() else _V1_PATH
_V2_SCALER = MODEL_DIR / "borno_scaler_v2.json"
_V1_SCALER = MODEL_DIR / "borno_scaler.json"
SCALER_PATH = _V2_SCALER if _V2_SCALER.exists() else _V1_SCALER
_V2_META = MODEL_DIR / "feature_names_v2.json"
_V1_META = MODEL_DIR / "feature_names.json"
META_PATH = _V2_META if _V2_META.exists() else _V1_META

LGA_COORDS: Dict[str, Tuple[float, float]] = {
    "Maiduguri": (11.85, 13.15),
    "Bama": (11.52, 13.68),
    "Monguno": (12.67, 13.61),
    "Ngala": (12.40, 14.19),
    "Konduga": (11.82, 13.07),
}

CORRIDOR_DATA = [
    {"name": "Maiduguri → Konduga → Bama", "coordinates": [[11.85, 13.15], [11.82, 13.07], [11.52, 13.68]], "distance_km": 72, "risk_level": "HIGH"},
    {"name": "Maiduguri → Monguno → Ngala", "coordinates": [[11.85, 13.15], [12.67, 13.61], [12.40, 14.19]], "distance_km": 148, "risk_level": "CRITICAL"},
    {"name": "Maiduguri → Ngala → Bama", "coordinates": [[11.85, 13.15], [12.40, 14.19], [11.52, 13.68]], "distance_km": 195, "risk_level": "MODERATE"},
]

LGA_RISK_LEVELS = {
    "Maiduguri": "MODERATE",
    "Bama": "CRITICAL",
    "Monguno": "HIGH",
    "Ngala": "CRITICAL",
    "Konduga": "HIGH",
}


# ── Cached Model State ─────────────────────────────────────────────────────

class _ModelState:
    """Singleton container for the loaded LSTM model, scaler, and metadata."""
    def __init__(self):
        self.model: Optional[BornoLSTM] = None
        self.scaler = None
        self.meta: Optional[Dict] = None
        self.loaded = False

_state = _ModelState()


def load_model() -> Tuple[Any, Any, Optional[Dict]]:
    """Load the LSTM model, scaler, and metadata from disk (cached).
    Supports both v1 (BornoLSTM) and v2 (BornoLSTMv2) architectures.
    """
    if _state.loaded:
        return _state.model, _state.scaler, _state.meta

    if not MODEL_PATH.exists() or not SCALER_PATH.exists() or not META_PATH.exists():
        return None, None, None

    with open(META_PATH) as f:
        meta = json.load(f)

    # Choose model class based on version
    is_v2 = meta.get("version") == "v2"
    if is_v2:
        model = BornoLSTMv2(
            input_size=meta["input_size"],
            hidden_size=meta.get("hidden_size", 192),
            num_layers=meta.get("num_layers", 3),
            dropout=meta.get("dropout", 0.3),
            num_heads=meta.get("num_heads", 4),
        )
    else:
        model = BornoLSTM(
            input_size=meta["input_size"],
            hidden_size=meta.get("hidden_size", 128),
            num_layers=meta.get("num_layers", 2),
        )

    state_dict = torch.load(MODEL_PATH, map_location="cpu", weights_only=True)
    model.load_state_dict(state_dict)
    model.eval()

    with open(SCALER_PATH) as f:
        sd = json.load(f)
    scaler = type("Scaler", (), {
        "min": np.array(sd["min"]),
        "max": np.array(sd["max"]),
    })()

    _state.model = model
    _state.scaler = scaler
    _state.meta = meta
    _state.loaded = True
    return model, scaler, meta


def predict_raw(seq: np.ndarray) -> Tuple[float, Optional[torch.Tensor]]:
    """Run a single LSTM forward pass on a (seq_len, input_size) sequence."""
    model, scaler, meta = load_model()
    if model is None or meta is None:
        return 0.0, None
    input_size = meta["input_size"]
    if seq.shape[1] < input_size:
        seq = np.pad(seq, ((0, 0), (0, input_size - seq.shape[1])))
    seq = seq[:, :input_size]
    scaled = (seq - scaler.min) / np.where(scaler.max - scaler.min == 0, 1, scaler.max - scaler.min)
    x = torch.tensor(scaled, dtype=torch.float32).unsqueeze(0)
    with torch.no_grad():
        pred = model(x).item()
    return pred, x


def predict_for_lga(lga_params: Dict, lga: str) -> float:
    """Run LSTM prediction for a specific LGA. Returns real-scale predicted conflict events."""
    model, scaler, meta = load_model()
    if model is None or meta is None:
        return 0.0
    feature_names = meta.get("feature_names", [])
    params = lga_params.get(lga, {})
    base = np.array([params.get(f, 1.0) for f in feature_names[:len(params)]], dtype=np.float32)
    if len(base) < meta["input_size"]:
        base = np.pad(base, (0, meta["input_size"] - len(base)))
    seq = np.tile(base[:meta["input_size"]], (12, 1))
    pred_raw, _ = predict_raw(seq)
    return pred_raw * (scaler.max[0] - scaler.min[0]) + scaler.min[0]


def multi_lga_predictions(lga_params: Dict) -> Dict[str, float]:
    """Run LSTM predictions across all target LGAs."""
    return {lga: round(predict_for_lga(lga_params, lga), 2) for lga in TARGET_LGAS}


def forecast_sequence(lga_params: Dict, horizon: int = 12, escalation: float = 1.0) -> List[float]:
    """Run multi-step autoregressive LSTM forecast."""
    model, scaler, meta = load_model()
    if model is None or meta is None:
        return []
    feature_names = meta.get("feature_names", [])
    params = lga_params.get("Maiduguri", {})
    base = np.array([params.get(f, 1.0) for f in feature_names[:len(params)]], dtype=np.float32)
    if len(base) < meta["input_size"]:
        base = np.pad(base, (0, meta["input_size"] - len(base)))
    seq = np.tile(base[:meta["input_size"]], (12, 1))
    predictions = []
    for _ in range(horizon):
        pred_raw, _ = predict_raw(seq)
        real_val = pred_raw * (scaler.max[0] - scaler.min[0]) + scaler.min[0]
        real_val *= escalation
        predictions.append(max(0.0, real_val))
        new_row = seq[-1].copy()
        new_row[0] = pred_raw
        seq = np.roll(seq, -1, axis=0)
        seq[-1] = new_row
    return predictions


def feature_sensitivities(lga_params: Dict) -> pd.DataFrame:
    """Compute feature importance via perturbation analysis."""
    model, scaler, meta = load_model()
    if model is None or meta is None:
        return pd.DataFrame()
    feature_names = meta.get("feature_names", [])
    params = lga_params.get("Maiduguri", {})
    base = np.array([params.get(f, 1.0) for f in feature_names[:len(params)]], dtype=np.float32)
    if len(base) < meta["input_size"]:
        base = np.pad(base, (0, meta["input_size"] - len(base)))
    seq = np.tile(base[:meta["input_size"]], (12, 1))
    base_pred, _ = predict_raw(seq)
    sensitivities = {}
    for i, fname in enumerate(feature_names):
        if i >= meta["input_size"]:
            break
        perturbed = seq.copy()
        perturbed[:, i] *= 1.10
        p_pred, _ = predict_raw(perturbed)
        sensitivities[fname] = abs(p_pred - base_pred)
    return pd.DataFrame([{"Feature": k, "Sensitivity": round(v, 6)}
                         for k, v in sorted(sensitivities.items(), key=lambda x: -x[1])])


# ── Data Loading (lazy, cached) ────────────────────────────────────────────

_lga_params_cache: Optional[Dict] = None

def get_lga_params() -> Dict:
    """Get or compute LGA-level parameters from data files."""
    global _lga_params_cache
    if _lga_params_cache is not None:
        return _lga_params_cache

    from optimizer import _load_lga_parameters
    _lga_params_cache = _load_lga_parameters()
    return _lga_params_cache


def get_feature_matrix() -> Tuple[pd.DataFrame, List[str]]:
    """Build the feature matrix from raw data files."""
    files = scan_data_files()
    conflict_df = extract_conflict(files["conflict"]) if "conflict" in files else pd.DataFrame()
    food_df = extract_food_prices(files["food_prices"]) if "food_prices" in files else pd.DataFrame()
    ipc_df = extract_ipc(files["ipc"]) if "ipc" in files else pd.DataFrame()
    idp_df = extract_idp(files["idp"]) if "idp" in files else pd.DataFrame()
    return build_feature_matrix(conflict_df, food_df, ipc_df, idp_df)


# ── Map Data ────────────────────────────────────────────────────────────────

def get_map_markers() -> List[Dict]:
    """Build map marker data from LGA parameters and LSTM predictions."""
    lga_params = get_lga_params()
    lstm_preds = multi_lga_predictions(lga_params)
    markers = []
    for lga, (lat, lon) in LGA_COORDS.items():
        params = lga_params.get(lga, {})
        markers.append({
            "name": lga,
            "lat": lat,
            "lon": lon,
            "marker_type": "hq" if lga == "Maiduguri" else "camp",
            "risk_level": LGA_RISK_LEVELS.get(lga, "MODERATE"),
            "idp_population": int(params.get("idp_population", 0)),
            "lstm_prediction": lstm_preds.get(lga, 0.0),
        })
    return markers


def get_corridors() -> List[Dict]:
    """Return corridor data."""
    return CORRIDOR_DATA


# ── Optimizer ───────────────────────────────────────────────────────────────

def run_optimizer(
    n_periods: int = 4,
    equity_weight: float = 0.4,
    mc_iterations: int = 100,
) -> Dict[str, Any]:
    """Run the MILP optimizer and optional Monte Carlo simulation."""
    opt = BornoOptimizer(n_periods=n_periods, equity_weight=equity_weight, seed=42)
    result = opt.solve(verbose=False)

    unmet = {}
    if not result.unmet_demand.empty:
        for _, row in result.unmet_demand.iterrows():
            unmet[row["camp"]] = float(row["unmet_demand"])

    route = {}
    if not result.route_matrix.empty:
        for from_lga in result.route_matrix.index:
            route[from_lga] = {}
            for to_lga in result.route_matrix.columns:
                val = float(result.route_matrix.loc[from_lga, to_lga])
                if val > 0:
                    route[from_lga][to_lga] = round(val, 0)

    # Monte Carlo
    mc_mean = None
    mc_ci = None
    if mc_iterations > 0:
        mc = opt.monte_carlo(n_iter=mc_iterations, verbose=False)
        mc_mean = mc.get("mean_cost", 0)
        ci = mc.get("ci_cost_95", (0, 0))
        mc_ci = [ci[0], ci[1]]

    return {
        "status": result.status,
        "total_cost": round(result.total_cost_z1, 2),
        "equity_penalty": round(result.total_equity_penalty_z2, 2),
        "combined_objective": round(result.combined_objective, 2),
        "unmet_demand": unmet,
        "route_summary": route,
        "solve_time_s": round(result.solve_time_s, 2),
        "mc_mean_cost": mc_mean,
        "mc_95_ci": mc_ci,
    }
