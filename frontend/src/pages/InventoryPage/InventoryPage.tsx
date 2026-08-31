/**
 * InventoryPage — Warehouse & Stock Tracking
 *
 * Shows current inventory levels across distribution points.
 * Interactive: users can filter by commodity and warehouse.
 */
import GlassCard from "@/components/GlassCard";
import { Package, TrendingDown, TrendingUp, Warehouse } from "lucide-react";
import { useState } from "react";

const COMMODITIES = ["Rice", "Millet", "Sorghum", "Maize", "Cooking Oil", "Plumpy'Nut"];
const WAREHOUSES = ["Maiduguri Central", "Bama Forward", "Monguno Hub", "Ngala Depot"];

const MOCK_INVENTORY = COMMODITIES.flatMap((commodity) =>
  WAREHOUSES.map((wh) => ({
    commodity,
    warehouse: wh,
    stock: Math.floor(Math.random() * 500) + 50,
    capacity: 600,
    unit: "MT",
    lastUpdate: `${Math.floor(Math.random() * 24)}h ago`,
    trend: Math.random() > 0.5 ? "up" as const : "down" as const,
  }))
);

export default function InventoryPage() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = filter === "All"
    ? MOCK_INVENTORY
    : MOCK_INVENTORY.filter((i) => i.commodity === filter);

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Warehouse size={20} /> Inventory
      </h1>
      <p className="text-sm text-surface-400 mb-5 animate-fade-in">
        Warehouse stock levels across distribution points
      </p>

      {/* Commodity filter */}
      <GlassCard className="p-3 mb-5 flex items-center gap-2 flex-wrap">
        <Package size={14} className="text-surface-500" />
        <button onClick={() => setFilter("All")} className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${filter === "All" ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"}`}>
          All
        </button>
        {COMMODITIES.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${filter === c ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"}`}>
            {c}
          </button>
        ))}
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((item, i) => {
          const pct = (item.stock / item.capacity) * 100;
          return (
            <GlassCard key={i} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h3 className="text-sm font-bold text-dark-text">{item.commodity}</h3>
                  <p className="text-[0.65rem] text-surface-500">{item.warehouse}</p>
                </div>
                <div className="flex items-center gap-1">
                  {item.trend === "up" ? <TrendingUp size={12} className="text-un-green" /> : <TrendingDown size={12} className="text-un-amber" />}
                  <span className="text-[0.65rem] text-surface-500">{item.lastUpdate}</span>
                </div>
              </div>
              <div className="flex items-end justify-between mb-1">
                <span className="text-lg font-extrabold text-dark-text">{item.stock} <span className="text-xs font-normal text-surface-500">{item.unit}</span></span>
                <span className="text-[0.65rem] text-surface-500">/ {item.capacity} {item.unit}</span>
              </div>
              <div className="w-full h-2 bg-dark-bg/60 rounded-full">
                <div className={`h-full rounded-full transition-all ${pct > 75 ? "bg-un-green" : pct > 40 ? "bg-un-blue" : "bg-un-red"}`} style={{ width: `${pct}%` }} />
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
