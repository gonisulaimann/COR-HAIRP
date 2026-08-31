/**
 * App.tsx — Main application shell with role-based navigation
 *
 * Architecture:
 *   (1) No role → RoleSelectionPage (choose role after login)
 *   (2) Role set, not onboarded → Onboarding tour
 *   (3) Role set, onboarded → Sidebar + routed pages
 *
 * The sidebar menu is driven entirely by navigationConfig.ts,
 * filtered by the user's role and view mode (simple/advanced).
 * No hardcoded role checks in components.
 */
import { useCallback, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { RoleProvider, useRole } from "@/contexts/RoleContext";
import { getVisibleNav } from "@/config/navigationConfig";

import AlertBanner from "@/components/AlertBanner";
import Copilot from "@/components/Copilot/Copilot";
import Marquee from "@/components/Marquee";
import Onboarding from "@/components/Onboarding/Onboarding";
import Sidebar from "@/components/Sidebar/Sidebar";
import { LogOut } from "lucide-react";

// Pages
import Dashboard from "@/pages/Dashboard";
import ForecastPage from "@/pages/ForecastPage";
import LoginPage from "@/pages/LoginPage";
import MapView from "@/pages/MapView";
import OptimizerPage from "@/pages/OptimizerPage";
import RoleSelectionPage from "@/pages/RoleSelectionPage/RoleSelectionPage";
import ReportsPage from "@/pages/ReportsPage/ReportsPage";
import MethodologyPage from "@/pages/MethodologyPage/MethodologyPage";
import TeamPage from "@/pages/TeamPage/TeamPage";

import bgImage from "../assets/login-signup-bg1.jpg";

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
    message: "Active threat alert — inter-agency coordination in progress.",
  },
  {
    severity: "HIGH" as const,
    zone: "Bama Sector",
    message: "Elevated conflict activity detected along transit corridor.",
  },
  {
    severity: "MODERATE" as const,
    zone: "Monguno",
    message: "Food distribution operations ongoing — monitoring access.",
  },
];

interface User {
  id: number;
  name: string;
  clearance: string;
  has_seen_onboarding: boolean;
}

/**
 * Post-login flow: handles role selection, onboarding, and main app.
 */
function AuthenticatedApp({
  user,
  onLogout,
}: {
  user: User;
  onLogout: () => void;
}) {
  const { role, mode, isOnboarded, setOnboarded } = useRole();
  const navigate = useNavigate();
  const location = useLocation();

  // No role selected yet → show role selection
  if (!role) {
    return <RoleSelectionPage onComplete={() => {}} />;
  }

  // Role selected but not onboarded → show onboarding tour
  if (!isOnboarded) {
    return <Onboarding onComplete={() => setOnboarded(true)} />;
  }

  // Build sidebar items from navigation config, filtered by role and mode
  const navItems = getVisibleNav(role, mode);

  // Convert to sidebar format with tier separators
  const sidebarItems: ({ tier: string } | { id: string; label: string; icon: any; path: string })[] = [];
  let lastTier = "";
  for (const item of navItems) {
    if (item.tier && item.tier !== lastTier) {
      sidebarItems.push({ tier: item.tier });
      lastTier = item.tier;
    }
    // In simple mode, show the simple label; in advanced, show advancedLabel
    const displayLabel = mode === "advanced" && item.advancedLabel
      ? item.advancedLabel
      : item.label;
    sidebarItems.push({
      id: item.id,
      label: displayLabel,
      icon: item.icon,
      path: item.path,
    });
  }

  return (
    <div className="min-h-screen overflow-x-hidden w-screen grid grid-cols-1 md:grid-cols-[280px_1fr] max-w-[1600px] mx-auto">
      <Sidebar
        items={sidebarItems as any}
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
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/methodology" element={<MethodologyPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/copilot" element={<Dashboard title="AI Copilot" />} />
          <Route path="/telemetry" element={<Dashboard title="System Telemetry & Diagnostics" />} />
        </Routes>
      </main>

      {/* Floating Copilot — available from anywhere in the app */}
      <Copilot visible={role !== "individual"} />
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = useCallback((u: User) => setUser(u), []);
  const handleLogout = useCallback(() => setUser(null), []);

  return (
    <RoleProvider>
      <BrowserRouter>
        {user ? (
          <AuthenticatedApp user={user} onLogout={handleLogout} />
        ) : (
          <LoginPage onLogin={handleLogin} />
        )}
      </BrowserRouter>
    </RoleProvider>
  );
}
