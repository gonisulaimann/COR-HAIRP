/**
 * Methodology Page
 * ════════════════
 *
 * Plain-language explanations of the LSTM forecasting approach and
 * MILP optimization, written for students and researchers learning
 * the domain. Not a technical reference — an accessible guide.
 *
 * Content sourced from project documentation and README,
 * rewritten for accessibility.
 */
import GlassCard from "@/components/GlassCard";
import {
  Brain,
  Cpu,
  Database,
  LineChart,
  Settings,
  Target,
} from "lucide-react";

const SECTIONS = [
  {
    id: "overview",
    icon: Target,
    title: "What is COR-HARP?",
    content:
      "COR-HARP is a humanitarian decision-support system that combines artificial intelligence with operations research to help aid workers in Northeast Nigeria. It predicts where conflict is likely to increase, optimizes how supplies reach displaced populations, and provides a real-time operational picture across five Local Government Areas in Borno State.",
  },
  {
    id: "lstm",
    icon: Brain,
    title: "How the Forecasting Model Works",
    content:
      "The core prediction engine uses a Long Short-Term Memory (LSTM) neural network — a type of AI particularly good at understanding sequences over time. Think of it like reading a story: the model reads monthly patterns of conflict, food prices, displacement, and food insecurity, then predicts what the next chapters might look like. The model has 941,441 internal parameters (like knobs it adjusts during training) and looks at 23 different signals simultaneously. It was trained on years of historical humanitarian data from organizations like ACLED, WFP, and IOM.",
  },
  {
    id: "milp",
    icon: Settings,
    title: "How the Supply Chain Optimizer Works",
    content:
      "The optimizer uses Mixed Integer Linear Programming (MILP) — a mathematical technique for finding the best solution when there are constraints. Imagine planning routes for aid convoys: you have a limited number of vehicles, fuel costs per kilometer, road conditions that change, and multiple camps that all need supplies. The optimizer finds the routing plan that minimizes total cost while also being fair — ensuring no camp is left behind. It runs Monte Carlo simulations (trying thousands of random scenarios) to understand how robust the plan is against disruptions like road blockades.",
  },
  {
    id: "data",
    icon: Database,
    title: "Where the Data Comes From",
    content:
      "COR-HARP ingests data from five major humanitarian sources: ACLED (conflict events and fatalities), WFP (food prices across markets), IPC (food insecurity severity phases), IOM DTM (displacement tracking and camp populations), and IDMC (internal displacement monitoring). All data is licensed under Creative Commons and updated periodically. The system processes 23 features from these sources to create its predictions.",
  },
  {
    id: "features",
    icon: LineChart,
    title: "Understanding the 23 Input Features",
    content:
      "The model tracks 23 signals grouped into four categories: conflict indicators (monthly event counts, fatalities, and per-LGA breakdowns), food prices (Rice, Millet, Sorghum, and Maize prices across target markets), displacement data (IDP camp populations for each of the five LGAs), and food security (IPC Phase 3+ percentages indicating acute food insecurity). Each feature is normalized and fed into the LSTM alongside historical patterns to generate predictions.",
  },
  {
    id: "architecture",
    icon: Cpu,
    title: "Technical Architecture",
    content:
      "The system is built with a FastAPI backend (Python) serving a React frontend. The ML pipeline uses PyTorch for the LSTM model and PuLP for the MILP optimizer. Model weights are stored as .pth files and loaded at inference time. The frontend communicates with the backend via a REST API, with all data flowing through typed endpoints. The entire system runs on Azure App Service with automated deployment via GitHub Actions.",
  },
];

export default function MethodologyPage() {
  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-dark-text">
          Methodology & Documentation
        </h1>
        <p className="text-sm text-surface-400 mt-1">
          Plain-language explanations of how COR-HARP works
        </p>
      </div>

      <div className="space-y-4">
        {SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <GlassCard key={section.id} className="p-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-btn bg-un-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Icon size={18} className="text-un-blue" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-dark-text mb-2">
                    {section.title}
                  </h3>
                  <p className="text-[0.82rem] text-surface-300 leading-relaxed">
                    {section.content}
                  </p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
