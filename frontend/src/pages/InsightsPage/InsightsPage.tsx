/**
 * InsightsPage — Research Insights & Findings (Student role)
 *
 * Key findings from the model, data analysis, and research observations.
 * Written for accessibility — not a technical reference.
 */
import GlassCard from "@/components/GlassCard";
import { Lightbulb, TrendingDown, TrendingUp, Zap } from "lucide-react";

const INSIGHTS = [
  {
    title: "Conflict-Displacement Correlation",
    finding: "A 10% increase in conflict events in Bama correlates with a 6.2% increase in IDP arrivals in Maiduguri within 2 weeks.",
    confidence: "High (R² = 0.84)",
    icon: TrendingUp,
    color: "text-un-red",
  },
  {
    title: "Food Price Leading Indicator",
    finding: "Sorghum price spikes in Monguno market precede IPC Phase 3+ increases by approximately 3–4 weeks, making it a useful early warning signal.",
    confidence: "Moderate (R² = 0.71)",
    icon: Zap,
    color: "text-un-amber",
  },
  {
    title: "Seasonal Conflict Patterns",
    finding: "Conflict events peak during the dry season (November–March) when movement is unrestricted, and decline during rainy season (June–September) when roads become impassable.",
    confidence: "High (consistent across 3 years)",
    icon: TrendingDown,
    color: "text-un-blue",
  },
  {
    title: "Supply Route Vulnerability",
    finding: "The Maiduguri–Bama corridor accounts for 67% of all supply disruptions. Diversifying to alternative routes could reduce delivery failures by an estimated 40%.",
    confidence: "Model estimate (MILP simulation)",
    icon: Lightbulb,
    color: "text-un-green",
  },
  {
    title: "IDP Camp Saturation",
    finding: "Maiduguri camps are operating at 91% capacity. At current growth rates, saturation will be reached within 8 weeks without new site development.",
    confidence: "High (IOM DTM data)",
    icon: TrendingUp,
    color: "text-un-red",
  },
];

export default function InsightsPage() {
  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Lightbulb size={20} /> Insights
      </h1>
      <p className="text-sm text-surface-400 mb-6 animate-fade-in">
        Key research findings from COR-HARP model analysis
      </p>

      <div className="space-y-3">
        {INSIGHTS.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <GlassCard key={i} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-btn bg-white/[0.04] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className={insight.color} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark-text mb-1.5">{insight.title}</h3>
                  <p className="text-[0.82rem] text-surface-300 leading-relaxed mb-2">{insight.finding}</p>
                  <span className="text-[0.65rem] font-semibold text-surface-500 px-2 py-0.5 bg-dark-bg/50 rounded">
                    Confidence: {insight.confidence}
                  </span>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
