/**
 * ForecastPage.tsx   Deep Learning Inference Engine with interactive controls.
 *
 * factor slider. Fetches initial data on mount, re-fetches when the user
 * clicks "Run Forecast". Shows forecast chart, sensitivity chart, and
 * multi-LGA comparison.
 */
import { forecast, getSensitivity, multiLgaForecast } from "@/api";
import ForecastChart from "@/components/ForecastChart";
import GlassCard from "@/components/GlassCard";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import SensitivityChart from "@/components/SensitivityChart";
import type { ForecastResponse, SensitivityRow } from "@/types";
import { useEffect, useState } from "react";

const LGAS = ["Maiduguri", "Bama", "Monguno", "Ngala", "Konduga"] as const;

export default function ForecastPage() {
  const [lga, setLga] = useState<string>("Maiduguri");
  const [horizon, setHorizon] = useState(12);
  const [escalation, setEscalation] = useState(1.0);
  const [data, setData] = useState<ForecastResponse | null>(null);
  const [sensitivity, setSensitivity] = useState<SensitivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [predicting, setPredicting] = useState(false);

  useEffect(() => {
    Promise.all([
      forecast(lga, horizon, escalation),
      getSensitivity(),
      multiLgaForecast(),
    ])
      .then(([f, s]) => {
        setData(f);
        setSensitivity(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const runForecast = async () => {
    setPredicting(true);
    try {
      setData(await forecast(lga, horizon, escalation));
    } catch (e) {
      console.error(e);
    } finally {
      setPredicting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
          Deep Learning Inference Engine
        </h1>
        <LoadingSkeleton count={2} height="300px" />
      </div>
    );
  }

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in">
        Deep Learning Inference Engine
      </h1>
      <p className="text-sm text-surface-400 mb-4 animate-fade-in">
        PyTorch LSTM multi-sequence forecasting 941K parameters
      </p>

      {/* Controls */}
      <GlassCard className="p-5 mb-5 animate-fade-in-up">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              Target LGA
            </label>
            <select
              className="w-full bg-dark-bg border border-white/[0.06] rounded-btn px-3 py-2 text-[0.85rem] text-dark-text focus:outline-none focus:border-un-blue"
              value={lga}
              onChange={(e) => setLga(e.target.value)}
            >
              {LGAS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              Horizon: {horizon} months
            </label>
            <input
              type="range"
              min={1}
              max={36}
              value={horizon}
              onChange={(e) => setHorizon(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          <div>
            <label className="text-[0.75rem] font-semibold text-surface-400 mb-1.5 block">
              Escalation: {escalation.toFixed(1)}x
            </label>
            <input
              type="range"
              min={0.1}
              max={3}
              step={0.1}
              value={escalation}
              onChange={(e) => setEscalation(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          <button
            onClick={runForecast}
            disabled={predicting}
            className="py-2.5 rounded-btn font-semibold text-[0.85rem] text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-50"
          >
            {predicting ? "Running..." : "Run Forecast"}
          </button>
        </div>
      </GlassCard>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {data && (
          <ForecastChart
            data={data.predictions}
            lga={data.lga}
            baseRisk={data.base_risk}
          />
        )}
        <SensitivityChart data={sensitivity} />
      </div>
    </div>
  );
}
