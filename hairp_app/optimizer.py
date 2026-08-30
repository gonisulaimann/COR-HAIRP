"""
optimizer.py — Borno State IDP Camp Logistics Optimizer

Implements a PuLP Mixed-Integer Linear Programming (MILP) solver and Monte Carlo
simulator for humanitarian convoy routing across five Borno State LGA nodes:
    Maiduguri · Bama · Monguno · Ngala · Konduga

Dual objectives
    Z1  Minimize total logistics transport + convoy fuel costs.
    Z2  Minimize social equity penalties weighted by IPC food-insecurity severity
        and unmet demand at vulnerable camp nodes.

Operational constraints
    Depot loading limits · Fleet availability (alpha_vt) · Camp storage (beta_ckt)
    Flow balance · Demand satisfaction

Monte Carlo module
    1 000 stochastic iterations sampling road closures and population surges,
    producing confidence intervals and optimised routing matrices.

Usage
    from hairp_app.optimizer import BornoOptimizer
    opt = BornoOptimizer()
    result = opt.solve()
    mc    = opt.monte_carlo(n_iter=1_000)
"""

from __future__ import annotations

import itertools
import json
import math
import os
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any, Dict, List, Optional, Sequence, Tuple

import numpy as np
import pandas as pd
from pulp import (
    LpBinary,
    LpContinuous,
    LpInteger,
    LpMinimize,
    LpProblem,
    LpStatus,
    LpStatusOptimal,
    LpVariable,
    lpSum,
    PULP_CBC_CMD,
)

# ---------------------------------------------------------------------------
# Constants
# ---------------------------------------------------------------------------

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
TARGET_LGAS = ["Maiduguri", "Bama", "Monguno", "Ngala", "Konduga"]

# Cost parameters (USD-equivalent per unit)
FUEL_COST_PER_KM = 1.85          # convoy fuel cost per vehicle-km
TRANSPORT_COST_PER_PPP_KM = 0.12 # supply transport cost per person-km
CAMPAIGN_COST_PER_TRIP = 250.0   # fixed dispatch cost per trip
EQUITY_PENALTY_SCALE = 50.0      # multiplier for unmet-demand penalty

# Depot capacity (persons-equivalent per planning period)
DEPOT_CAPACITY = {
    "Maiduguri": 500_000,
    "Bama": 150_000,
    "Monguno": 200_000,
    "Ngala": 160_000,
    "Konduga": 220_000,
}

# Fleet — total number of vehicles available per period per node
# alpha_vt[v, t]: availability flag (0/1) for vehicle v in period t
TOTAL_VEHICLES = 40

# Camp storage capacity (persons-equivalent)
BETA_CKT = {
    "Maiduguri": 350_000,
    "Bama": 120_000,
    "Monguno": 180_000,
    "Ngala": 130_000,
    "Konduga": 160_000,
}

VEHICLE_CAPACITY = 5_000  # persons per vehicle trip

# Conflict road closure probability per link per period
ROAD_CLOSURE_BASE_P = 0.12
# Population surge multiplier range (uniform)
SURGE_MIN, SURGE_MAX = 1.05, 1.40


# ---------------------------------------------------------------------------
# Utility helpers
# ---------------------------------------------------------------------------

def _haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Great-circle distance between two points in kilometres."""
    R = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1))
        * math.cos(math.radians(lat2))
        * math.sin(dlon / 2) ** 2
    )
    return R * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# ---------------------------------------------------------------------------
# Data loading from local data/ folder
# ---------------------------------------------------------------------------

def _load_lga_parameters() -> Dict[str, Dict[str, float]]:
    """
    Load real LGA-level IPC vulnerability, IDP population, and coordinates
    from the data/ folder, returning a parameter dict per LGA.
    """
    params: Dict[str, Dict[str, float]] = {}

    # --- IPC food-security data ---
    ipc_path = DATA_DIR / "ipc_nga_area_wide.csv"
    if ipc_path.exists():
        ipc = pd.read_csv(ipc_path)
        borno = ipc[ipc["Level 1"].str.contains("Borno", case=False, na=False)]
        target = borno[borno["Area"].isin(TARGET_LGAS)]
        if not target.empty:
            latest = (
                target.sort_values("Date of analysis", ascending=False)
                .groupby("Area")
                .first()
            )
            for area in TARGET_LGAS:
                if area in latest.index:
                    row = latest.loc[area]
                    params.setdefault(area, {})
                    params[area]["ipc_phase3p_pct"] = float(
                        row.get("Phase 3+ percentage current", 0.35)
                    )
                    params[area]["ipc_pop_analyzed"] = float(
                        row.get("Population analyzed current", 100_000)
                    )
                    params[area]["ipc_phase3p_pop"] = float(
                        row.get("Phase 3+ number current", 30_000)
                    )
                    # Vulnerability weight: higher phase 3+ % → higher penalty
                    params[area]["vulnerability_weight"] = max(
                        params[area]["ipc_phase3p_pct"] * 2.0, 1.0
                    )

    # --- IDP population data ---
    idp_path = DATA_DIR / "hdx_dtm_nigeria_r43_master_list_idp.xlsx"
    if idp_path.exists():
        idf = pd.read_excel(idp_path, sheet_name=0)
        idf = idf[idf["Population type"] != "#date+reported"].copy()
        borno = idf[idf["State"].str.contains("Borno", case=False, na=False)].copy()
        borno["Individuals"] = pd.to_numeric(borno["Individuals"], errors="coerce").fillna(0)
        for lga in TARGET_LGAS:
            lga_data = borno[borno["LGA"] == lga]
            if not lga_data.empty:
                params.setdefault(lga, {})
                params[lga]["idp_population"] = float(lga_data["Individuals"].sum())
                params[lga]["idp_camps"] = float(lga_data["SITE NAME"].nunique())
                params[lga]["lat"] = float(lga_data["latitude"].mean())
                params[lga]["lon"] = float(lga_data["longitude"].mean())

    # --- Fill defaults for any missing LGAs ---
    defaults = {
        "Maiduguri": {"lat": 11.85, "lon": 13.15, "idp_population": 239_153, "vulnerability_weight": 1.6},
        "Bama":      {"lat": 11.52, "lon": 13.68, "idp_population": 133_365, "vulnerability_weight": 1.5},
        "Monguno":   {"lat": 12.67, "lon": 13.61, "idp_population": 161_520, "vulnerability_weight": 2.0},
        "Ngala":     {"lat": 12.40, "lon": 14.19, "idp_population": 107_574, "vulnerability_weight": 2.1},
        "Konduga":   {"lat": 11.82, "lon": 13.07, "idp_population": 115_503, "vulnerability_weight": 1.6},
    }
    for lga in TARGET_LGAS:
        params.setdefault(lga, {})
        for k, v in defaults[lga].items():
            params[lga].setdefault(k, v)

    return params


def _build_distance_matrix(lga_params: Dict[str, Dict[str, float]]) -> pd.DataFrame:
    """Compute pairwise haversine distances between LGAs."""
    dist = pd.DataFrame(0.0, index=TARGET_LGAS, columns=TARGET_LGAS)
    for i, l1 in enumerate(TARGET_LGAS):
        for l2 in TARGET_LGAS[i + 1:]:
            d = _haversine_km(
                lga_params[l1]["lat"], lga_params[l1]["lon"],
                lga_params[l2]["lat"], lga_params[l2]["lon"],
            )
            dist.loc[l1, l2] = d
            dist.loc[l2, l1] = d
    return dist


# ---------------------------------------------------------------------------
# Demand scenarios
# ---------------------------------------------------------------------------

def _compute_monthly_demand(
    lga_params: Dict[str, Dict[str, float]],
    n_periods: int = 4,
    surge_range: Tuple[float, float] = (1.0, 1.0),
) -> pd.DataFrame:
    """
    Compute monthly demand (persons requiring aid) per LGA.
    Base demand = IPC Phase 3+ population; optionally scaled by surge.
    """
    demands = []
    for t in range(n_periods):
        row = {}
        for lga in TARGET_LGAS:
            base = lga_params[lga].get("ipc_phase3p_pop", 30_000)
            surge = np.random.uniform(*surge_range)
            row[lga] = base * surge
        demands.append(row)
    return pd.DataFrame(demands, index=range(n_periods))


# ---------------------------------------------------------------------------
# MILP Model
# ---------------------------------------------------------------------------

@dataclass
class SolveResult:
    """Container for solver output."""
    status: str
    objective_z1: float
    objective_z2: float
    combined_objective: float
    supply: pd.DataFrame        # x[i,j,t]  — supply shipped per link per period
    vehicle_trips: pd.DataFrame # y[v,t]    — vehicle-trip assignments per period
    camp_allocation: pd.DataFrame  # w[c,k,t] — allocation to camps
    unmet_demand: pd.DataFrame
    total_cost_z1: float
    total_equity_penalty_z2: float
    route_matrix: pd.DataFrame  # summary: which links are active per period
    solve_time_s: float


class BornoOptimizer:
    """
    PuLP-based MILP optimizer for Borno State IDP camp logistics.

    Parameters
    ----------
    n_periods : int
        Number of planning periods (months) in the horizon.
    alpha_vt : dict[tuple[str,int], float] | None
        Fleet availability matrix.  Key (vehicle_id, period) → 0|1.
        If None, all vehicles available in all periods.
    depot_loading : dict[str, float] | None
        Max outflow per depot per period.  Overrides DEPOT_CAPACITY.
    beta_ckt : dict[str, float] | None
        Camp storage capacity per LGA.  Overrides BETA_CKT.
    equity_weight : float
        Weight for Z2 in the combined objective:  min Z1 + equity_weight · Z2
    seed : int
        Random seed for reproducibility.
    """

    def __init__(
        self,
        n_periods: int = 4,
        alpha_vt: Optional[Dict[Tuple[str, int], float]] = None,
        depot_loading: Optional[Dict[str, float]] = None,
        beta_ckt: Optional[Dict[str, float]] = None,
        equity_weight: float = 0.4,
        seed: int = 42,
    ):
        self.n_periods = n_periods
        self.equity_weight = equity_weight
        self.seed = seed
        np.random.seed(seed)

        # Load real parameters from data/
        self.lga_params = _load_lga_parameters()
        self.dist = _build_distance_matrix(self.lga_params)

        # Overridable parameters
        self.depot_capacity = dict(depot_loading) if depot_loading else dict(DEPOT_CAPACITY)
        self.beta_ckt = dict(beta_ckt) if beta_ckt else dict(BETA_CKT)

        # Fleet availability matrix alpha_vt
        if alpha_vt is not None:
            self.alpha_vt = alpha_vt
        else:
            self.alpha_vt = {
                (f"veh_{v}", t): 1.0
                for v in range(TOTAL_VEHICLES)
                for t in range(n_periods)
            }

        # Node sets
        self.depots = TARGET_LGAS          # every LGA can act as a source
        self.camps = TARGET_LGAS           # destination camp nodes
        self.vehicles = [f"veh_{v}" for v in range(TOTAL_VEHICLES)]
        self.links = [(i, j) for i in self.depots for j in self.camps if i != j]

        # Demand per period
        self.demand = _compute_monthly_demand(
            self.lga_params, n_periods=n_periods
        )

        # Vulnerability weights per camp
        self.vuln_weight = {
            lga: self.lga_params[lga].get("vulnerability_weight", 1.5)
            for lga in TARGET_LGAS
        }

    # ------------------------------------------------------------------
    # Build and solve the MILP
    # ------------------------------------------------------------------

    def solve(self, verbose: bool = False) -> SolveResult:
        """
        Formulate and solve the dual-objective MILP.

        Objective
        ---------
            min  Z1 + equity_weight · Z2

        where
            Z1 = Σ_{i,j,t}  [transport_cost(i,j) · x(i,j,t)]
                         +  Σ_{v,t}  CAMPAIGN_COST_PER_TRIP · y(v,t)
                         +  Σ_{i,j,t}  FUEL_COST_PER_KM · dist(i,j) · ceil(x(i,j,t) / VEH_CAP)

            Z2 = Σ_{c,t}  vulnerability_weight(c) · unmet(c,t)
        """
        import time
        t_start = time.perf_counter()

        prob = LpProblem("Borno_IDP_Logistics", LpMinimize)

        # --- Decision variables ---
        # x[i,j,t]: supply shipped from depot i to camp j in period t (persons)
        x = {
            (i, j, t): LpVariable(f"x_{i}_{j}_{t}", lowBound=0, cat=LpContinuous)
            for i in self.depots
            for j in self.camps
            for t in range(self.n_periods)
            if i != j
        }

        # y[v,t]: 1 if vehicle v is dispatched in period t
        y = {
            (v, t): LpVariable(f"y_{v}_{t}", cat=LpBinary)
            for v in self.vehicles
            for t in range(self.n_periods)
        }

        # w[c,t]: supply allocated to camp c in period t
        w = {
            (c, t): LpVariable(f"w_{c}_{t}", lowBound=0, cat=LpContinuous)
            for c in self.camps
            for t in range(self.n_periods)
        }

        # u[c,t]: unmet demand at camp c in period t
        u = {
            (c, t): LpVariable(f"u_{c}_{t}", lowBound=0, cat=LpContinuous)
            for c in self.camps
            for t in range(self.n_periods)
        }

        # n_trips[i,j,t]: number of vehicle trips on link (i,j) in period t
        n_trips = {
            (i, j, t): LpVariable(
                f"ntrips_{i}_{j}_{t}", lowBound=0, cat=LpInteger
            )
            for i, j, t in x
        }

        # --- Objective function Z1: logistics cost ---
        # Transport cost
        transport_cost = lpSum(
            TRANSPORT_COST_PER_PPP_KM * self.dist.loc[i, j] * x[i, j, t]
            for i, j, t in x
        )

        # Fuel cost (based on number of trips)
        fuel_cost = lpSum(
            FUEL_COST_PER_KM * self.dist.loc[i, j] * n_trips[i, j, t]
            for i, j, t in x
        )

        # Fixed dispatch cost
        dispatch_cost = lpSum(
            CAMPAIGN_COST_PER_TRIP * n_trips[i, j, t] for i, j, t in x
        )

        Z1 = transport_cost + fuel_cost + dispatch_cost

        # --- Objective function Z2: equity penalty ---
        Z2 = lpSum(
            self.vuln_weight[c] * u[c, t]
            for c in self.camps
            for t in range(self.n_periods)
        )

        # Combined objective
        prob += Z1 + self.equity_weight * Z2, "Combined_Objective"

        # ==============================================================
        # CONSTRAINTS
        # ==============================================================

        for t in range(self.n_periods):
            # --- C1: Depot loading limits (alpha_vt enforces fleet) ---
            for i in self.depots:
                outflow = lpSum(x[i, j, t] for j in self.camps if j != i)
                prob += (
                    outflow <= self.depot_capacity.get(i, 500_000),
                    f"depot_load_{i}_{t}",
                )

            # --- C2: Fleet availability (alpha_vt) ---
            # Total dispatched vehicles cannot exceed available fleet
            total_dispatched = lpSum(y[v, t] for v in self.vehicles)
            # alpha_vt availability: sum of available vehicles this period
            available = sum(
                self.alpha_vt.get((v, t), 1.0) for v in self.vehicles
            )
            prob += (
                total_dispatched <= available,
                f"fleet_avail_{t}",
            )

            # --- C3: Camp storage capacity (beta_ckt) ---
            for c in self.camps:
                prob += (
                    w[c, t] <= self.beta_ckt.get(c, 200_000),
                    f"camp_storage_{c}_{t}",
                )

            # --- C4: Flow balance — allocated = incoming supply ---
            for c in self.camps:
                incoming = lpSum(x[i, c, t] for i in self.depots if i != c)
                prob += (
                    w[c, t] == incoming,
                    f"flow_balance_{c}_{t}",
                )

            # --- C5: Demand satisfaction ---
            demand_t = self.demand.loc[t]
            for c in self.camps:
                prob += (
                    w[c, t] + u[c, t] == demand_t[c],
                    f"demand_sat_{c}_{t}",
                )

            # --- C6: Vehicle capacity linking trips to flow ---
            for i, j, t_key in x:
                if t_key != t:
                    continue
                # Each trip carries at most VEHICLE_CAPACITY persons
                prob += (
                    x[i, j, t] <= n_trips[i, j, t] * VEHICLE_CAPACITY,
                    f"veh_cap_upper_{i}_{j}_{t}",
                )
                # Trips are integer and bounded by dispatched vehicles
                prob += (
                    n_trips[i, j, t] <= TOTAL_VEHICLES * y[self.vehicles[0], t],
                    f"veh_link_{i}_{j}_{t}",
                )

            # --- C7: Each vehicle used at most once per period across all links ---
            total_vehicle_usage = lpSum(
                n_trips[i, j, t] for i, j, t_key in x if t_key == t
            )
            prob += (
                total_vehicle_usage <= TOTAL_VEHICLES,
                f"single_use_{t}",
            )

            # --- C8: Minimum service — each camp gets at least 15% of demand ---
            MIN_SERVICE_FRACTION = 0.15
            for c in self.camps:
                prob += (
                    w[c, t] >= MIN_SERVICE_FRACTION * demand_t[c],
                    f"min_service_{c}_{t}",
                )

        # ==============================================================
        # SOLVE
        # ==============================================================
        solver = PULP_CBC_CMD(msg=int(verbose), timeLimit=120)
        prob.solve(solver)

        solve_time = time.perf_counter() - t_start
        status = LpStatus.get(prob.status, "Unknown")

        if verbose:
            print(f"  Solver status: {status}  ({solve_time:.1f}s)")

        # --- Extract results ---
        supply_data = {(i, j, t): x[i, j, t].varValue or 0.0 for i, j, t in x}
        supply_records = [
            {"from": i, "to": j, "period": t, "supply": v}
            for (i, j, t), v in supply_data.items()
            if v > 0.01
        ]
        supply_df = pd.DataFrame(supply_records) if supply_records else pd.DataFrame(columns=["from", "to", "period", "supply"])

        vehicle_data = {(v, t): y[v, t].varValue or 0.0 for v, t in y}
        vehicle_records = [
            {"vehicle": v, "period": t, "assigned": val}
            for (v, t), val in vehicle_data.items()
            if val > 0.5
        ]
        vehicle_df = pd.DataFrame(vehicle_records) if vehicle_records else pd.DataFrame(columns=["vehicle", "period", "assigned"])

        camp_alloc = {(c, t): w[c, t].varValue or 0.0 for c, t in w}
        camp_df = pd.DataFrame(
            [{"camp": c, "period": t, "allocated": v} for (c, t), v in camp_alloc.items()]
        )

        unmet_data = {(c, t): u[c, t].varValue or 0.0 for c, t in u}
        unmet_df = pd.DataFrame(
            [{"camp": c, "period": t, "unmet_demand": v} for (c, t), v in unmet_data.items()]
        )

        total_z1 = sum(
            TRANSPORT_COST_PER_PPP_KM * self.dist.loc[i, j] * supply_data.get((i, j, t), 0)
            + FUEL_COST_PER_KM * self.dist.loc[i, j] * (supply_data.get((i, j, t), 0) / VEHICLE_CAPACITY)
            for i, j, t in x
            if supply_data.get((i, j, t), 0) > 0.01
        ) + CAMPAIGN_COST_PER_TRIP * len(vehicle_df)

        total_z2 = sum(
            self.vuln_weight[c] * unmet_data.get((c, t), 0)
            for c, t in u
        )

        # Route summary matrix (link → total supply across all periods)
        if not supply_df.empty:
            route_matrix = (
                supply_df.groupby(["from", "to"])["supply"]
                .sum()
                .reset_index()
                .pivot(index="from", columns="to", values="supply")
                .fillna(0)
            )
        else:
            route_matrix = pd.DataFrame(0.0, index=TARGET_LGAS, columns=TARGET_LGAS)

        return SolveResult(
            status=status,
            objective_z1=total_z1,
            objective_z2=total_z2,
            combined_objective=total_z1 + self.equity_weight * total_z2,
            supply=supply_df,
            vehicle_trips=vehicle_df,
            camp_allocation=camp_df,
            unmet_demand=unmet_df,
            total_cost_z1=total_z1,
            total_equity_penalty_z2=total_z2,
            route_matrix=route_matrix,
            solve_time_s=solve_time,
        )

    # ------------------------------------------------------------------
    # Monte Carlo Simulation
    # ------------------------------------------------------------------

    def monte_carlo(
        self,
        n_iter: int = 1_000,
        road_closure_prob: float = ROAD_CLOSURE_BASE_P,
        surge_range: Tuple[float, float] = (SURGE_MIN, SURGE_MAX),
        verbose: bool = True,
    ) -> Dict[str, Any]:
        """
        Run 1 000 stochastic iterations of the MILP under randomised
        conflict road closures and sudden IDP population surges.

        For each iteration:
            1. Sample a road-closure mask for every link (i,j) at random
               with probability `road_closure_prob`.
            2. Sample a demand surge multiplier per LGA from uniform
               [surge_range].
            3. Re-solve the MILP with the perturbed parameters.

        Returns
        -------
        dict with keys:
            solutions   : list of SolveResult (one per iteration)
            summary     : DataFrame of cost/unmet per iteration
            ci_cost_95  : (lower, upper) 95% CI of total cost
            ci_unmet_95 : (lower, upper) 95% CI of total unmet demand
            ci_cost_80  : (lower, upper) 80% CI of total cost
            ci_unmet_80 : (lower, upper) 80% CI of total unmet demand
            mean_cost   : mean total cost
            mean_unmet  : mean total unmet demand
            route_freq  : DataFrame — fraction of iterations each link is active
            best_result : SolveResult with lowest combined objective
            worst_result: SolveResult with highest combined objective
        """
        if verbose:
            print(f"\n{'='*60}")
            print(f"  Monte Carlo Simulation  —  {n_iter:,} iterations")
            print(f"  Road closure prob: {road_closure_prob:.0%}")
            print(f"  Surge range: {surge_range}")
            print(f"{'='*60}")

        solutions: List[SolveResult] = []
        summaries: List[Dict[str, Any]] = []

        # Track which links are used in each iteration
        link_usage: Dict[Tuple[str, str], int] = {(i, j): 0 for i, j in self.links}

        for it in range(n_iter):
            # --- Perturb road network ---
            closed_links = set()
            for i, j in self.links:
                if np.random.random() < road_closure_prob:
                    closed_links.add((i, j))

            # Create penalised distance: infinite cost for closed links
            # We handle this by setting depot_capacity to 0 for closed links
            # and by rebuilding the solver with modified parameters

            # --- Perturb demand ---
            surge_multipliers = {
                lga: np.random.uniform(*surge_range) for lga in TARGET_LGAS
            }
            perturbed_demand = self.demand.copy()
            for c in TARGET_LGAS:
                perturbed_demand[c] *= surge_multipliers[c]

            # --- Perturb fleet (random vehicle breakdowns) ---
            perturbed_alpha = dict(self.alpha_vt)
            for v in self.vehicles:
                for t in range(self.n_periods):
                    if np.random.random() < 0.05:  # 5% breakdown rate
                        perturbed_alpha[(v, t)] = 0.0

            # --- Build perturbed optimizer ---
            opt = BornoOptimizer(
                n_periods=self.n_periods,
                alpha_vt=perturbed_alpha,
                depot_loading=self.depot_capacity,
                beta_ckt=self.beta_ckt,
                equity_weight=self.equity_weight,
                seed=self.seed + it,
            )

            # Inject perturbed demand
            opt.demand = perturbed_demand

            # Apply road closures: zero out depot capacity for closed links
            # by creating a modified depot_capacity that forces flow=0
            # on closed links via the constraint system.
            # We do this by setting very low depot capacity if ALL outgoing
            # links from a node are closed (edge case).
            for i, j in closed_links:
                # Reduce capacity of source depot for this period
                # The MILP will naturally route around closed links
                # by setting the relevant x[i,j,t] to 0 through cost
                pass

            # Instead of modifying capacities, we inject penalty for using
            # closed links by scaling their transport cost to infinity.
            # We do this by temporarily patching the dist matrix:
            original_costs = {}
            for i, j in closed_links:
                original_costs[(i, j)] = opt.dist.loc[i, j]
                opt.dist.loc[i, j] = 1_000_000  # near-infinite cost

            # Solve perturbed instance
            try:
                result = opt.solve(verbose=False)
                solutions.append(result)

                # Track link usage (handle empty supply DataFrame)
                if not result.supply.empty:
                    for _, row in result.supply.iterrows():
                        link = (row["from"], row["to"])
                        if link in link_usage:
                            link_usage[link] += 1

                total_unmet = result.unmet_demand["unmet_demand"].sum()
                summaries.append({
                    "iteration": it,
                    "total_cost_z1": result.total_cost_z1,
                    "equity_penalty_z2": result.total_equity_penalty_z2,
                    "combined_obj": result.combined_objective,
                    "total_unmet_demand": total_unmet,
                    "n_links_active": len(result.supply),
                    "n_vehicles_used": len(result.vehicle_trips),
                    "n_roads_closed": len(closed_links),
                    "status": result.status,
                })

            except Exception as e:
                # Record as failed (solver error / infeasible)
                summaries.append({
                    "iteration": it,
                    "total_cost_z1": float("inf"),
                    "equity_penalty_z2": float("inf"),
                    "combined_obj": float("inf"),
                    "total_unmet_demand": float("inf"),
                    "n_links_active": 0,
                    "n_vehicles_used": 0,
                    "n_roads_closed": len(closed_links),
                    "status": "Failed",
                })

            # Restore distances
            for (i, j), val in original_costs.items():
                opt.dist.loc[i, j] = val

            # Progress
            if verbose and ((it + 1) % 200 == 0 or it == 0):
                valid = [s for s in summaries if s["status"] == "Optimal"]
                if valid:
                    avg_cost = np.mean([s["total_cost_z1"] for s in valid])
                    avg_unmet = np.mean([s["total_unmet_demand"] for s in valid])
                    print(
                        f"  [{it+1:4d}/{n_iter}] "
                        f"avg_cost=${avg_cost:,.0f}  "
                        f"avg_unmet={avg_unmet:,.0f}  "
                        f"valid={len(valid)}"
                    )

        # --- Compute confidence intervals ---
        summary_df = pd.DataFrame(summaries)
        valid_df = summary_df[summary_df["status"] == "Optimal"].copy()

        if valid_df.empty:
            print("  ⚠ No valid solutions found in Monte Carlo run.")
            return {
                "solutions": solutions,
                "summary": summary_df,
                "ci_cost_95": (0, 0),
                "ci_unmet_95": (0, 0),
                "ci_cost_80": (0, 0),
                "ci_unmet_80": (0, 0),
                "mean_cost": 0,
                "mean_unmet": 0,
                "route_freq": pd.DataFrame(),
                "best_result": None,
                "worst_result": None,
            }

        ci_cost_95 = (
            float(np.percentile(valid_df["total_cost_z1"], 2.5)),
            float(np.percentile(valid_df["total_cost_z1"], 97.5)),
        )
        ci_unmet_95 = (
            float(np.percentile(valid_df["total_unmet_demand"], 2.5)),
            float(np.percentile(valid_df["total_unmet_demand"], 97.5)),
        )
        ci_cost_80 = (
            float(np.percentile(valid_df["total_cost_z1"], 10)),
            float(np.percentile(valid_df["total_cost_z1"], 90)),
        )
        ci_unmet_80 = (
            float(np.percentile(valid_df["total_unmet_demand"], 10)),
            float(np.percentile(valid_df["total_unmet_demand"], 90)),
        )

        mean_cost = float(valid_df["total_cost_z1"].mean())
        mean_unmet = float(valid_df["total_unmet_demand"].mean())

        # Route frequency matrix
        total_valid = len(valid_df)
        route_freq_data = {}
        for (i, j), count in link_usage.items():
            route_freq_data[(i, j)] = count / max(total_valid, 1)
        route_freq = pd.DataFrame(
            [
                {"from": i, "to": j, "frequency": f}
                for (i, j), f in route_freq_data.items()
            ]
        )
        if not route_freq.empty:
            route_freq = (
                route_freq.pivot(index="from", columns="to", values="frequency")
                .fillna(0)
                .round(3)
            )

        # Best / worst solutions
        best_idx = valid_df["combined_obj"].idxmin()
        worst_idx = valid_df["combined_obj"].idxmax()
        best_result = solutions[best_idx] if best_idx < len(solutions) else None
        worst_result = solutions[worst_idx] if worst_idx < len(solutions) else None

        if verbose:
            print(f"\n  {'─'*50}")
            print(f"  Monte Carlo Results ({len(valid_df):,} valid / {n_iter:,} total)")
            print(f"  {'─'*50}")
            print(f"  Total cost (Z1):")
            print(f"    Mean:  ${mean_cost:>12,.2f}")
            print(f"    80% CI: [${ci_cost_80[0]:>12,.2f}, ${ci_cost_80[1]:>12,.2f}]")
            print(f"    95% CI: [${ci_cost_95[0]:>12,.2f}, ${ci_cost_95[1]:>12,.2f}]")
            print(f"  Unmet demand (weighted):")
            print(f"    Mean:  {mean_unmet:>12,.0f}")
            print(f"    80% CI: [{ci_unmet_80[0]:>12,.0f}, {ci_unmet_80[1]:>12,.0f}]")
            print(f"    95% CI: [{ci_unmet_95[0]:>12,.0f}, {ci_unmet_95[1]:>12,.0f}]")
            print(f"\n  Route frequency matrix (% of iterations active):")
            if not route_freq.empty:
                print(route_freq.to_string())
            print()

        return {
            "solutions": solutions,
            "summary": summary_df,
            "ci_cost_95": ci_cost_95,
            "ci_unmet_95": ci_unmet_95,
            "ci_cost_80": ci_cost_80,
            "ci_unmet_80": ci_unmet_80,
            "mean_cost": mean_cost,
            "mean_unmet": mean_unmet,
            "route_freq": route_freq,
            "best_result": best_result,
            "worst_result": worst_result,
        }


# ---------------------------------------------------------------------------
# Convenience CLI
# ---------------------------------------------------------------------------

def main():
    """Run a single solve + Monte Carlo and print a summary report."""
    import argparse

    parser = argparse.ArgumentParser(description="Borno IDP logistics optimizer")
    parser.add_argument("--periods", type=int, default=4, help="Planning periods")
    parser.add_argument("--mc-iter", type=int, default=1000, help="Monte Carlo iterations")
    parser.add_argument("--equity-w", type=float, default=0.4, help="Equity weight in Z2")
    parser.add_argument("--seed", type=int, default=42, help="Random seed")
    parser.add_argument("--verbose", action="store_true", help="Verbose solver output")
    parser.add_argument("--mc-only", action="store_true", help="Skip single solve, go straight to MC")
    args = parser.parse_args()

    print("=" * 70)
    print("  Borno State IDP Camp Logistics Optimizer")
    print("  PuLP MILP + Monte Carlo Simulation")
    print("=" * 70)

    opt = BornoOptimizer(
        n_periods=args.periods,
        equity_weight=args.equity_w,
        seed=args.seed,
    )

    # --- Single deterministic solve ---
    if not args.mc_only:
        print("\n▸ Deterministic MILP solve …")
        result = opt.solve(verbose=args.verbose)

        print(f"\n  Status: {result.status}")
        print(f"  Solve time: {result.solve_time_s:.1f}s")
        print(f"\n  Objective Z1 (logistics cost):  ${result.total_cost_z1:,.2f}")
        print(f"  Objective Z2 (equity penalty):   {result.total_equity_penalty_z2:,.2f}")
        print(f"  Combined (Z1 + {args.equity_w}·Z2):  ${result.combined_objective:,.2f}")

        print(f"\n  Supply shipped (persons):")
        if not result.supply.empty:
            print(result.supply.to_string(index=False))
        else:
            print("    (no shipments)")

        print(f"\n  Unmet demand per camp per period:")
        if not result.unmet_demand.empty:
            piv = result.unmet_demand.pivot(index="camp", columns="period", values="unmet_demand")
            print(piv.to_string())
        else:
            print("    (none)")

        print(f"\n  Route matrix (total persons shipped):")
        if not result.route_matrix.empty:
            print(result.route_matrix.to_string())

    # --- Monte Carlo ---
    print("\n▸ Monte Carlo simulation …")
    mc = opt.monte_carlo(
        n_iter=args.mc_iter,
        verbose=True,
    )

    print("\n" + "=" * 70)
    print("  Summary")
    print("=" * 70)
    print(f"  Valid iterations:  {len(mc['summary'][mc['summary']['status']=='Optimal']):,} / {args.mc_iter:,}")
    print(f"  Mean cost (Z1):    ${mc['mean_cost']:>12,.2f}")
    print(f"  Mean unmet demand: {mc['mean_unmet']:>12,.0f}")
    print(f"  95% CI (cost):     [${mc['ci_cost_95'][0]:,.2f}, ${mc['ci_cost_95'][1]:,.2f}]")
    print(f"  95% CI (unmet):    [{mc['ci_unmet_95'][0]:,.0f}, {mc['ci_unmet_95'][1]:,.0f}]")
    print(f"  80% CI (cost):     [${mc['ci_cost_80'][0]:,.2f}, ${mc['ci_cost_80'][1]:,.2f}]")
    print(f"  80% CI (unmet):    [{mc['ci_unmet_80'][0]:,.0f}, {mc['ci_unmet_80'][1]:,.0f}]")

    if mc["best_result"] is not None:
        print(f"\n  Best-case scenario (lowest combined objective):")
        br = mc["best_result"]
        print(f"    Cost: ${br.total_cost_z1:,.2f}  |  Unmet: {br.unmet_demand['unmet_demand'].sum():,.0f}")
    if mc["worst_result"] is not None:
        print(f"\n  Worst-case scenario (highest combined objective):")
        wr = mc["worst_result"]
        print(f"    Cost: ${wr.total_cost_z1:,.2f}  |  Unmet: {wr.unmet_demand['unmet_demand'].sum():,.0f}")

    if not mc["route_freq"].empty:
        print(f"\n  Route frequency matrix (% of iterations active):")
        print(mc["route_freq"].to_string())

    print("\n" + "=" * 70)


if __name__ == "__main__":
    main()
