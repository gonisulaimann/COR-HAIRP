/**
 * Navigation Configuration
 * ═══════════════════════
 *
 * Single source of truth for the entire sidebar menu system.
 * Designed after Bloomberg Terminal / Palantir Foundry patterns:
 * items are organized into clearly labeled GROUPED SECTIONS, not a flat list.
 *
 * Each entry declares:
 *   - id: unique page identifier (matches route paths)
 *   - label: plain-language name shown in Simple Mode
 *   - advancedLabel: technical subtitle shown in Advanced Mode
 *   - icon: lucide-react icon component
 *   - path: route path
 *   - roles: which user roles can see this item
 *   - modes: "simple" | "advanced" | "both" — visibility by view mode
 *   - section: the grouped section this item belongs to (drives section headers)
 *
 * Section ordering is defined by SECTION_ORDER below.
 * The Sidebar component consumes this config directly.
 * Do NOT hardcode role checks in components — always reference this config.
 */

import {
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  Brain,
  Building2,
  Calendar,
  FileText,
  GitCompare,
  Globe,
  LayoutDashboard,
  Lightbulb,
  Map,
  Radio,
  Route,
  Search,
  Send,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Users,
  Warehouse,
} from "lucide-react";
import type { UserRole } from "./roles";

export type MenuMode = "simple" | "advanced" | "both";

/** Logical section identifiers — ordered as they appear in the sidebar */
export type SectionId =
  | "operations"
  | "intelligence"
  | "logistics"
  | "tools"
  | "organization"
  | "learn"
  | "system"
  | "account";

export interface SectionDef {
  id: SectionId;
  label: string;
  /** Roles that can see this section at all */
  roles: UserRole[];
}

/** Section display order */
export const SECTION_ORDER: SectionId[] = [
  "operations",
  "intelligence",
  "logistics",
  "tools",
  "organization",
  "learn",
  "system",
  "account",
];

/** Section definitions with display labels */
export const SECTIONS: Record<SectionId, SectionDef> = {
  operations: { id: "operations", label: "OPERATIONS", roles: ["aid_worker", "ngo", "student", "individual"] },
  intelligence: { id: "intelligence", label: "INTELLIGENCE", roles: ["aid_worker", "ngo", "student"] },
  logistics: { id: "logistics", label: "LOGISTICS", roles: ["aid_worker", "ngo"] },
  tools: { id: "tools", label: "TOOLS", roles: ["aid_worker", "ngo", "student"] },
  organization: { id: "organization", label: "ORGANIZATION", roles: ["ngo"] },
  learn: { id: "learn", label: "LEARN", roles: ["student"] },
  system: { id: "system", label: "SYSTEM", roles: ["aid_worker", "ngo", "student"] },
  account: { id: "account", label: "ACCOUNT", roles: ["aid_worker", "ngo", "student", "individual"] },
};

export interface NavConfigItem {
  id: string;
  label: string;
  advancedLabel?: string;
  icon: typeof LayoutDashboard;
  path: string;
  roles: UserRole[];
  modes: MenuMode;
  section: SectionId;
}

/**
 * Complete navigation menu definition.
 * Items are grouped by section. Within each section, items appear in order.
 */
export const NAVIGATION: NavConfigItem[] = [
  // ══════════════════════════════════════════════════════════════════════════
  //  OPERATIONS — Core operational views
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "overview",
    label: "Overview",
    advancedLabel: "Executive Situation Report",
    icon: LayoutDashboard,
    path: "/",
    roles: ["aid_worker", "ngo", "student", "individual"],
    modes: "both",
    section: "operations",
  },
  {
    id: "map",
    label: "Map",
    advancedLabel: "Master Spatial Command Map",
    icon: Map,
    path: "/map",
    roles: ["aid_worker", "ngo", "student", "individual"],
    modes: "both",
    section: "operations",
  },
  {
    id: "alerts",
    label: "Alerts",
    advancedLabel: "Alerts & Notifications Center",
    icon: Bell,
    path: "/alerts",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "operations",
  },
  {
    id: "briefing",
    label: "Today's Briefing",
    advancedLabel: "Auto-Generated Daily Summary",
    icon: Target,
    path: "/briefing",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "operations",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  INTELLIGENCE — Forecasting, analysis, trends
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "forecast",
    label: "Forecasts",
    advancedLabel: "Deep Learning Inference Engine",
    icon: Brain,
    path: "/forecast",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    section: "intelligence",
  },
  {
    id: "trends",
    label: "Trends",
    advancedLabel: "Time-Series Trend Analysis",
    icon: TrendingUp,
    path: "/trends",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    section: "intelligence",
  },
  {
    id: "lga-comparison",
    label: "LGA Comparison",
    advancedLabel: "Multi-LGA Comparative Analysis",
    icon: GitCompare,
    path: "/lga-comparison",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    section: "intelligence",
  },
  {
    id: "risk-outlook",
    label: "Risk Outlook",
    advancedLabel: "Predictive Risk Assessment",
    icon: Shield,
    path: "/risk-outlook",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "intelligence",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  LOGISTICS — Supply chain, routes, inventory
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "optimizer",
    label: "Supply Planning",
    advancedLabel: "MILP Supply Chain Optimizer",
    icon: Settings,
    path: "/optimizer",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "logistics",
  },
  {
    id: "routes",
    label: "Routes",
    advancedLabel: "Transit Corridor Analysis",
    icon: Route,
    path: "/routes",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "logistics",
  },
  {
    id: "inventory",
    label: "Inventory",
    advancedLabel: "Warehouse & Stock Tracking",
    icon: Warehouse,
    path: "/inventory",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "logistics",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  TOOLS — AI assistant, reports, saved views, export
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "copilot",
    label: "Copilot",
    advancedLabel: "AI Assistant",
    icon: Radio,
    path: "/copilot",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    section: "tools",
  },
  {
    id: "reports",
    label: "Reports",
    advancedLabel: "Report Builder",
    icon: FileText,
    path: "/reports",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "tools",
  },
  {
    id: "saved-views",
    label: "Saved Views",
    advancedLabel: "Bookmarked Dashboards",
    icon: Bookmark,
    path: "/saved-views",
    roles: ["aid_worker", "ngo", "student"],
    modes: "both",
    section: "tools",
  },
  {
    id: "export",
    label: "Export & Share",
    advancedLabel: "Data Export & Distribution",
    icon: Send,
    path: "/export",
    roles: ["aid_worker", "ngo"],
    modes: "both",
    section: "tools",
  },
  {
    id: "search",
    label: "Search",
    advancedLabel: "Full-Text Data Search",
    icon: Search,
    path: "/search",
    roles: ["aid_worker", "ngo", "student"],
    modes: "advanced",
    section: "tools",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  ORGANIZATION — NGO team management (NGO only)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "team",
    label: "Team",
    advancedLabel: "Organization Management",
    icon: Users,
    path: "/team",
    roles: ["ngo"],
    modes: "both",
    section: "organization",
  },
  {
    id: "activity-log",
    label: "Activity Log",
    advancedLabel: "Team Activity Feed",
    icon: Calendar,
    path: "/activity-log",
    roles: ["ngo"],
    modes: "both",
    section: "organization",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  LEARN — Methodology, models, data (Student only)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "methodology",
    label: "Methodology",
    advancedLabel: "Model Documentation",
    icon: BookOpen,
    path: "/methodology",
    roles: ["student"],
    modes: "both",
    section: "learn",
  },
  {
    id: "data-explorer",
    label: "Data Explorer",
    advancedLabel: "Raw Data & Feature Analysis",
    icon: Globe,
    path: "/data-explorer",
    roles: ["student"],
    modes: "both",
    section: "learn",
  },
  {
    id: "insights",
    label: "Insights",
    advancedLabel: "Research Insights & Findings",
    icon: Lightbulb,
    path: "/insights",
    roles: ["student"],
    modes: "both",
    section: "learn",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  SYSTEM — Telemetry, diagnostics (Advanced mode only)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "telemetry",
    label: "System",
    advancedLabel: "Telemetry & Diagnostics",
    icon: BarChart3,
    path: "/telemetry",
    roles: ["aid_worker", "ngo", "student"],
    modes: "advanced",
    section: "system",
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  ACCOUNT — Settings (all roles)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "settings",
    label: "Settings",
    advancedLabel: "Account & Preferences",
    icon: Settings,
    path: "/settings",
    roles: ["aid_worker", "ngo", "student", "individual"],
    modes: "both",
    section: "account",
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
    if (!item.roles.includes(role)) return false;
    if (item.modes === "both") return true;
    return item.modes === mode;
  });
}

/**
 * Get visible items grouped by section, in display order.
 * Returns an array of { section, items } objects.
 */
export function getGroupedNav(
  role: UserRole,
  mode: "simple" | "advanced",
): { section: SectionDef; items: NavConfigItem[] }[] {
  const visible = getVisibleNav(role, mode);
  const grouped: Record<string, NavConfigItem[]> = {};

  for (const item of visible) {
    if (!grouped[item.section]) grouped[item.section] = [];
    grouped[item.section].push(item);
  }

  return SECTION_ORDER
    .filter((sectionId) => {
      const section = SECTIONS[sectionId];
      return section.roles.includes(role) && grouped[sectionId]?.length;
    })
    .map((sectionId) => ({
      section: SECTIONS[sectionId],
      items: grouped[sectionId] || [],
    }));
}

/**
 * Get a nav item by its page ID.
 */
export function getNavById(id: string): NavConfigItem | undefined {
  return NAVIGATION.find((item) => item.id === id);
}
