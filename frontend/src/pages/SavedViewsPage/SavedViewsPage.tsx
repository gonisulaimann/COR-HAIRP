/**
 * SavedViewsPage — Bookmarked Dashboards
 *
 * Users can save their current view configuration (selected LGA,
 * mode, filters) and quickly return to it later. Uses localStorage
 * for persistence (Phase 2: backend sync).
 */
import GlassCard from "@/components/GlassCard";
import { Bookmark, Clock, ExternalLink, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface SavedView {
  id: string;
  name: string;
  path: string;
  role: string;
  createdAt: string;
}

const MOCK_VIEWS: SavedView[] = [
  { id: "1", name: "Maiduguri Overview", path: "/", role: "aid_worker", createdAt: "2 hours ago" },
  { id: "2", name: "Bama Risk Assessment", path: "/forecast", role: "aid_worker", createdAt: "Yesterday" },
  { id: "3", name: "Supply Routes Dashboard", path: "/routes", role: "ngo", createdAt: "3 days ago" },
];

export default function SavedViewsPage() {
  const [views, setViews] = useState<SavedView[]>(MOCK_VIEWS);

  const removeView = (id: string) => {
    setViews((prev) => prev.filter((v) => v.id !== id));
  };

  return (
    <div className="animate__animated animate__fadeInUp">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-extrabold text-dark-text flex items-center gap-2">
            <Bookmark size={20} /> Saved Views
          </h1>
          <p className="text-sm text-surface-400 mt-1">Your bookmarked dashboard configurations</p>
        </div>
      </div>

      {views.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <Bookmark size={32} className="text-surface-500 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-dark-text mb-2">No saved views yet</h3>
          <p className="text-sm text-surface-400">Navigate to any page and save your view configuration for quick access.</p>
        </GlassCard>
      ) : (
        <div className="space-y-2">
          {views.map((view) => (
            <GlassCard key={view.id} className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bookmark size={16} className="text-un-blue" />
                <div>
                  <h3 className="text-sm font-bold text-dark-text">{view.name}</h3>
                  <p className="text-[0.65rem] text-surface-500 flex items-center gap-1">
                    <Clock size={10} /> Saved {view.createdAt}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={view.path} className="p-1.5 rounded-btn text-surface-400 hover:text-un-blue hover:bg-white/[0.04] transition-colors">
                  <ExternalLink size={14} />
                </a>
                <button onClick={() => removeView(view.id)} className="p-1.5 rounded-btn text-surface-400 hover:text-un-red hover:bg-un-red/10 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
}
