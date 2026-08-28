/**
 * OptimizerPage.tsx   MILP Supply Chain Optimizer with Monte Carlo simulation.
 *
 * MC iterations. Runs the optimizer and displays KPI cards, unmet demand
 * bar chart, and route matrix table.
 */
import { optimize } from "@/api";
import GlassCard from "@/components/GlassCard";
import type { OptimizeResponse } from "@/types";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function OptimizerPage() {
  const [periods, setPeriods] = useState(4);
  const [equity, setEquity] = useState(0.4);
  const [mcIter, setMcIter] = useState(100);
  const [result, setResult] = useState<OptimizeResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await optimize(periods, equity, mcIter));
    } catch {
      setError("Optimizer failed   solver may not be available");
    } finally {
      setLoading(false);
    }
  };

  const unmetData = result
    ? Object.entries(result.unmet_demand).map(([camp, unmet]) => ({
        camp,
        unmet,
      }))
    : [];

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
        MILP Supply Chain Optimizer
      </h1>
      <p className="text-sm text-surface-400 mb-4 animate-fade-in">
        Bi-objective vehicle routing with Monte Carlo simulation
      </p>

      {/* Controls */}
      <GlassCard className="p-5 mb-5 animate-fade-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              Periods: {periods}
            </label>
            <input
              type="range"
              min={1}
              max={12}
              value={periods}
              onChange={(e) => setPeriods(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              Equity Weight: {equity.toFixed(2)}
            </label>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={equity}
              onChange={(e) => setEquity(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              MC Iterations: {mcIter}
            </label>
            <input
              type="range"
              min={10}
              max={500}
              step={10}
              value={mcIter}
              onChange={(e) => setMcIter(parseInt(e.target.value))}
              className="w-full"
            />
          </div>

          <button
            onClick={run}
            disabled={loading}
            className="py-2.5 rounded-btn font-semibold text-[0.85rem] text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50"
          >
            {loading ? "Solving..." : "Run Optimizer"}
          </button>
        </div>
      </GlassCard>

      {error && (
        <div className="bg-un-red/10 border border-un-red/30 rounded-btn px-4 py-3 text-[#FCA5A5] text-sm mb-4">
          {error}
        </div>
      )}

      {result && (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-5 animate-fade-in-up">
            {[
              {
                label: "Total Cost (Z1)",
                value: `$${result.total_cost.toLocaleString()}`,
                color: "bg-un-green",
              },
              {
                label: "Equity Penalty (Z2)",
                value: result.equity_penalty.toLocaleString(),
                color: "bg-un-amber",
              },
              {
                label: "Solver Status",
                value: result.status,
                color: "bg-un-blue",
              },
              {
                label: "Solve Time",
                value: `${result.solve_time_s.toFixed(1)}s`,
                color: "bg-un-blue",
              },
              ...(result.mc_mean_cost != null
                ? [
                    {
                      label: "MC Mean Cost",
                      value: `$${result.mc_mean_cost.toLocaleString()}`,
                      color: "bg-un-blue",
                    },
                  ]
                : []),
              ...(result.mc_95_ci
                ? [
                    {
                      label: "95% CI",
                      value: `$${result.mc_95_ci[0].toLocaleString()}   $${result.mc_95_ci[1].toLocaleString()}`,
                      color: "bg-un-blue",
                    },
                  ]
                : []),
            ].map((kpi, i) => (
              <div
                key={i}
                className="relative overflow-hidden rounded-card border border-white/[0.06] bg-dark-card/55 p-4 animate-fade-in-up"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div
                  className={`absolute left-0 top-0 bottom-0 w-[3px] rounded-l-card ${kpi.color}`}
                />
                <p className="text-lg font-extrabold text-dark-text">
                  {kpi.value}
                </p>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[1.2px] text-surface-500 mt-0.5">
                  {kpi.label}
                </p>
              </div>
            ))}
          </div>

          {/* Unmet Demand Chart */}
          {unmetData.length > 0 && (
            <GlassCard className="p-5 animate-fade-in-up">
              <h3 className="text-sm font-bold text-dark-text mb-4">
                Unmet Demand per Camp
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={unmetData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.06)"
                  />
                  <XAxis
                    dataKey="camp"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#64748B" }} />
                  <Tooltip
                    contentStyle={{
                      background: "rgba(19,24,37,0.95)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 8,
                      fontSize: "0.8rem",
                    }}
                  />
                  <Bar dataKey="unmet" fill="#CF3A24" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          )}

          {/* Route Matrix */}
          {Object.keys(result.route_summary).length > 0 && (
            <GlassCard className="p-5 mt-4 animate-fade-in-up">
              <h3 className="text-sm font-bold text-dark-text mb-4">
                Active Route Matrix
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-[0.78rem] border-collapse">
                  <thead>
                    <tr>
                      <th className="p-2 text-left text-surface-500 border-b border-white/[0.06]">
                        From
                      </th>
                      {Object.keys(result.route_summary).map((from) => (
                        <th
                          key={from}
                          className="p-2 text-center text-surface-500 border-b border-white/[0.06]"
                        >
                          {from}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(result.route_summary).map((from) => (
                      <tr key={from}>
                        <td className="p-2 font-semibold text-dark-text">
                          {from}
                        </td>
                        {Object.keys(result.route_summary).map((to) => (
                          <td
                            key={to}
                            className="p-2 text-center text-dark-text"
                          >
                            {result.route_summary[from][to]
                              ? result.route_summary[from][to].toLocaleString()
                              : " "}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          )}
        </>
      )}
    </div>
  );
}
