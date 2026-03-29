import { PanelGroup, Panel, PanelResizeHandle } from 'react-resizable-panels';
import { MenuBar } from './components/MenuBar';
import { ActivityBar } from './components/ActivityBar';
import { LeftSidePanel } from './components/LeftSidePanel';
import { EditorArea } from './components/EditorArea';
import { RightSidePanel } from './components/RightSidePanel';
import { BottomPanel } from './components/BottomPanel';
import { StatusBar } from './components/StatusBar';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';

// ─── ResizeHandle ────────────────────────────────────────────────────────────
const ResizeHandle = ({ direction = 'vertical' }: { direction?: 'vertical' | 'horizontal' }) => (
  <PanelResizeHandle
    className={`group relative flex items-center justify-center ${
      direction === 'vertical' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
    } bg-ide-sidebar-bg hover:bg-ide-accent-vivid transition-colors z-10`}
  >
    <div className={`${
      direction === 'vertical' ? 'w-0.5 h-8' : 'h-0.5 w-8'
    } bg-ide-border group-hover:bg-ide-accent-vivid rounded transition-colors`} />
  </PanelResizeHandle>
);

// ─── AppLayout (consumes context) ────────────────────────────────────────────
function AppLayout() {
  const {
    activeView, setActiveView,
    tabs, activeTabId, openFile, closeFile, setActiveTabId,
    jumpToLine, jumpTo, setCursorPos,
    showLeftPanel, setShowLeftPanel,
    showBottomPanel, setShowBottomPanel,
    showRightPanel, setShowRightPanel,
    editorRef,
    cursorLine, cursorCol,
  } = useWorkspace();

  const handleActivityItemSelect = (nextView: string) => {
    if (nextView === activeView) {
      setShowLeftPanel(!showLeftPanel);
      return;
    }

    setActiveView(nextView);
    if (!showLeftPanel) {
      setShowLeftPanel(true);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-ide-bg text-ide-text overflow-hidden">
      <MenuBar
        showLeftPanel={showLeftPanel}
        showBottomPanel={showBottomPanel}
        showRightPanel={showRightPanel}
        onToggleLeftPanel={() => setShowLeftPanel(!showLeftPanel)}
        onToggleBottomPanel={() => setShowBottomPanel(!showBottomPanel)}
        onToggleRightPanel={() => setShowRightPanel(!showRightPanel)}
      />

      <div className="flex flex-1 overflow-hidden">
        <ActivityBar
          activeView={activeView}
          onItemSelect={handleActivityItemSelect}
          isLeftSidebarHidden={!showLeftPanel}
        />

        <PanelGroup direction="horizontal" className="flex-1">
          {showLeftPanel && (
            <>
              <Panel defaultSize={12} minSize={12} maxSize={35} id="left-panel" order={1}>
                <LeftSidePanel
                  activeFileId={activeTabId}
                  onFileOpen={openFile}
                  onLineJump={jumpTo}
                  currentOutlineId={activeTabId}
                />
              </Panel>

              <ResizeHandle direction="vertical" />
            </>
          )}

          <Panel defaultSize={55} minSize={30} id="center-panel" order={2}>
            <PanelGroup direction="vertical">
              <Panel defaultSize={65} minSize={25} id="editor-panel" order={1}>
                <EditorArea
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={setActiveTabId}
                  onTabClose={closeFile}
                  editorRef={editorRef}
                  jumpToLine={jumpToLine}
                  onCursorChange={setCursorPos}
                />
              </Panel>

              {showBottomPanel && (
                <>
                  <PanelResizeHandle
                    className="h-1 group cursor-row-resize bg-ide-sidebar-bg hover:bg-ide-accent-vivid transition-colors z-10"
                  />
                  <Panel defaultSize={35} minSize={15} maxSize={60} id="bottom-panel" order={2}>
                    <BottomPanel onClose={() => setShowBottomPanel(false)} />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </Panel>

          {showRightPanel && (
            <>
              <ResizeHandle direction="vertical" />

              <Panel defaultSize={18} minSize={18} maxSize={45} id="right-panel" order={3}>
                <RightSidePanel
                  onFileOpen={openFile}
                  onLineJump={jumpTo}
                />
              </Panel>
            </>
          )}
        </PanelGroup>
      </div>

      <StatusBar
        activeFileId={activeTabId}
        cursorLine={cursorLine}
        cursorCol={cursorCol}
      />
    </div>
  );
}

export default function App() {
  return (
    <WorkspaceProvider>
      <AppLayout />
    </WorkspaceProvider>
  );
}