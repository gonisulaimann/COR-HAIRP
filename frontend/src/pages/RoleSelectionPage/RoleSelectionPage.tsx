/**
 * Role Selection Page
 * ═══════════════════
 *
 * Shown after login when the user has no role assigned.
 * Presents four role options with clear descriptions so users
 * understand what they're choosing. For NGO/Institution, an
 * additional organization name step is included.
 *
 * This is a self-declared role — NOT identity verification.
 * The role gates UI visibility, not data security.
 */
import Logo from "@/components/Logo";
import { useRole } from "@/contexts/RoleContext";
import { ROLES, type UserRole } from "@/config/roles";
import {
  ArrowRight,
  Building2,
  GraduationCap,
  HardHat,
  Loader2,
  User,
} from "lucide-react";
import { useState } from "react";
import bgImage from "../../../assets/login-signup-bg1.jpg";

const ROLE_ICONS: Record<UserRole, typeof HardHat> = {
  aid_worker: HardHat,
  ngo: Building2,
  student: GraduationCap,
  individual: User,
};

const ROLE_ORDER: UserRole[] = ["aid_worker", "ngo", "student", "individual"];

interface RoleSelectionPageProps {
  onComplete: () => void;
}

export default function RoleSelectionPage({ onComplete }: RoleSelectionPageProps) {
  const { setRole, setOrgName } = useRole();
  const [selected, setSelected] = useState<UserRole | null>(null);
  const [orgNameInput, setOrgNameInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSelect = (role: UserRole) => {
    setSelected(role);
  };

  const handleConfirm = () => {
    if (!selected) return;
    setLoading(true);

    // Store org name if NGO
    if (selected === "ngo" && orgNameInput.trim()) {
      setOrgName(orgNameInput.trim());
    }

    // Set role (also sets default mode and resets onboarding)
    setRole(selected);

    // Small delay for visual feedback
    setTimeout(() => {
      setLoading(false);
      onComplete();
    }, 400);
  };

  return (
    <div className="min-h-screen flex bg-dark-bg">
      <img src={bgImage} className="w-full h-screen absolute z-0 opacity-25" />

      {/* Left Panel: Brand */}
      <div className="hidden lg:flex w-[45%] relative overflow-hidden bg-gradient-to-br from-un-navy via-[#0A1628] to-dark-bg">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-96 h-96 bg-un-blue/20 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col justify-center p-12 w-full">
          <Logo className="w-40 mb-8" />
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-4">
            Choose Your
            <br />
            Experience
          </h1>
          <p className="text-sm text-surface-400 max-w-md leading-relaxed">
            COR-HARP adapts to your role. Select who you are and we'll
            configure the right tools, data views, and navigation for your work.
          </p>
        </div>
      </div>

      {/* Right Panel: Role Selection */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="text-center mb-8 lg:hidden">
            <Logo className="w-48 mx-auto" />
          </div>

          <h2 className="text-xl font-extrabold text-dark-text mb-2">
            Select Your Role
          </h2>
          <p className="text-sm text-surface-400 mb-6">
            This determines your dashboard layout and available tools.
          </p>

          {/* Role Cards */}
          <div className="space-y-3 mb-6">
            {ROLE_ORDER.map((roleId) => {
              const role = ROLES[roleId];
              const Icon = ROLE_ICONS[roleId];
              const isSelected = selected === roleId;

              return (
                <button
                  key={roleId}
                  onClick={() => handleSelect(roleId)}
                  className={`w-full flex items-start gap-3.5 p-4 rounded-card border transition-all duration-200 text-left ${
                    isSelected
                      ? "bg-un-blue/10 border-un-blue/40 shadow-glow-blue"
                      : "bg-dark-card/60 border-white/[0.06] hover:border-white/[0.12] hover:bg-dark-card"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-btn flex items-center justify-center flex-shrink-0 ${
                      isSelected
                        ? "bg-un-blue/20"
                        : "bg-white/[0.04]"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isSelected ? "text-un-blue" : "text-surface-400"}
                    />
                  </div>
                  <div>
                    <p
                      className={`text-sm font-bold ${
                        isSelected ? "text-un-blue" : "text-dark-text"
                      }`}
                    >
                      {role.label}
                    </p>
                    <p className="text-[0.75rem] text-surface-400 mt-0.5">
                      {role.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* NGO Organization Name (conditional) */}
          {selected === "ngo" && (
            <div className="mb-6 animate-fade-in">
              <label className="text-[0.7rem] font-semibold text-surface-500 uppercase tracking-wider mb-1.5 block">
                Organization Name
              </label>
              <input
                type="text"
                value={orgNameInput}
                onChange={(e) => setOrgNameInput(e.target.value)}
                placeholder="e.g., UNICEF Nigeria, MSF, SEMA..."
                className="w-full bg-dark-card border border-white/[0.06] rounded-btn px-4 py-2.5 text-sm text-dark-text placeholder:text-surface-500/50 focus:outline-none focus:border-un-blue/40 transition-colors"
              />
              <p className="text-[0.65rem] text-surface-600 mt-1.5">
                You can invite team members after setup
              </p>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={!selected || loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-card font-semibold text-sm text-white bg-gradient-to-r from-un-blue to-un-navy hover:-translate-y-0.5 hover:shadow-glow-blue transition-all duration-250 disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {loading ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                Continue
                <ArrowRight size={16} />
              </>
            )}
          </button>

          <p className="text-center text-[0.65rem] text-surface-600 mt-4">
            You can change your role later in settings
          </p>
        </div>
      </div>
    </div>
  );
}
