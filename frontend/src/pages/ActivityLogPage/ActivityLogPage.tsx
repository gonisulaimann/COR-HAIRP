/**
 * ActivityLogPage — Team Activity Feed (NGO role only)
 *
 * Shows recent actions by team members: logins, report exports,
 * alert acknowledgments, etc. Currently mock data.
 */
import GlassCard from "@/components/GlassCard";
import { Calendar, CheckCircle2, FileText, LogIn, Send, UserPlus } from "lucide-react";

const ACTIVITIES = [
  { user: "Amina Hassan", action: "acknowledged alert", target: "Active Threat — Maiduguri Metro", time: "12 min ago", icon: CheckCircle2, color: "text-un-green" },
  { user: "Omar Farouk", action: "exported report", target: "Weekly Situation Report — Wk 35", time: "1 hour ago", icon: FileText, color: "text-un-blue" },
  { user: "Fatima Bello", action: "logged in from", target: "Lagos, Nigeria", time: "2 hours ago", icon: LogIn, color: "text-surface-400" },
  { user: "Ibrahim Musa", action: "shared dashboard with", target: "external partner (OCHA)", time: "4 hours ago", icon: Send, color: "text-un-amber" },
  { user: "Sani Abdullahi", action: "joined team as", target: "org-member", time: "Yesterday", icon: UserPlus, color: "text-un-blue" },
  { user: "Amina Hassan", action: "ran forecast for", target: "Bama LGA (12-month horizon)", time: "Yesterday", icon: CheckCircle2, color: "text-un-green" },
];

export default function ActivityLogPage() {
  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Calendar size={20} /> Activity Log
      </h1>
      <p className="text-sm text-surface-400 mb-6 animate-fade-in">
        Recent team activity across your organization
      </p>

      <div className="space-y-2">
        {ACTIVITIES.map((act, i) => {
          const Icon = act.icon;
          return (
            <GlassCard key={i} className="p-4">
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-btn bg-white/[0.04] flex items-center justify-center flex-shrink-0`}>
                  <Icon size={14} className={act.color} />
                </div>
                <div>
                  <p className="text-sm text-surface-300">
                    <span className="font-bold text-dark-text">{act.user}</span>{" "}
                    {act.action}{" "}
                    <span className="font-medium text-dark-text">{act.target}</span>
                  </p>
                  <p className="text-[0.65rem] text-surface-500 mt-0.5">{act.time}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
