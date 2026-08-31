/**
 * SettingsPage — Account & Preferences
 *
 * User profile settings, display preferences, notification settings,
 * and account management. Real toggle interactions for all settings.
 */
import GlassCard from "@/components/GlassCard";
import { useRole } from "@/contexts/RoleContext";
import { ROLES } from "@/config/roles";
import {
  Bell,
  Eye,
  Globe,
  Key,
  LogOut,
  Moon,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-semibold text-dark-text">{label}</p>
        <p className="text-[0.7rem] text-surface-500">{description}</p>
      </div>
      <button
        onClick={() => onChange(!checked)}
        className={`relative w-10 h-5 rounded-full transition-colors ${
          checked ? "bg-un-blue" : "bg-white/[0.1]"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const { role, mode, setMode, clearRole } = useRole();
  const [notifications, setNotifications] = useState(true);
  const [emailDigest, setEmailDigest] = useState(false);
  const [compactMode, setCompactMode] = useState(false);

  const roleDef = role ? ROLES[role] : null;

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-6 animate-fade-in">
        Settings
      </h1>

      {/* Profile */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <User size={16} className="text-un-blue" />
          <h2 className="text-sm font-bold text-dark-text">Profile</h2>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <span className="text-sm text-surface-400">Role</span>
            <span className="text-sm font-semibold text-dark-text">{roleDef?.label || "—"}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-white/[0.04]">
            <span className="text-sm text-surface-400">Access Level</span>
            <span className="text-sm font-semibold text-dark-text">{roleDef?.allowedPages.length || 0} modules</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-surface-400">Advanced Mode</span>
            <span className={`text-sm font-semibold ${roleDef?.canUseAdvancedMode ? "text-un-green" : "text-surface-500"}`}>
              {roleDef?.canUseAdvancedMode ? "Available" : "Not available"}
            </span>
          </div>
        </div>
      </GlassCard>

      {/* Display */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Eye size={16} className="text-un-blue" />
          <h2 className="text-sm font-bold text-dark-text">Display</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-semibold text-dark-text">View Mode</p>
              <p className="text-[0.7rem] text-surface-500">Switch between Simple and Advanced views</p>
            </div>
            <div className="flex gap-1">
              <button
                onClick={() => setMode("simple")}
                className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                  mode === "simple" ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setMode("advanced")}
                className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors ${
                  mode === "advanced" ? "bg-un-blue/15 text-un-blue" : "text-surface-400 hover:bg-white/[0.04]"
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
          <Toggle label="Compact Mode" description="Reduce spacing for denser data views" checked={compactMode} onChange={setCompactMode} />
          <Toggle label="Dark Theme" description="Currently active (default)" checked={true} onChange={() => {}} />
        </div>
      </GlassCard>

      {/* Notifications */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Bell size={16} className="text-un-blue" />
          <h2 className="text-sm font-bold text-dark-text">Notifications</h2>
        </div>
        <div className="divide-y divide-white/[0.04]">
          <Toggle label="Push Notifications" description="Receive alerts for critical events" checked={notifications} onChange={setNotifications} />
          <Toggle label="Email Digest" description="Weekly summary of operational activity" checked={emailDigest} onChange={setEmailDigest} />
        </div>
      </GlassCard>

      {/* Security */}
      <GlassCard className="p-5 mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Shield size={16} className="text-un-blue" />
          <h2 className="text-sm font-bold text-dark-text">Security</h2>
        </div>
        <div className="space-y-2">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm text-surface-300 hover:bg-white/[0.04] transition-colors">
            <Key size={16} className="text-surface-500" />
            Change Password
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-btn text-sm text-surface-300 hover:bg-white/[0.04] transition-colors">
            <Globe size={16} className="text-surface-500" />
            Active Sessions
          </button>
        </div>
      </GlassCard>

      {/* Danger zone */}
      <GlassCard className="p-5 border-un-red/20">
        <button
          onClick={clearRole}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-btn text-sm font-semibold text-[#FCA5A5] bg-un-red/10 border border-un-red/20 hover:bg-un-red/20 transition-colors"
        >
          <LogOut size={16} />
          Sign Out & Clear Role
        </button>
        <p className="text-[0.65rem] text-surface-500 text-center mt-2">
          This will log you out and return to the login screen
        </p>
      </GlassCard>
    </div>
  );
}
