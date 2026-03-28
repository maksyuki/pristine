import { useState } from "react";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { StaticCheckPanel } from "./StaticCheckPanel";
import { ReferencesPanel } from "./ReferencesPanel";

interface RightSidePanelProps {
  onFileOpen: (fileId: string, fileName: string) => void;
  onLineJump: (line: number) => void;
}

export function RightSidePanel({
  onFileOpen,
  onLineJump,
}: RightSidePanelProps) {
  const [tab, setTab] = useState<
    "ai" | "static" | "references"
  >("ai");

  const tabs = [
    { id: "ai", label: "AI Assistant" },
    { id: "static", label: "Static Check" },
    { id: "references", label: "References" },
  ] as const;

  return (
    <div className="flex flex-col h-full bg-ide-sidebar-bg overflow-hidden">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-ide-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-3 py-2 transition-colors border-b-2 ${
              tab === t.id
                ? "text-white border-ide-accent"
                : "text-ide-text-muted border-transparent hover:text-ide-text"
            }`}
            style={{
              fontSize: "11px",
              fontWeight: tab === t.id ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-hidden">
        {tab === "ai" && <AIAssistantPanel />}
        {tab === "static" && (
          <StaticCheckPanel
            onFileOpen={onFileOpen}
            onLineJump={onLineJump}
          />
        )}
        {tab === "references" && (
          <ReferencesPanel
            onFileOpen={onFileOpen}
            onLineJump={onLineJump}
          />
        )}
      </div>
    </div>
  );
}
