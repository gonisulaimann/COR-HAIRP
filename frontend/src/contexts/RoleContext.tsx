/**
 * Role Context
 * ═════════════
 *
 * Provides role and view mode state to the entire application.
 * Persists to localStorage so the user's selection survives page refreshes.
 *
 * Backend Integration Note
 * ────────────────────────
 * When backend auth is ready, replace the localStorage reads with
 * API-verified role data. The context interface stays the same —
 * only the initialization logic changes.
 *
 * Usage:
 *   const { role, mode, setRole, setMode, isOnboarded, setOnboarded } = useRole();
 */

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { UserRole, ViewMode } from "@/config/roles";
import { ROLES } from "@/config/roles";

interface RoleState {
  /** Current user role (null until selected during signup) */
  role: UserRole | null;
  /** Current view mode — simple or advanced */
  mode: ViewMode;
  /** Whether the user has completed the role-specific onboarding tour */
  isOnboarded: boolean;
  /** Organization name (NGO role only) */
  orgName: string;
  /** Set the user's role — also sets the default mode for that role */
  setRole: (role: UserRole) => void;
  /** Toggle between simple and advanced mode */
  setMode: (mode: ViewMode) => void;
  /** Mark onboarding as complete */
  setOnboarded: (value: boolean) => void;
  /** Set organization name (NGO role) */
  setOrgName: (name: string) => void;
  /** Clear all role state (logout) */
  clearRole: () => void;
}

const RoleContext = createContext<RoleState | null>(null);

/** localStorage keys */
const STORAGE_KEY_ROLE = "corharp_role";
const STORAGE_KEY_MODE = "corharp_mode";
const STORAGE_KEY_ONBOARDED = "corharp_onboarded";
const STORAGE_KEY_ORG = "corharp_org";

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole | null>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_ROLE);
    return stored && stored in ROLES ? (stored as UserRole) : null;
  });

  const [mode, setModeState] = useState<ViewMode>(() => {
    const stored = localStorage.getItem(STORAGE_KEY_MODE);
    return stored === "advanced" || stored === "simple" ? stored : "simple";
  });

  const [isOnboarded, setOnboardedState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ONBOARDED) === "true";
  });

  const [orgName, setOrgNameState] = useState(() => {
    return localStorage.getItem(STORAGE_KEY_ORG) || "";
  });

  // Persist to localStorage on every change
  useEffect(() => {
    if (role) localStorage.setItem(STORAGE_KEY_ROLE, role);
    else localStorage.removeItem(STORAGE_KEY_ROLE);
  }, [role]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_MODE, mode);
  }, [mode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ONBOARDED, String(isOnboarded));
  }, [isOnboarded]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_ORG, orgName);
  }, [orgName]);

  const setRole = useCallback((newRole: UserRole) => {
    setRoleState(newRole);
    // Set default mode for the role
    setModeState(ROLES[newRole].defaultMode);
    // Reset onboarding when role changes
    setOnboardedState(false);
  }, []);

  const setMode = useCallback((newMode: ViewMode) => {
    setModeState(newMode);
  }, []);

  const setOnboarded = useCallback((value: boolean) => {
    setOnboardedState(value);
  }, []);

  const setOrgName = useCallback((name: string) => {
    setOrgNameState(name);
  }, []);

  const clearRole = useCallback(() => {
    setRoleState(null);
    setModeState("simple");
    setOnboardedState(false);
    setOrgNameState("");
    localStorage.removeItem(STORAGE_KEY_ROLE);
    localStorage.removeItem(STORAGE_KEY_MODE);
    localStorage.removeItem(STORAGE_KEY_ONBOARDED);
    localStorage.removeItem(STORAGE_KEY_ORG);
  }, []);

  return (
    <RoleContext.Provider
      value={{ role, mode, isOnboarded, orgName, setRole, setMode, setOnboarded, setOrgName, clearRole }}
    >
      {children}
    </RoleContext.Provider>
  );
}

/**
 * Hook to access role state and controls.
 * Must be used within a <RoleProvider>.
 */
export function useRole(): RoleState {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error("useRole must be used within a RoleProvider");
  return ctx;
}
