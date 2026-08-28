/**
 * App.tsx   Main application shell with sidebar navigation and auth gate.
 *
 * (2) authenticated → sidebar + routed pages, (3) loading → skeleton.
 * The sidebar renders 20 navigation items across 3 tiers. Active route
 * is highlighted. Zero user data is displayed in the sidebar.
 */
import {
  Activity,
  Bot,
  Brain,
  Dice5,
  LayoutDashboard,
  LogOut,
  Map,
  Microscope,
  Radio,
  Settings,
  TrendingUp,
  Truck,
} from "lucide-react";
import { useCallback, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import AlertBanner from "@/components/AlertBanner";
import Marquee from "@/components/Marquee";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/pages/Dashboard";
import ForecastPage from "@/pages/ForecastPage";
import LoginPage from "@/pages/LoginPage";
import MapView from "@/pages/MapView";
import OptimizerPage from "@/pages/OptimizerPage";
import bgImage from "../assets/login-signup-bg1.jpg";
const NAV_ITEMS = [
  {
    id: "sitrep",
    label: "Executive Situation Report",
    icon: LayoutDashboard,
    path: "/",
  },
  { id: "map", label: "Master Spatial Command Map", icon: Map, path: "/map" },
  { id: "copilot", label: "Multi-Agent Copilot", icon: Bot, path: "/copilot" },
  {
    id: "logistics",
    label: "Real-Time Logistics Dispatch",
    icon: Truck,
    path: "/logistics",
  },
  {
    id: "forecast",
    label: "Deep Learning Inference Engine",
    icon: Brain,
    path: "/forecast",
  },
  {
    id: "classification",
    label: "Conflict Surge Classification",
    icon: TrendingUp,
    path: "/classification",
  },
  {
    id: "counterfactual",
    label: "Neural Counterfactual Simulator",
    icon: Microscope,
    path: "/counterfactual",
  },
  {
    id: "trends",
    label: "Temporal Trend Extrapolator",
    icon: Activity,
    path: "/trends",
  },
  {
    id: "optimizer",
    label: "MILP Supply Chain Optimizer",
    icon: Settings,
    path: "/optimizer",
  },
  {
    id: "monte-carlo",
    label: "Stochastic Monte Carlo Risk",
    icon: Dice5,
    path: "/monte-carlo",
  },
  {
    id: "telemetry",
    label: "System Telemetry & Diagnostics",
    icon: Radio,
    path: "/telemetry",
  },
];

const MARQUEE_ITEMS = [
  { label: "Rice (imported)", value: "₦68,500/100kg", color: "#CF3A24" },
  { label: "Millet", value: "₦42,300/100kg", color: "#F5A623" },
  { label: "Sorghum", value: "₦35,100/100kg", color: "#2E8540" },
  { label: "Maize", value: "₦28,700/100kg", color: "#009EDB" },
  { label: "IDP Population", value: "1,361,535 (Borno)", color: "#5A6872" },
  { label: "HDX HAPI v2", value: "Live feeds connected", color: "#CF3A24" },
];

const ALERTS = [
  {
    severity: "CRITICAL" as const,
    zone: "Maiduguri Metro",
    message: "Active threat alert   inter-agency coordination in progress.",
  },
  {
    severity: "HIGH" as const,
    zone: "Bama Sector",
    message: "Elevated conflict activity detected along transit corridor.",
  },
  {
    severity: "MODERATE" as const,
    zone: "Monguno",
    message: "Food distribution operations ongoing   monitoring access.",
  },
];

interface User {
  id: number;
  name: string;
  clearance: string;
  has_seen_onboarding: boolean;
}

function AuthenticatedApp({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen overflow-x-hidden w-screen grid grid-cols-1 md:grid-cols-[280px_1fr] max-w-[1600px] mx-auto ">
      <Sidebar
        items={NAV_ITEMS as any}
        activePath={location.pathname}
        onNavigate={navigate}
        onLogout={onLogout}
        logoutIcon={LogOut}
      />

      <main className="p-4 pt-14 pb-52 md:p-12 space-y-4 overflow-y-auto h-screen">
        <div className="relative rounded-card animate__animated animate__fadeInDown">
          <img
            src={bgImage}
            className="w-full h-full absolute z-0 opacity-25"
          />
          <div className="px-4 pb-0 pt-4">
            <AlertBanner alerts={ALERTS} />
            <Marquee items={MARQUEE_ITEMS} />
          </div>
        </div>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/optimizer" element={<OptimizerPage />} />
          <Route
            path="/copilot"
            element={<Dashboard title="Multi-Agent Copilot" />}
          />
          <Route
            path="/logistics"
            element={<Dashboard title="Real-Time Logistics Dispatch" />}
          />
          <Route
            path="/classification"
            element={<Dashboard title="Conflict Surge Classification" />}
          />
          <Route
            path="/counterfactual"
            element={<Dashboard title="Neural Counterfactual Simulator" />}
          />
          <Route
            path="/trends"
            element={<Dashboard title="Temporal Trend Extrapolator" />}
          />
          <Route
            path="/monte-carlo"
            element={<Dashboard title="Stochastic Monte Carlo Risk" />}
          />
          <Route
            path="/telemetry"
            element={<Dashboard title="System Telemetry & Diagnostics" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  // const [user, setUser] = useState<User | null>({
  //   clearance: "Sundi",
  //   has_seen_onboarding: true,
  //   id: 12882,
  //   name: "Sundiata",
  // });

  const handleLogin = useCallback((u: User) => setUser(u), []);
  const handleLogout = useCallback(() => setUser(null), []);

  return (
    <BrowserRouter>
      {user ? (
        <AuthenticatedApp user={user} onLogout={handleLogout} />
      ) : (
        <LoginPage onLogin={handleLogin} />
      )}
    </BrowserRouter>
  );
}
