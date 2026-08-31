/**
 * Navigation Configuration
 * ═════════════════════════
 *
 * Single source of truth for the entire sidebar menu system.
 * Each entry declares:
 *   - id: unique page identifier (matches route paths)
 *   - label: plain-language name shown in Simple Mode
 *   - advancedLabel: technical subtitle shown in Advanced Mode
 *   - icon: lucide-react icon component
 *   - path: route path
 *   - roles: which user roles can see this item
 *   - modes: "simple" | "advanced" | "both" — visibility by view mode
 *   - tier: optional tier separator grouping
 *
 * The Sidebar component consumes this config directly.
 * Do NOT hardcode role checks in components — always reference this config.
 */

import {
  BarChart3,
  BookOpen,
  Brain,
  Building2,
  FileText,
  LayoutDashboard,
  Map,
  Radio,
  Settings,
  Users,
} from "lucide-react";
import type { UserRole } from "./roles";

export type MenuMode = "simple" | "advanced" | "both";

export interface NavConfigItem {
  id: string;
  label: string;
  advancedLabel?: string;
  icon: typeof LayoutDashboard;
  path: string;
  roles: UserRole[];
  modes: MenuMode;
  tier?: string;
}

/**
 * Complete navigation menu definition.
 * Ordered by tier — the Sidebar renders them in this exact order.
 */
export const NAVIGATION: NavConfigItem[] = [
  // ── Tier I: Core Operations ──
  {
    id: "overview",
    label: "Overview",
    advancedLabel: "Executive Situation Report",
    icon: LayoutDashboard,
    path: "/",
    roles: ["aid_worker", "ngo", "student", "individual"],
    modes: "both",
    tier: "Operations",
  },
  {
    id: "map",
    label: "Map",
    advancedLabel: "Master Spatial Command Map",
    icon: Map,
    path: "/map",
    roles: ["aid_worker", "ngo", "student", "individual"],
    modes: "both",
  },
  {
    id: "forecast",
    label: "Forecasts",
    advancedLabel: "Deep Learning Inference Engine",
    icon: Brain,
    path: "/forecast",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
  },
  {
    id: "optimizer",
    label: "Supply Planning",
    advancedLabel: "MILP Supply Chain Optimizer",
    icon: Settings,
    path: "/optimizer",
    roles: ["aid_worker", "ngo"],
    modes: "both",
  },

  // ── Tier II: Intelligence ──
  {
    id: "copilot",
    label: "Copilot",
    advancedLabel: "AI Assistant",
    icon: Radio,
    path: "/copilot",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    tier: "Intelligence",
  },
  {
    id: "reports",
    label: "Reports",
    advancedLabel: "Report Builder",
    icon: FileText,
    path: "/reports",
    roles: ["aid_worker", "ngo"],
    modes: "both",
  },
  {
    id: "methodology",
    label: "Learn",
    advancedLabel: "Methodology & Documentation",
    icon: BookOpen,
    path: "/methodology",
    roles: ["student"],
    modes: "both",
  },

  // ── Tier III: Organization (NGO only) ──
  {
    id: "team",
    label: "Team",
    advancedLabel: "Organization Management",
    icon: Users,
    path: "/team",
    roles: ["ngo"],
    modes: "both",
    tier: "Organization",
  },

  // ── Tier IV: System ──
  {
    id: "telemetry",
    label: "System",
    advancedLabel: "Telemetry & Diagnostics",
    icon: BarChart3,
    path: "/telemetry",
    roles: ["aid_worker", "ngo", "student"],
    modes: "advanced",
    tier: "System",
  },
];

/**
 * Filter navigation items by role and view mode.
 * Returns only the items the given role can see in the given mode.
 */
export function getVisibleNav(
  role: UserRole,
  mode: "simple" | "advanced",
): NavConfigItem[] {
  return NAVIGATION.filter((item) => {
    // Check role access
    if (!item.roles.includes(role)) return false;
    // Check mode visibility
    if (item.modes === "both") return true;
    return item.modes === mode;
  });
}

/**
 * Get a nav item by its page ID.
 */
export function getNavById(id: string): NavConfigItem | undefined {
  return NAVIGATION.find((item) => item.id === id);
}
