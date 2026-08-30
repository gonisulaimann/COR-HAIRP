#!/usr/bin/env python3
"""
train_lstm.py — Borno State humanitarian time-series LSTM trainer

Scans the local data/ folder, extracts monthly features for five Borno LGAs
(Maiduguri, Bama, Monguno, Ngala, Konduga), trains a PyTorch LSTM, and saves
the model weights and feature scaler.

Usage:
    cd hairp_app
    python train_lstm.py          # runs with defaults
    python train_lstm.py --epochs 150 --lr 0.001 --seq-len 12
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import warnings
from pathlib import Path
from typing import Dict, List, Tuple

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.preprocessing import MinMaxScaler

warnings.filterwarnings("ignore")

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
MODEL_DIR = Path(__file__).resolve().parent / "models"
MODEL_PATH = MODEL_DIR / "borno_lstm.pth"
SCALER_PATH = MODEL_DIR / "borno_scaler.json"
FEATURE_NAMES_PATH = MODEL_DIR / "feature_names.json"

TARGET_LGAS = ["Maiduguri Metro", "Bama", "Monguno", "Ngala", "Konduga"]

# Markets in food-price CSV that map to our five target LGAs
# admin2 field in wfp_food_prices_nga.csv
MARKET_TO_LGA: Dict[str, str] = {
    # Maiduguri markets
    "Maiduguri": "Maiduguri Metro",
    "Budum": "Maiduguri Metro",
    "Custom": "Maiduguri Metro",
    "Kusawam Shanu": "Maiduguri Metro",
    "Monday": "Maiduguri Metro",
    "Tashan Bama": "Maiduguri Metro",
    "Gamboru": "Maiduguri Metro",
    "Kashuwan Shanu": "Maiduguri Metro",
    # Konduga markets (Bama town admin2=Konduga in wfp)
    "Abba Gamaram": "Konduga",
    "Baga Road": "Konduga",
    "Bullunkutu": "Konduga",
    "Bolori Stores": "Konduga",
    "Bama": "Bama",
    "Konduga": "Konduga",
    "Banki": "Bama",
    # Monguno market (admin2=Guzamala but market name is Monguno)
    "Monguno": "Monguno",
    # Ngala
    "Ngala": "Ngala",
}

KEY_COMMODITIES = [
    "Rice (imported)",
    "Millet",
    "Sorghum (white)",
    "Maize (white)",
]

# IPC target areas as named in ipc_nga_area_wide.csv
IPC_TARGET_AREAS = ["Maiduguri", "Bama", "Monguno", "Ngala", "Konduga"]


# ---------------------------------------------------------------------------
# 1. DATA SCANNING — discover files
# ---------------------------------------------------------------------------

def scan_data_files() -> Dict[str, Path]:
    """Scan data/ for known humanitarian datasets and return their paths."""
    required = {
        "conflict": "nigeria_hrp_political_violence_events_and_fatalities_by_month-year_as-of-13aug2026.xlsx",
        "food_prices": "wfp_food_prices_nga.csv",
        "ipc": "ipc_nga_area_wide.csv",
        "idp": "hdx_dtm_nigeria_r43_master_list_idp.xlsx",
    }
    found: Dict[str, Path] = {}
    for key, filename in required.items():
        path = DATA_DIR / filename
        if path.exists():
            found[key] = path
            print(f"  ✓ Found {key}: {filename}")
        else:
            print(f"  ✗ Missing {key}: {filename}")
    return found


# ---------------------------------------------------------------------------
# 2. FEATURE EXTRACTION — one function per source
# ---------------------------------------------------------------------------

def _month_to_num(name: str) -> int:
    """Convert English month name to integer."""
    months = {
        "January": 1, "February": 2, "March": 3, "April": 4,
        "May": 5, "June": 6, "July": 7, "August": 8,
        "September": 9, "October": 10, "November": 11, "December": 12,
    }
    return months.get(name, 0)


def extract_conflict(path: Path) -> pd.DataFrame:
    """
    Extract monthly conflict events & fatalities for the five target LGAs.
    Returns a DataFrame indexed by month with per-LGA columns.
    """
    print("\n[1/4] Loading conflict events …")
    df = pd.read_excel(path, sheet_name="Data")

    # Filter to target LGAs
    target = df[df["Admin2"].isin(TARGET_LGAS)].copy()

    # Build datetime
    target["month_num"] = target["Month"].map(_month_to_num)
    target["date"] = pd.to_datetime(
        target[["Year", "month_num"]].rename(columns={"Year": "year", "month_num": "month"}).assign(day=1)
    )

    # Aggregate: total events & fatalities across all five LGAs per month
    monthly = target.groupby("date").agg(
        conflict_events=("Events", "sum"),
        conflict_fatalities=("Fatalities", "sum"),
    )

    # Also per-LGA event counts
    for lga in TARGET_LGAS:
        lga_data = target[target["Admin2"] == lga].groupby("date")["Events"].sum()
        monthly[f"events_{lga.split()[0].lower()}"] = lga_data

    monthly = monthly.fillna(0).sort_index()
    print(f"    → {len(monthly)} months, {monthly['conflict_events'].sum():.0f} total events")
    return monthly


def extract_food_prices(path: Path) -> pd.DataFrame:
    """
    Extract monthly average prices for key commodities across target markets.
    Returns a DataFrame indexed by month with price columns.
    """
    print("\n[2/4] Loading food prices …")
    df = pd.read_csv(path)

    # Filter to Borno
    borno = df[df["admin1"].str.contains("Borno", case=False, na=False)].copy()

    # Keep only markets in our target LGAs
    target_markets = [m for m in MARKET_TO_LGA]
    borno = borno[borno["market"].isin(target_markets)]

    # Keep key commodities only
    borno = borno[borno["commodity"].isin(KEY_COMMODITIES)]

    if borno.empty:
        print("    ⚠ No matching food price rows")
        return pd.DataFrame()

    borno["date"] = pd.to_datetime(borno["date"])

    # Map each market to its LGA
    borno["lga"] = borno["market"].map(MARKET_TO_LGA)

    # Pivot: monthly average price per commodity across all target markets
    borno_monthly = (
        borno.groupby([pd.Grouper(key="date", freq="MS"), "commodity"])["price"]
        .mean()
        .unstack("commodity")
    )

    # Rename columns to clean names
    rename = {
        "Rice (imported)": "price_rice",
        "Millet": "price_millet",
        "Sorghum (white)": "price_sorghum",
        "Maize (white)": "price_maize",
    }
    borno_monthly = borno_monthly.rename(columns=rename)
    borno_monthly = borno_monthly.ffill().bfill()

    print(f"    → {len(borno_monthly)} months, columns: {list(borno_monthly.columns)}")
    return borno_monthly


def extract_ipc(path: Path) -> pd.DataFrame:
    """
    Extract quarterly IPC food-security phase data for target areas.
    Returns monthly DataFrame (forward-filled from quarterly).
    """
    print("\n[3/4] Loading IPC food security data …")
    df = pd.read_csv(path)
    borno = df[df["Level 1"].str.contains("Borno", case=False, na=False)]
    target = borno[borno["Area"].isin(IPC_TARGET_AREAS)].copy()

    if target.empty:
        print("    ⚠ No matching IPC rows")
        return pd.DataFrame()

    # Parse the "Date of analysis" column (e.g. "Sep 2025")
    month_map = {
        "Jan": 1, "Feb": 2, "Mar": 3, "Apr": 4, "May": 5, "Jun": 6,
        "Jul": 7, "Aug": 8, "Sep": 9, "Oct": 10, "Nov": 11, "Dec": 12,
    }
    def _parse_ipc_date(s: str) -> pd.Timestamp:
        parts = s.strip().split()
        mon = month_map.get(parts[0][:3], 1)
        yr = int(parts[1])
        return pd.Timestamp(year=yr, month=mon, day=1)

    target["date"] = target["Date of analysis"].apply(_parse_ipc_date)

    # Aggregate across target LGAs per quarter
    quarterly = target.groupby("date").agg(
        ipc_phase3p_pop=("Phase 3+ number current", "sum"),
        ipc_pop_analyzed=("Population analyzed current", "sum"),
        ipc_phase1_pct=("Phase 1 percentage current", "mean"),
        ipc_phase2_pct=("Phase 2 percentage current", "mean"),
        ipc_phase3_pct=("Phase 3 percentage current", "mean"),
        ipc_phase4_pct=("Phase 4 percentage current", "mean"),
        ipc_phase5_pct=("Phase 5 percentage current", "mean"),
    )

    # Convert to monthly by forward-filling
    full_idx = pd.date_range(quarterly.index.min(), quarterly.index.max(), freq="MS")
    quarterly = quarterly.reindex(full_idx).ffill()

    print(f"    → {len(quarterly)} months from IPC quarters")
    return quarterly


def extract_idp(path: Path) -> pd.DataFrame:
    """
    Extract IDP population estimates from the HDX DTM master list.
    Returns a monthly DataFrame (constant approximation — snapshot data).
    """
    print("\n[4/4] Loading IDP displacement data …")
    df = pd.read_excel(path, sheet_name=0)

    # Skip header row (the one with # tags)
    df = df[df["Population type"] != "#date+reported"].copy()

    # Filter to Borno state
    borno = df[df["State"].str.contains("Borno", case=False, na=False)].copy()

    if borno.empty:
        print("    ⚠ No Borno IDP rows")
        return pd.DataFrame()

    # Aggregate total IDP individuals
    borno["Individuals"] = pd.to_numeric(borno["Individuals"], errors="coerce").fillna(0)
    borno["Households"] = pd.to_numeric(borno["Households"], errors="coerce").fillna(0)
    total_individuals = borno["Individuals"].sum()
    total_households = borno["Households"].sum()

    print(f"    → Total IDPs: {total_individuals:,.0f} individuals, {total_households:,.0f} households")

    # IDP is a point-in-time estimate (Oct 2022 snapshot).
    # We'll use it as a constant feature column.
    idp_df = pd.DataFrame({
        "idp_individuals": [total_individuals],
        "idp_households": [total_households],
    }, index=[pd.Timestamp("2022-10-01")])

    return idp_df


# ---------------------------------------------------------------------------
# 3. FEATURE MATRIX — merge all sources
# ---------------------------------------------------------------------------

def build_feature_matrix(
    conflict: pd.DataFrame,
    food: pd.DataFrame,
    ipc: pd.DataFrame,
    idp: pd.DataFrame,
    start: str = "2017-01-01",
    end: str = "2026-07-01",
) -> Tuple[pd.DataFrame, List[str]]:
    """
    Merge all feature sources on a monthly timeline and return
    a clean numeric matrix ready for the LSTM.
    """
    print("\nBuilding feature matrix …")

    # Monthly index
    idx = pd.date_range(start, end, freq="MS")
    features = pd.DataFrame(index=idx)

    # --- Conflict features ---
    features = features.join(conflict, how="left")

    # --- Food price features ---
    if not food.empty:
        food_resampled = food.reindex(idx)
        features = features.join(food_resampled, how="left")

    # --- IPC features ---
    if not ipc.empty:
        ipc_resampled = ipc.reindex(idx, method="ffill")
        features = features.join(ipc_resampled, how="left")

    # --- IDP features (constant) ---
    if not idp.empty:
        for col in idp.columns:
            features[col] = idp[col].iloc[0]

    # --- Calendar features (cyclical) ---
    features["month_sin"] = np.sin(2 * np.pi * features.index.month / 12)
    features["month_cos"] = np.cos(2 * np.pi * features.index.month / 12)
    features["year"] = features.index.year
    features["year_norm"] = (features["year"] - features["year"].min()) / max(features["year"].max() - features["year"].min(), 1)

    # Drop 'year' after extracting year_norm
    features = features.drop(columns=["year"], errors="ignore")

    # --- Forward-fill then fill remaining NaN with 0 ---
    features = features.ffill().bfill().fillna(0)

    # Drop columns that are entirely zero (no data)
    nonzero_cols = features.columns[features.sum() != 0]
    dropped = [c for c in features.columns if c not in nonzero_cols]
    if dropped:
        print(f"  Dropped zero-only columns: {dropped}")
    features = features[nonzero_cols]

    feature_names = list(features.columns)
    print(f"\n  Final feature matrix: {features.shape[0]} months × {features.shape[1]} features")
    print(f"  Features: {feature_names}")

    return features, feature_names


# ---------------------------------------------------------------------------
# 4. SEQUENCE BUILDER
# ---------------------------------------------------------------------------

def create_sequences(
    data: np.ndarray, seq_len: int, target_idx: int = 0
) -> Tuple[np.ndarray, np.ndarray]:
    """
    Build (X, y) pairs for supervised LSTM training.
    X shape: (N, seq_len, num_features)
    y shape: (N,)  — one-step-ahead prediction of the target column.
    """
    X, y = [], []
    for i in range(len(data) - seq_len):
        X.append(data[i : i + seq_len])
        y.append(data[i + seq_len, target_idx])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


# ---------------------------------------------------------------------------
# 5. LSTM MODEL
# ---------------------------------------------------------------------------

class BornoLSTM(nn.Module):
    """
    Multi-layer LSTM for humanitarian time-series forecasting.
    Predicts next-month conflict event count from a look-back window.
    """

    def __init__(
        self,
        input_size: int,
        hidden_size: int = 128,
        num_layers: int = 2,
        dropout: float = 0.2,
    ):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers

        self.lstm = nn.LSTM(
            input_size=input_size,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )
        self.layer_norm = nn.LayerNorm(hidden_size)
        self.fc = nn.Sequential(
            nn.Linear(hidden_size, 64),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(64, 32),
            nn.ReLU(),
            nn.Linear(32, 1),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x: (batch, seq_len, input_size)
        Returns: (batch,) predictions
        """
        lstm_out, _ = self.lstm(x)                     # (batch, seq, hidden)
        last_hidden = lstm_out[:, -1, :]               # (batch, hidden)
        last_hidden = self.layer_norm(last_hidden)
        out = self.fc(last_hidden).squeeze(-1)          # (batch,)
        return out


# ---------------------------------------------------------------------------
# 6. TRAINING LOOP
# ---------------------------------------------------------------------------

def train_model(
    model: nn.Module,
    X_train: np.ndarray,
    y_train: np.ndarray,
    X_val: np.ndarray,
    y_val: np.ndarray,
    epochs: int = 100,
    lr: float = 0.001,
    batch_size: int = 16,
    patience: int = 20,
) -> nn.Module:
    """Train the LSTM with early stopping on validation loss."""
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"\nTraining on: {device}")
    model = model.to(device)

    X_train_t = torch.tensor(X_train, dtype=torch.float32).to(device)
    y_train_t = torch.tensor(y_train, dtype=torch.float32).to(device)
    X_val_t = torch.tensor(X_val, dtype=torch.float32).to(device)
    y_val_t = torch.tensor(y_val, dtype=torch.float32).to(device)

    optimizer = torch.optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", factor=0.5, patience=10)
    criterion = nn.MSELoss()

    n_train = len(X_train_t)
    best_val_loss = float("inf")
    best_state = None
    wait = 0

    print(f"  Samples: {n_train} train, {len(X_val_t)} val")
    print(f"  Epochs: {epochs}, LR: {lr}, Batch: {batch_size}\n")

    for epoch in range(1, epochs + 1):
        # ---- Training ----
        model.train()
        train_loss = 0.0
        perm = torch.randperm(n_train, device=device)

        for start in range(0, n_train, batch_size):
            idx = perm[start : start + batch_size]
            xb = X_train_t[idx]
            yb = y_train_t[idx]

            pred = model(xb)
            loss = criterion(pred, yb)

            optimizer.zero_grad()
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            train_loss += loss.item() * len(idx)

        train_loss /= n_train

        # ---- Validation ----
        model.eval()
        with torch.no_grad():
            val_pred = model(X_val_t)
            val_loss = criterion(val_pred, y_val_t).item()

        scheduler.step(val_loss)

        if epoch % 10 == 0 or epoch <= 5:
            current_lr = optimizer.param_groups[0]["lr"]
            print(
                f"  Epoch {epoch:3d}/{epochs}  "
                f"train_loss={train_loss:.4f}  val_loss={val_loss:.4f}  "
                f"lr={current_lr:.6f}"
            )

        # Early stopping
        if val_loss < best_val_loss:
            best_val_loss = val_loss
            best_state = {k: v.clone() for k, v in model.state_dict().items()}
            wait = 0
        else:
            wait += 1
            if wait >= patience:
                print(f"\n  Early stopping at epoch {epoch} (best val_loss={best_val_loss:.4f})")
                break

    # Restore best weights
    if best_state is not None:
        model.load_state_dict(best_state)
    print(f"\n  Best validation loss: {best_val_loss:.4f}")

    return model


# ---------------------------------------------------------------------------
# 7. SAVE ARTIFACTS
# ---------------------------------------------------------------------------

def save_artifacts(
    model: nn.Module,
    scaler: MinMaxScaler,
    feature_names: List[str],
    input_size: int,
    hidden_size: int,
    num_layers: int,
):
    """Save model weights, scaler parameters, and feature metadata."""
    MODEL_DIR.mkdir(parents=True, exist_ok=True)

    # Model weights
    torch.save(model.state_dict(), MODEL_PATH)
    print(f"\n  ✓ Model saved → {MODEL_PATH}")

    # Scaler
    scaler_data = {
        "min": scaler.data_min_.tolist(),
        "max": scaler.data_max_.tolist(),
        "scale": scaler.scale_.tolist(),
        "data_range": scaler.data_range_.tolist(),
    }
    with open(SCALER_PATH, "w") as f:
        json.dump(scaler_data, f, indent=2)
    print(f"  ✓ Scaler saved → {SCALER_PATH}")

    # Feature metadata (needed at inference time)
    meta = {
        "feature_names": feature_names,
        "input_size": input_size,
        "hidden_size": hidden_size,
        "num_layers": num_layers,
        "target_index": 0,  # conflict_events is column 0
    }
    with open(FEATURE_NAMES_PATH, "w") as f:
        json.dump(meta, f, indent=2)
    print(f"  ✓ Feature metadata saved → {FEATURE_NAMES_PATH}")


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Train Borno State LSTM")
    parser.add_argument("--epochs", type=int, default=100, help="Training epochs")
    parser.add_argument("--lr", type=float, default=0.001, help="Learning rate")
    parser.add_argument("--hidden", type=int, default=128, help="LSTM hidden size")
    parser.add_argument("--layers", type=int, default=2, help="LSTM layers")
    parser.add_argument("--seq-len", type=int, default=12, help="Look-back window (months)")
    parser.add_argument("--batch-size", type=int, default=16, help="Batch size")
    parser.add_argument("--dropout", type=float, default=0.2, help="Dropout rate")
    parser.add_argument("--train-split", type=float, default=0.8, help="Train/val split ratio")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    args = parser.parse_args()

    torch.manual_seed(args.seed)
    np.random.seed(args.seed)

    print("=" * 70)
    print("  Borno State LSTM — Humanitarian Time-Series Trainer")
    print("=" * 70)

    # 1. Scan data
    print("\nScanning data directory …")
    files = scan_data_files()
    if len(files) < 2:
        print("\n  ✗ Need at least 2 data sources. Found:", list(files.keys()))
        sys.exit(1)

    # 2. Extract features from each source
    conflict_df = extract_conflict(files["conflict"]) if "conflict" in files else pd.DataFrame()
    food_df = extract_food_prices(files["food_prices"]) if "food_prices" in files else pd.DataFrame()
    ipc_df = extract_ipc(files["ipc"]) if "ipc" in files else pd.DataFrame()
    idp_df = extract_idp(files["idp"]) if "idp" in files else pd.DataFrame()

    # 3. Build unified feature matrix
    features, feature_names = build_feature_matrix(conflict_df, food_df, ipc_df, idp_df)

    if features.empty:
        print("\n  ✗ Feature matrix is empty — nothing to train on.")
        sys.exit(1)

    # 4. Scale features
    scaler = MinMaxScaler()
    data_scaled = scaler.fit_transform(features.values)

    # Target column index (conflict_events is always first)
    target_idx = 0

    # 5. Create sequences
    X, y = create_sequences(data_scaled, seq_len=args.seq_len, target_idx=target_idx)
    print(f"\nSequences: X={X.shape}, y={y.shape}")

    if len(X) < 20:
        print("  ✗ Not enough sequences to train (need ≥ 20).")
        sys.exit(1)

    # 6. Train/val split
    split = int(len(X) * args.train_split)
    X_train, X_val = X[:split], X[split:]
    y_train, y_val = y[:split], y[split:]

    # 7. Build model
    input_size = X.shape[2]
    model = BornoLSTM(
        input_size=input_size,
        hidden_size=args.hidden,
        num_layers=args.layers,
        dropout=args.dropout,
    )
    total_params = sum(p.numel() for p in model.parameters())
    print(f"\nModel: {total_params:,} parameters")
    print(model)

    # 8. Train
    model = train_model(
        model, X_train, y_train, X_val, y_val,
        epochs=args.epochs,
        lr=args.lr,
        batch_size=args.batch_size,
    )

    # 9. Final evaluation
    model.eval()
    device = next(model.parameters()).device
    with torch.no_grad():
        val_pred = model(torch.tensor(X_val, dtype=torch.float32).to(device)).cpu().numpy()
    mse = float(np.mean((val_pred - y_val) ** 2))
    mae = float(np.mean(np.abs(val_pred - y_val)))
    print(f"\nFinal validation — MSE: {mse:.4f}, MAE: {mae:.4f}")

    # Inverse-transform a sample to show real values
    sample_idx = len(y_val) - 1
    sample_pred_scaled = val_pred[sample_idx]
    sample_true_scaled = y_val[sample_idx]
    # Inverse scale: construct a dummy row with the target in column 0
    dummy_pred = np.zeros((1, data_scaled.shape[1]))
    dummy_true = np.zeros((1, data_scaled.shape[1]))
    dummy_pred[0, 0] = sample_pred_scaled
    dummy_true[0, 0] = sample_true_scaled
    pred_real = scaler.inverse_transform(dummy_pred)[0, 0]
    true_real = scaler.inverse_transform(dummy_true)[0, 0]
    print(f"  Sample prediction: {pred_real:.1f} events vs actual {true_real:.1f} events")

    # 10. Save
    save_artifacts(model, scaler, feature_names, input_size, args.hidden, args.layers)

    print("\n" + "=" * 70)
    print("  Training complete!")
    print(f"  Model: {MODEL_PATH}")
    print(f"  Scaler: {SCALER_PATH}")
    print(f"  Metadata: {FEATURE_NAMES_PATH}")
    print("=" * 70)


if __name__ == "__main__":
    main()
