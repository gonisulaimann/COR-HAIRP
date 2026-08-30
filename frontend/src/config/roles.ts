/**
 * Role Definitions & Permission Model
 * ════════════════════════════════════
 *
 * Central definition of all user roles, their descriptions, and
 * what each role is allowed to access. This is the single source
 * of truth for role-based access control in the frontend.
 *
 * Design Note
 * ───────────
 * Roles are self-declared at signup. This is NOT identity verification.
 * The permission model gates UI visibility, not data security. Backend
 * enforcement of data-level restrictions is Phase 2.
 */

export type UserRole = "aid_worker" | "ngo" | "student" | "individual";

export type ViewMode = "simple" | "advanced";

export interface RoleDefinition {
  id: UserRole;
  label: string;
  description: string;
  icon: string; // lucide icon name
  defaultMode: ViewMode;
  /** Page IDs this role can access */
  allowedPages: string[];
  /** Whether this role can toggle to Advanced Mode */
  canUseAdvancedMode: boolean;
}

/**
 * All four roles with their metadata and default access levels.
 * The `allowedPages` arrays reference page IDs defined in navigationConfig.ts.
 */
export const ROLES: Record<UserRole, RoleDefinition> = {
  aid_worker: {
    id: "aid_worker",
    label: "Aid Worker",
    description: "Field operations, forecasts, and supply planning tools",
    icon: "HardHat",
    defaultMode: "simple",
    allowedPages: [
      "overview",
      "map",
      "forecast",
      "optimizer",
      "copilot",
      "reports",
      "telemetry",
    ],
    canUseAdvancedMode: true,
  },
  ngo: {
    id: "ngo",
    label: "NGO / Institution",
    description: "Organization account with team access and reporting",
    icon: "Building2",
    defaultMode: "simple",
    allowedPages: [
      "overview",
      "map",
      "forecast",
      "optimizer",
      "copilot",
      "reports",
      "team",
      "telemetry",
    ],
    canUseAdvancedMode: true,
  },
  student: {
    id: "student",
    label: "Student / Researcher",
    description: "Explore the data, models, and methodology",
    icon: "GraduationCap",
    defaultMode: "advanced",
    allowedPages: [
      "overview",
      "map",
      "forecast",
      "copilot",
      "methodology",
      "telemetry",
    ],
    canUseAdvancedMode: true,
  },
  individual: {
    id: "individual",
    label: "Individual",
    description: "General overview and awareness tools",
    icon: "User",
    defaultMode: "simple",
    allowedPages: ["overview", "map"],
    canUseAdvancedMode: false,
  },
};

/**
 * Check if a role has access to a specific page.
 */
export function canAccessPage(role: UserRole, pageId: string): boolean {
  return ROLES[role].allowedPages.includes(pageId);
}

/**
 * Get the display label for a role.
 */
export function getRoleLabel(role: UserRole): string {
  return ROLES[role].label;
}
