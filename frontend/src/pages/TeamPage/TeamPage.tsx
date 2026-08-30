/**
 * Team / Organization Page
 * ════════════════════════
 *
 * Organization management UI for NGO/Institution accounts.
 * Displays member list, invite form, and basic role assignment.
 *
 * Backend Integration (Phase 2)
 * ────────────────────────────
 * All data is currently stored in localStorage.
 * When backend auth is ready, replace localStorage calls with API calls.
 * The UI structure stays the same — only the data layer changes.
 */
import GlassCard from "@/components/GlassCard";
import { useRole } from "@/contexts/RoleContext";
import {
  Building2,
  Crown,
  Mail,
  Plus,
  Shield,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "org-admin" | "org-member";
  addedAt: string;
}

const STORAGE_KEY = "corharp_team_members";

/** Seed data for demo — shows what the UI looks like with members */
const SEED_MEMBERS: TeamMember[] = [
  {
    id: "1",
    name: "You (Admin)",
    email: "admin@organization.org",
    role: "org-admin",
    addedAt: new Date().toISOString(),
  },
];

export default function TeamPage() {
  const { orgName, setOrgName } = useRole();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"org-admin" | "org-member">("org-member");

  // Load members from localStorage (Phase 2: replace with API)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setMembers(JSON.parse(stored));
      } catch {
        setMembers(SEED_MEMBERS);
      }
    } else {
      setMembers(SEED_MEMBERS);
    }
  }, []);

  const saveMembers = (updated: TeamMember[]) => {
    setMembers(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const handleInvite = () => {
    if (!inviteName.trim() || !inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteName.trim(),
      email: inviteEmail.trim(),
      role: inviteRole,
      addedAt: new Date().toISOString(),
    };

    saveMembers([...members, newMember]);
    setInviteName("");
    setInviteEmail("");
    setInviteRole("org-member");
    setShowInvite(false);
  };

  const handleRemove = (id: string) => {
    saveMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text">Team</h1>
          <p className="text-sm text-surface-400 mt-1">
            Manage your organization's members and access
          </p>
        </div>
      </div>

      {/* Organization Info */}
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-btn bg-un-blue/10 flex items-center justify-center">
            <Building2 size={20} className="text-un-blue" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-text">
              {orgName || "Organization Name"}
            </h3>
            <p className="text-[0.7rem] text-surface-500">
              {members.length} member{members.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {!orgName && (
          <div className="mt-3">
            <label className="text-[0.7rem] font-semibold text-surface-500 uppercase tracking-wider mb-1.5 block">
              Organization Name
            </label>
            <input
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g., UNICEF Nigeria"
              className="w-full max-w-sm bg-dark-bg border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:border-un-blue/40"
            />
          </div>
        )}
      </GlassCard>

      {/* Members List */}
      <GlassCard className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users size={16} className="text-un-blue" />
            <h3 className="text-sm font-bold text-dark-text">Members</h3>
          </div>
          <button
            onClick={() => setShowInvite(!showInvite)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-btn text-xs font-semibold text-white bg-un-blue hover:bg-un-blue/80 transition-colors"
          >
            <UserPlus size={14} />
            Invite
          </button>
        </div>

        {/* Invite Form */}
        {showInvite && (
          <div className="bg-dark-bg/60 border border-white/[0.04] rounded-card p-4 mb-4 animate-fade-in">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[1px] text-surface-500 mb-3">
              Invite Team Member
              <span className="text-un-amber ml-2">(Phase 2 — no email sent yet)</span>
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <input
                type="text"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                placeholder="Full name"
                className="bg-dark-card border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:border-un-blue/40"
              />
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="Email address"
                className="bg-dark-card border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:border-un-blue/40"
              />
            </div>
            <div className="flex items-center gap-3">
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as "org-admin" | "org-member")}
                className="bg-dark-card border border-white/[0.06] rounded-btn px-3 py-2 text-sm text-dark-text focus:outline-none focus:border-un-blue/40"
              >
                <option value="org-member">Member</option>
                <option value="org-admin">Admin</option>
              </select>
              <button
                onClick={handleInvite}
                disabled={!inviteName.trim() || !inviteEmail.trim()}
                className="px-4 py-2 rounded-btn text-sm font-semibold text-white bg-un-green hover:bg-un-green/80 transition-colors disabled:opacity-40"
              >
                Send Invite
              </button>
              <button
                onClick={() => setShowInvite(false)}
                className="px-3 py-2 rounded-btn text-sm text-surface-400 hover:text-dark-text transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Member Rows */}
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-card bg-dark-bg/40 border border-white/[0.04]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-un-blue/10 flex items-center justify-center text-xs font-bold text-un-blue">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-dark-text">
                    {member.name}
                  </p>
                  <p className="text-[0.7rem] text-surface-500">
                    {member.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-[0.65rem] font-semibold px-2 py-0.5 rounded-btn bg-white/[0.04] text-surface-400">
                  {member.role === "org-admin" ? (
                    <><Crown size={10} className="text-un-amber" /> Admin</>
                  ) : (
                    <><Shield size={10} /> Member</>
                  )}
                </span>
                <span className="text-[0.6rem] text-surface-600">
                  {new Date(member.addedAt).toLocaleDateString()}
                </span>
                {member.role !== "org-admin" && (
                  <button
                    onClick={() => handleRemove(member.id)}
                    className="p-1 rounded-btn text-surface-600 hover:text-un-red hover:bg-un-red/10 transition-colors"
                    title="Remove member"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
