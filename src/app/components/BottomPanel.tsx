import { useState, useMemo } from 'react';
import {
  Terminal, X, Plus,
  AlertCircle, AlertTriangle,
  Bug, Square,
} from 'lucide-react';
import { problemsList } from '../../data/mockData';
import { TerminalPanel } from './TerminalPanel';
import { OutputPanel } from './OutputPanel';
import { ProblemsTabPanel } from './ProblemsTabPanel';
import { DebugConsole } from './DebugConsole';

interface BottomPanelProps {
  onClose?: () => void;
}

export function BottomPanel({ onClose }: BottomPanelProps) {
  const [tab, setTab] = useState<'terminal' | 'output' | 'problems' | 'debug'>('terminal');

  const tabs = [
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'output', label: 'Output', icon: null },
    { id: 'problems', label: `Problems (${problemsList.length})`, icon: null },
    { id: 'debug', label: 'Debug Console', icon: Bug },
  ] as const;

  const errCount = useMemo(() => problemsList.filter((p) => p.severity === 'error').length, []);
  const warnCount = useMemo(() => problemsList.filter((p) => p.severity === 'warning').length, []);

  return (
    <div className="flex flex-col h-full bg-ide-bg border-t border-ide-border overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-center h-8 bg-ide-sidebar-bg border-b border-ide-border shrink-0">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 h-full transition-colors border-b-2 ${
              tab === t.id
                ? 'text-white border-ide-accent'
                : 'text-ide-text-muted border-transparent hover:text-ide-text'
            } text-[12px]`}
          >
            {t.id === 'problems' && errCount > 0 && (
              <AlertCircle size={11} className="text-ide-error" />
            )}
            {t.label}
          </button>
        ))}

        <div className="flex items-center gap-1 ml-auto pr-2">
          <button
            title="New Terminal"
            className="p-1 text-ide-text-muted hover:text-ide-text transition-colors"
            onClick={() => setTab('terminal')}
          >
            <Plus size={13} />
          </button>
          <button
            title="Close Panel"
            className="p-1 text-ide-text-muted hover:text-ide-text transition-colors"
            onClick={onClose}
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden">
        {tab === 'terminal' && <TerminalPanel />}
        {tab === 'output' && <OutputPanel />}
        {tab === 'problems' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 border-b border-ide-border shrink-0">
              <AlertCircle size={11} className="text-ide-error" />
              <span className="text-ide-error text-[11px]">{errCount} errors</span>
              <AlertTriangle size={11} className="text-ide-warning" />
              <span className="text-ide-warning text-[11px]">{warnCount} warnings</span>
            </div>
            <ProblemsTabPanel />
          </div>
        )}
        {tab === 'debug' && (
          <div className="flex flex-col h-full">
            <div className="flex items-center gap-2 px-3 py-1 border-b border-ide-border shrink-0">
              <button className="flex items-center gap-1 px-2 py-0.5 bg-ide-accent hover:bg-ide-accent-hover text-white rounded transition-colors text-[11px]">
                <Bug size={11} />
                Start Debugging
              </button>
              <button className="flex items-center gap-1 px-2 py-0.5 text-ide-text-muted hover:text-ide-text rounded transition-colors text-[11px]">
                <Square size={11} />
                Stop
              </button>
            </div>
            <DebugConsole />
          </div>
        )}
      </div>
    </div>
  );
}
