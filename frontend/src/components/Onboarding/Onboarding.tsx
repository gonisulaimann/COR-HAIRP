/**
 * Onboarding Tour
 * ════════════════
 *
 * Role-specific welcome tour shown after first signup.
 * Each role gets a 3-screen tour tailored to their access level
 * and typical use case. The tour is dismissable and marks itself
 * as complete in the RoleContext.
 *
 * Design: uses the existing glass-card and dark-theme design tokens.
 * No new visual language introduced.
 */
import { useRole } from "@/contexts/RoleContext";
import { ROLES, type UserRole } from "@/config/roles";
import { getVisibleNav } from "@/config/navigationConfig";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  X,
} from "lucide-react";
import { useState } from "react";

/** Tour content per role — 3 screens each */
const TOUR_SCREENS: Record<
  UserRole,
  { title: string; body: string; highlight: string }[]
> = {
  aid_worker: [
    {
      title: "Welcome, Aid Worker",
      body: "COR-HARP gives you real-time conflict forecasts, supply chain optimization, and field intelligence for Borno State operations.",
      highlight: "Your dashboard shows today's operational KPIs at a glance.",
    },
    {
      title: "Your Tools",
      body: "Use Forecasts to predict conflict events 6–12 months ahead. Supply Planning optimizes convoy routes and resource allocation across 5 LGAs.",
      highlight: "Switch to Advanced Mode for raw data and detailed model outputs.",
    },
    {
      title: "Copilot & Reports",
      body: "Ask the AI Copilot about forecasts, supply routes, or current conditions. Generate reports by date range and region for your team.",
      highlight: "You're all set — head to the Overview to get started.",
    },
  ],
  ngo: [
    {
      title: "Welcome, Organization",
      body: "Your NGO account includes everything an Aid Worker has, plus team management and organization-wide reporting.",
      highlight: "Invite team members from the Team section in the sidebar.",
    },
    {
      title: "Team & Reporting",
      body: "Manage your organization's members, assign roles, and generate impact reports for donors and stakeholders.",
      highlight: "Reports can be exported as CSV or PDF (coming soon).",
    },
    {
      title: "Operational Intelligence",
      body: "Access forecasts, supply planning, and the AI Copilot for real-time operational decisions.",
      highlight: "You're all set — head to the Overview to get started.",
    },
  ],
  student: [
    {
      title: "Welcome, Researcher",
      body: "COR-HARP is open for exploration. You have full access to the forecasting models, methodology documentation, and raw data.",
      highlight: "Advanced Mode is enabled by default for deeper technical access.",
    },
    {
      title: "Learn the Methodology",
      body: "The Learn section explains how the LSTM forecasting model and MILP optimizer work — written for someone learning the domain.",
      highlight: "Explore the data sources and model architecture in plain language.",
    },
    {
      title: "Explore & Research",
      body: "Use the Map to explore geographic data, Forecasts to see model predictions, and the Copilot to ask about how the models work.",
      highlight: "You're all set — head to the Overview to start exploring.",
    },
  ],
  individual: [
    {
      title: "Welcome to COR-HARP",
      body: "COR-HARP provides an overview of humanitarian conditions in Northeast Nigeria — conflict trends, food security, and displacement data.",
      highlight: "Your view shows aggregate, publicly-safe data for 5 monitored regions.",
    },
    {
      title: "Overview & Map",
      body: "The Overview shows key humanitarian indicators. The Map displays regional data with population and risk information.",
      highlight: "Some operational details are available to authorized field workers.",
    },
    {
      title: "Stay Informed",
      body: "This platform is updated with the latest humanitarian data. Check back regularly for new forecasts and situation updates.",
      highlight: "You're all set — head to the Overview to get started.",
    },
  ],
};

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { role } = useRole();
  const [step, setStep] = useState(0);

  if (!role) return null;

  const screens = TOUR_SCREENS[role];
  const roleDef = ROLES[role];
  const current = screens[step];
  const isLast = step === screens.length - 1;

  // Show which menu items this role gets
  const visibleItems = getVisibleNav(role, roleDef.defaultMode);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg mx-4 bg-dark-card border border-white/[0.08] rounded-card-lg shadow-glass-lg overflow-hidden animate__animated animate__fadeInUp">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[0.65rem] font-semibold uppercase tracking-[1.5px] text-un-blue mb-1">
                {roleDef.label}
              </p>
              <h2 className="text-lg font-extrabold text-dark-text">
                {current.title}
              </h2>
            </div>
            <button
              onClick={onComplete}
              className="p-1.5 rounded-btn text-surface-500 hover:text-surface-300 hover:bg-white/[0.05] transition-colors"
              title="Skip tour"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          <p className="text-sm text-surface-300 leading-relaxed mb-4">
            {current.body}
          </p>
          <div className="bg-dark-bg/60 border border-white/[0.04] rounded-card p-4">
            <p className="text-sm text-un-blue font-medium">
              {current.highlight}
            </p>
          </div>

          {/* Menu preview — show on step 1 */}
          {step === 1 && (
            <div className="mt-4 bg-dark-bg/40 border border-white/[0.04] rounded-card p-3">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[1px] text-surface-500 mb-2">
                Your menu includes
              </p>
              <div className="flex flex-wrap gap-1.5">
                {visibleItems.slice(0, 6).map((item) => (
                  <span
                    key={item.id}
                    className="text-[0.7rem] px-2 py-1 rounded-btn bg-un-blue/10 text-un-blue font-medium"
                  >
                    {item.label}
                  </span>
                ))}
                {visibleItems.length > 6 && (
                  <span className="text-[0.7rem] px-2 py-1 rounded-btn bg-white/[0.04] text-surface-500">
                    +{visibleItems.length - 6} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.06] flex items-center justify-between">
          {/* Step dots */}
          <div className="flex gap-1.5">
            {screens.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i === step ? "bg-un-blue" : "bg-white/[0.1]"
                }`}
              />
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-2">
            {!isLast ? (
              <button
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-btn text-sm font-semibold text-white bg-un-blue hover:bg-un-blue/80 transition-colors"
              >
                Next
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={onComplete}
                className="flex items-center gap-1.5 px-4 py-2 rounded-btn text-sm font-semibold text-white bg-un-green hover:bg-un-green/80 transition-colors"
              >
                Get Started
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
