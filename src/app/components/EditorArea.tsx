import { useEffect, useRef, useState } from 'react';
import Editor, { useMonaco } from '@monaco-editor/react';
import {
  X, ChevronRight, Split,
  MoreHorizontal, Circle,
} from 'lucide-react';
import { problemsList } from '../../data/mockData';
import { getEditorLanguage, getWorkspaceSegments } from '../workspace/workspaceFiles';
import { defineDraculaTheme } from '../editor/draculaTheme';
import { useRegisterEditorLanguages } from '../editor/registerLanguages';
import { FileTypeBadge } from './FileTypeBadge';

interface Tab {
  id: string;
  name: string;
  modified?: boolean;
}

interface EditorAreaProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (id: string) => void;
  onTabClose: (id: string) => void;
  editorRef: React.MutableRefObject<any>;
  jumpToLine?: number;
  onCursorChange?: (line: number, col: number) => void;
}

// ─── Tab Component ─────────────────────────────────────────────────────────────
function EditorTab({
  tab, isActive, onActivate, onClose,
}: { tab: Tab; isActive: boolean; onActivate: () => void; onClose: () => void }) {
  return (
    <div
      data-testid={`editor-tab-${tab.id}`}
      className={`flex items-center gap-1 px-3 h-full cursor-pointer group border-r border-ide-sidebar-bg transition-colors shrink-0 min-w-[100px] max-w-[200px] ${
        isActive
          ? 'bg-ide-bg text-white border-t-2 border-t-ide-accent'
          : 'bg-ide-tab-bg text-ide-text-muted hover:bg-ide-tab-hover border-t-2 border-t-transparent'
      }`}
      onClick={onActivate}
    >
      <FileTypeBadge
        name={tab.name}
        testId={`editor-tab-badge-${tab.id}`}
        className="shrink-0 text-[10px] font-bold font-mono"
        fallbackClassName="text-ide-text"
      />
      <span className="flex-1 truncate text-[12px]">
        {tab.name}
      </span>
      {tab.modified && <Circle size={7} className="fill-white text-white shrink-0" />}
      <button
        data-testid={`editor-tab-close-${tab.id}`}
        className="shrink-0 p-0.5 rounded hover:bg-ide-border opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ─── Breadcrumb ───────────────────────────────────────────────────────────────
function Breadcrumb({ filePath }: { filePath: string }) {
  const segments = getWorkspaceSegments(filePath);

  return (
    <div className="flex items-center gap-0.5 px-3 h-6 bg-ide-bg border-b border-ide-border shrink-0">
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-0.5">
          {i > 0 && <ChevronRight size={11} className="text-ide-text-dimmer" />}
          <span
            className={`cursor-pointer hover:text-white transition-colors ${
              i === segments.length - 1 ? 'text-ide-text' : 'text-ide-text-muted'
            } text-[12px]`}
          >
            {seg}
          </span>
        </span>
      ))}
    </div>
  );
}

// ─── Editor Area Component ─────────────────────────────────────────────────────
export function EditorArea({
  tabs, activeTabId, onTabChange, onTabClose, editorRef, jumpToLine, onCursorChange,
}: EditorAreaProps) {
  const monaco = useMonaco();
  useRegisterEditorLanguages(monaco);
  const [contentCache, setContentCache] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const inFlightLoadsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const code = activeTabId
    ? loadErrors[activeTabId]
      ? `// Failed to load ${activeTab?.name ?? activeTabId}\n// ${loadErrors[activeTabId]}\n`
      : loadingFiles[activeTabId]
      ? `// ${activeTab?.name ?? activeTabId}\n// Loading file contents...\n`
      : contentCache[activeTabId] ?? `// ${activeTab?.name ?? activeTabId}\n// Loading file contents...\n`
    : '';

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    if (!activeTabId || contentCache[activeTabId] || inFlightLoadsRef.current.has(activeTabId)) {
      return;
    }

    const fsApi = window.electronAPI?.fs;
    if (!fsApi) {
      setLoadErrors((current) => ({ ...current, [activeTabId]: 'Filesystem API unavailable' }));
      return;
    }

    inFlightLoadsRef.current.add(activeTabId);
    setLoadingFiles((current) => ({ ...current, [activeTabId]: true }));
    void fsApi.readFile(activeTabId, 'utf-8')
      .then((content) => {
        if (!isMountedRef.current) {
          return;
        }

        setContentCache((current) => ({ ...current, [activeTabId]: content }));
        setLoadErrors((current) => {
          if (!current[activeTabId]) {
            return current;
          }

          const next = { ...current };
          delete next[activeTabId];
          return next;
        });
      })
      .catch((error: unknown) => {
        if (!isMountedRef.current) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load file';
        setLoadErrors((current) => ({ ...current, [activeTabId]: message }));
      })
      .finally(() => {
        inFlightLoadsRef.current.delete(activeTabId);

        if (!isMountedRef.current) {
          return;
        }

        setLoadingFiles((current) => ({ ...current, [activeTabId]: false }));
      });
  }, [activeTabId, contentCache]);

  // Build markers from problems
  useEffect(() => {
    if (!monaco) return;
    const models = monaco.editor.getModels();
    models.forEach((m: any) => {
      const issues = problemsList.filter((p) => p.fileId === activeTabId);
      const markers = issues.map((p) => ({
        severity: p.severity === 'error'
          ? monaco.MarkerSeverity.Error
          : p.severity === 'warning'
          ? monaco.MarkerSeverity.Warning
          : monaco.MarkerSeverity.Info,
        startLineNumber: p.line,
        startColumn: p.column,
        endLineNumber: p.line,
        endColumn: p.column + 30,
        message: p.message,
        code: p.code,
        source: p.source,
      }));
      monaco.editor.setModelMarkers(m, 'rtl-lint', markers);
    });
  }, [monaco, activeTabId]);

  // Jump to line
  useEffect(() => {
    if (!jumpToLine || !editorRef.current) return;
    editorRef.current.revealLineInCenter(jumpToLine);
    editorRef.current.setPosition({ lineNumber: jumpToLine, column: 1 });
    editorRef.current.focus();
  }, [jumpToLine, editorRef]);

  if (tabs.length === 0) {
    return (
      <div className="flex flex-col h-full bg-ide-bg items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-ide-sidebar-bg flex items-center justify-center mx-auto mb-4">
            <span className="text-ide-accent text-[28px] font-bold">R</span>
          </div>
          <div className="text-ide-text mb-1 text-[20px]">RTL Studio</div>
          <div className="text-ide-text-muted text-[13px]">Open a file to start editing, or select one from the Explorer</div>
          <div className="mt-6 flex flex-col gap-1 text-left">
            {[
              ['Ctrl+P', 'Quick Open File'],
              ['Ctrl+Shift+P', 'Command Palette'],
              ['Ctrl+`', 'Open Terminal'],
            ].map(([key, label]) => (
              <div key={key} className="flex items-center gap-3">
                <kbd className="px-2 py-0.5 bg-ide-border rounded text-ide-text border border-ide-text-dim text-[11px]">{key}</kbd>
                <span className="text-ide-text-muted text-[12px]">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-ide-bg overflow-hidden">
      {/* Tab bar */}
      <div className="flex items-stretch h-9 bg-ide-tab-bg overflow-x-auto shrink-0 border-b border-ide-sidebar-bg">
        {tabs.map((tab) => (
          <EditorTab
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onActivate={() => onTabChange(tab.id)}
            onClose={() => onTabClose(tab.id)}
          />
        ))}
        <div className="flex-1" />
        <button
          className="px-2 text-ide-text-muted hover:text-ide-text transition-colors shrink-0"
          title="Split Editor"
        >
          <Split size={14} />
        </button>
        <button className="px-2 text-ide-text-muted hover:text-ide-text transition-colors shrink-0">
          <MoreHorizontal size={14} />
        </button>
      </div>

      {/* Breadcrumb */}
      {activeTab && <Breadcrumb filePath={activeTabId} />}

      {/* Monaco Editor */}
      <div className="flex-1 overflow-hidden bg-ide-editor-bg">
        <Editor
          height="100%"
          language={getEditorLanguage(activeTabId)}
          value={code}
          theme="dracula"
          beforeMount={(monaco) => {
            defineDraculaTheme(monaco);
          }}
          onMount={(editor) => {
            editorRef.current = editor;
            editor.onDidChangeCursorPosition((e: any) => {
              onCursorChange?.(e.position.lineNumber, e.position.column);
            });
          }}
          options={{
            fontSize: 13,
            fontFamily: '"JetBrains Mono", "Cascadia Code", "Fira Code", Consolas, monospace',
            fontLigatures: true,
            lineNumbers: 'on',
            lineNumbersMinChars: 4,
            glyphMargin: true,
            folding: true,
            foldingStrategy: 'indentation',
            minimap: { enabled: true, scale: 1, showSlider: 'mouseover' },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'off',
            rulers: [80, 120],
            renderWhitespace: 'selection',
            bracketPairColorization: { enabled: true },
            guides: { bracketPairs: true, indentation: true },
            suggest: { showKeywords: true, showSnippets: true },
            quickSuggestions: { other: true, comments: false, strings: false },
            parameterHints: { enabled: true },
            cursorBlinking: 'smooth',
            smoothScrolling: true,
            scrollbar: {
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
            },
            padding: { top: 8 },
          }}
        />
      </div>
    </div>
  );
}