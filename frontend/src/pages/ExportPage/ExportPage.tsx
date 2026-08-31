/**
 * ExportPage — Data Export & Distribution
 *
 * Allows users to export data in various formats (CSV, PDF, JSON).
 * Export functionality is a UI shell — Phase 2 for actual file generation.
 */
import GlassCard from "@/components/GlassCard";
import { Download, FileJson, FileText, Image, Send, Share2 } from "lucide-react";
import { useState } from "react";

const EXPORT_FORMATS = [
  { id: "csv", label: "CSV", icon: FileText, desc: "Tabular data for spreadsheets", status: "available" as const },
  { id: "pdf", label: "PDF Report", icon: FileText, desc: "Formatted report with charts", status: "coming_soon" as const },
  { id: "json", label: "JSON", icon: FileJson, desc: "Raw API data for developers", status: "available" as const },
  { id: "image", label: "Dashboard Screenshot", icon: Image, desc: "PNG capture of current view", status: "coming_soon" as const },
];

const SHARE_OPTIONS = [
  { id: "link", label: "Share Link", icon: Share2, desc: "Generate a shareable view link" },
  { id: "email", label: "Email Report", icon: Send, desc: "Send summary via email" },
];

export default function ExportPage() {
  const [exporting, setExporting] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setExporting(format);
    setTimeout(() => setExporting(null), 2000);
  };

  return (
    <div className="animate__animated animate__fadeInUp">
      <h1 className="text-xl font-extrabold text-dark-text mb-1 animate-fade-in flex items-center gap-2">
        <Download size={20} /> Export & Share
      </h1>
      <p className="text-sm text-surface-400 mb-6 animate-fade-in">
        Export operational data and share reports with your team
      </p>

      <h2 className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-surface-500 mb-3">Export Formats</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {EXPORT_FORMATS.map((fmt) => {
          const Icon = fmt.icon;
          return (
            <GlassCard key={fmt.id} className="p-4" hover={fmt.status === "available"}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon size={18} className="text-un-blue" />
                  <div>
                    <h3 className="text-sm font-bold text-dark-text">{fmt.label}</h3>
                    <p className="text-[0.7rem] text-surface-500">{fmt.desc}</p>
                  </div>
                </div>
                {fmt.status === "available" ? (
                  <button
                    onClick={() => handleExport(fmt.id)}
                    disabled={exporting === fmt.id}
                    className="px-3 py-1.5 rounded-btn text-xs font-semibold text-white bg-un-blue hover:bg-un-blue/80 transition-colors disabled:opacity-50"
                  >
                    {exporting === fmt.id ? "Exporting..." : "Export"}
                  </button>
                ) : (
                  <span className="text-[0.6rem] font-semibold text-surface-500 px-3 py-1.5 border border-white/[0.06] rounded-btn">
                    Coming Soon
                  </span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <h2 className="text-[0.65rem] font-bold uppercase tracking-[1.5px] text-surface-500 mb-3">Share</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SHARE_OPTIONS.map((opt) => {
          const Icon = opt.icon;
          return (
            <GlassCard key={opt.id} className="p-4" hover>
              <div className="flex items-center gap-3">
                <Icon size={18} className="text-un-blue" />
                <div>
                  <h3 className="text-sm font-bold text-dark-text">{opt.label}</h3>
                  <p className="text-[0.7rem] text-surface-500">{opt.desc}</p>
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}
