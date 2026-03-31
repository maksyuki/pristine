import { createContext, useContext, useState, useCallback, useMemo, useRef, useEffect, type ReactNode } from 'react';
import {
  closeFileInEditorGroup,
  createInitialEditorWorkspace,
  focusEditorGroup,
  moveEditorTab,
  openFileInEditorGroup,
  setActiveTabInEditorGroup,
  splitEditorGroup,
  type EditorDropPosition,
  type EditorGroup,
  type EditorLayoutNode,
  type EditorTab,
} from '../editor/editorLayout';

// ─── Types ──────────────────────────────────────────────────────────────────

export type Tab = EditorTab;

export type MainContentView = 'code' | 'whiteboard' | 'workflow';

interface WorkspaceState {
  activeView: string;
  setActiveView: (view: string) => void;

  mainContentView: MainContentView;
  setMainContentView: (view: MainContentView) => void;

  editorGroups: EditorGroup[];
  editorLayout: EditorLayoutNode | null;
  focusedGroupId: string | null;
  focusGroup: (groupId: string) => void;
  splitGroup: (groupId: string, direction?: 'horizontal' | 'vertical') => void;
  moveTab: (sourceGroupId: string, tabId: string, targetGroupId: string, position: EditorDropPosition) => void;

  tabs: Tab[];
  activeTabId: string;
  openFile: (fileId: string, fileName: string) => void;
  openFileInGroup: (fileId: string, fileName: string, groupId: string) => void;
  closeFile: (fileId: string) => void;
  closeFileInGroup: (groupId: string, fileId: string) => void;
  setActiveTabId: (id: string) => void;
  setActiveTabIdInGroup: (groupId: string, id: string) => void;

  jumpToLine: number | undefined;
  jumpTo: (line: number) => void;

  cursorLine: number;
  cursorCol: number;
  setCursorPos: (line: number, col: number, groupId?: string) => void;

  showLeftPanel: boolean;
  setShowLeftPanel: (show: boolean) => void;
  showBottomPanel: boolean;
  setShowBottomPanel: (show: boolean) => void;
  showRightPanel: boolean;
  setShowRightPanel: (show: boolean) => void;

  fileContents: Record<string, string>;
  loadingFiles: Record<string, boolean>;
  loadErrors: Record<string, string>;
  loadFileContent: (fileId: string) => void;
  updateFileContent: (fileId: string, content: string) => void;

  editorRef: React.MutableRefObject<any>;
  registerEditorRef: (groupId: string, editorInstance: any) => void;
}

// ─── Context ────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function useWorkspace(): WorkspaceState {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [activeView, setActiveView] = useState('explorer');
  const [mainContentView, setMainContentView] = useState<MainContentView>('code');
  const idCounterRef = useRef(2);
  const [editorState, setEditorState] = useState(() => createInitialEditorWorkspace('group-1'));
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showBottomPanel, setShowBottomPanel] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(false);
  const [jumpToLine, setJumpToLine] = useState<number | undefined>();
  const [cursorPositions, setCursorPositions] = useState<Record<string, { line: number; col: number }>>({});
  const [fileContents, setFileContents] = useState<Record<string, string>>({});
  const [loadingFiles, setLoadingFiles] = useState<Record<string, boolean>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const editorRef = useRef<any>(null);
  const editorRefsRef = useRef<Record<string, any>>({});
  const inFlightLoadsRef = useRef<Set<string>>(new Set());
  const isMountedRef = useRef(true);

  const nextGeneratedId = useCallback((prefix: string) => {
    const id = `${prefix}-${idCounterRef.current}`;
    idCounterRef.current += 1;
    return id;
  }, []);

  const focusedGroup = editorState.focusedGroupId ? editorState.groups[editorState.focusedGroupId] : null;
  const tabs = focusedGroup?.tabs ?? [];
  const activeTabId = focusedGroup?.activeTabId ?? '';
  const editorGroups = useMemo(() => Object.values(editorState.groups), [editorState.groups]);
  const cursorLine = editorState.focusedGroupId ? cursorPositions[editorState.focusedGroupId]?.line ?? 1 : 1;
  const cursorCol = editorState.focusedGroupId ? cursorPositions[editorState.focusedGroupId]?.col ?? 1 : 1;

  const focusGroup = useCallback((groupId: string) => {
    setEditorState((current) => focusEditorGroup(current, groupId));
    if (editorRefsRef.current[groupId]) {
      editorRef.current = editorRefsRef.current[groupId];
    }
  }, []);

  const openFileInGroup = useCallback((fileId: string, fileName: string, groupId: string) => {
    setEditorState((current) => openFileInEditorGroup(current, groupId, fileId, fileName));
  }, []);

  const openFile = useCallback((fileId: string, fileName: string) => {
    setEditorState((current) => {
      const targetGroupId = current.focusedGroupId ?? nextGeneratedId('group');
      const baseState = current.groups[targetGroupId]
        ? current
        : createInitialEditorWorkspace(targetGroupId);

      return openFileInEditorGroup(baseState, targetGroupId, fileId, fileName);
    });
  }, [nextGeneratedId]);

  const closeFileInGroup = useCallback((groupId: string, fileId: string) => {
    setEditorState((current) => closeFileInEditorGroup(current, groupId, fileId));
  }, []);

  const closeFile = useCallback((fileId: string) => {
    setEditorState((current) => {
      const targetGroupId = current.focusedGroupId && current.groups[current.focusedGroupId]?.tabs.some((tab) => tab.id === fileId)
        ? current.focusedGroupId
        : Object.values(current.groups).find((group) => group.tabs.some((tab) => tab.id === fileId))?.id;

      return targetGroupId ? closeFileInEditorGroup(current, targetGroupId, fileId) : current;
    });
  }, []);

  const setActiveTabIdInGroup = useCallback((groupId: string, id: string) => {
    setEditorState((current) => setActiveTabInEditorGroup(current, groupId, id));
    focusGroup(groupId);
  }, [focusGroup]);

  const setActiveTabId = useCallback((id: string) => {
    setEditorState((current) => {
      const targetGroupId = current.focusedGroupId ?? Object.values(current.groups).find((group) => group.tabs.some((tab) => tab.id === id))?.id;
      return targetGroupId ? setActiveTabInEditorGroup(current, targetGroupId, id) : current;
    });
  }, []);

  const splitGroup = useCallback((groupId: string, direction: 'horizontal' | 'vertical' = 'horizontal') => {
    setEditorState((current) => splitEditorGroup(
      current,
      groupId,
      nextGeneratedId('group'),
      nextGeneratedId('split'),
      direction,
    ));
  }, [nextGeneratedId]);

  const moveTab = useCallback((sourceGroupId: string, tabId: string, targetGroupId: string, position: EditorDropPosition) => {
    setEditorState((current) => moveEditorTab(
      current,
      sourceGroupId,
      tabId,
      targetGroupId,
      position,
      nextGeneratedId('group'),
      nextGeneratedId('split'),
    ));
  }, [nextGeneratedId]);

  const jumpTo = useCallback((line: number) => {
    setJumpToLine(line);
    setTimeout(() => setJumpToLine(undefined), 100);
  }, []);

  const setCursorPos = useCallback((line: number, col: number, groupId?: string) => {
    setCursorPositions((current) => ({
      ...current,
      [(groupId ?? editorState.focusedGroupId ?? 'group-1')]: { line, col },
    }));
  }, [editorState.focusedGroupId]);

  const loadFileContent = useCallback((fileId: string) => {
    if (!fileId || fileContents[fileId] !== undefined || inFlightLoadsRef.current.has(fileId)) {
      return;
    }

    const fsApi = window.electronAPI?.fs;
    if (!fsApi) {
      setLoadErrors((current) => ({ ...current, [fileId]: 'Filesystem API unavailable' }));
      return;
    }

    inFlightLoadsRef.current.add(fileId);
    setLoadingFiles((current) => ({ ...current, [fileId]: true }));

    void fsApi.readFile(fileId, 'utf-8')
      .then((content) => {
        if (!isMountedRef.current) {
          return;
        }

        setFileContents((current) => ({ ...current, [fileId]: content }));
        setLoadErrors((current) => {
          if (!current[fileId]) {
            return current;
          }

          const next = { ...current };
          delete next[fileId];
          return next;
        });
      })
      .catch((error: unknown) => {
        if (!isMountedRef.current) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Unable to load file';
        setLoadErrors((current) => ({ ...current, [fileId]: message }));
      })
      .finally(() => {
        inFlightLoadsRef.current.delete(fileId);
        if (!isMountedRef.current) {
          return;
        }

        setLoadingFiles((current) => ({ ...current, [fileId]: false }));
      });
  }, [fileContents]);

  const updateFileContent = useCallback((fileId: string, content: string) => {
    setFileContents((current) => ({ ...current, [fileId]: content }));
  }, []);

  const registerEditorRef = useCallback((groupId: string, editorInstance: any) => {
    editorRefsRef.current[groupId] = editorInstance;
    if (editorState.focusedGroupId === groupId) {
      editorRef.current = editorInstance;
    }
  }, [editorState.focusedGroupId]);

  useEffect(() => () => {
    isMountedRef.current = false;
  }, []);

  useEffect(() => {
    if (editorState.focusedGroupId && editorRefsRef.current[editorState.focusedGroupId]) {
      editorRef.current = editorRefsRef.current[editorState.focusedGroupId];
    }
  }, [editorState.focusedGroupId]);

  return (
    <WorkspaceContext.Provider value={{
      activeView, setActiveView,
      mainContentView, setMainContentView,
      editorGroups,
      editorLayout: editorState.layout,
      focusedGroupId: editorState.focusedGroupId,
      focusGroup,
      splitGroup,
      moveTab,
      tabs, activeTabId, openFile, openFileInGroup, closeFile, closeFileInGroup, setActiveTabId, setActiveTabIdInGroup,
      jumpToLine, jumpTo,
      cursorLine, cursorCol, setCursorPos,
      showLeftPanel, setShowLeftPanel,
      showBottomPanel, setShowBottomPanel,
      showRightPanel, setShowRightPanel,
      fileContents,
      loadingFiles,
      loadErrors,
      loadFileContent,
      updateFileContent,
      editorRef,
      registerEditorRef,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
