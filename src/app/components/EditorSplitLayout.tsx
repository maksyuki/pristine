import { useMemo, useRef, useState } from 'react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { EditorArea } from './EditorArea';
import { useWorkspace } from '../context/WorkspaceContext';
import type { EditorDropPosition, EditorLayoutNode, SplitDirection } from '../editor/editorLayout';

interface DragState {
  sourceGroupId: string;
  tabId: string;
}

interface DropTargetState {
  groupId: string;
  position: EditorDropPosition;
}

function ResizeHandle({ direction }: { direction: SplitDirection }) {
  return (
    <PanelResizeHandle
      className={`group relative flex items-center justify-center ${
        direction === 'horizontal' ? 'w-1 cursor-col-resize' : 'h-1 cursor-row-resize'
      } bg-ide-sidebar-bg hover:bg-ide-accent-vivid transition-colors z-10`}
    >
      <div
        className={`${
          direction === 'horizontal' ? 'w-0.5 h-8' : 'h-0.5 w-8'
        } bg-ide-border group-hover:bg-ide-accent-vivid rounded transition-colors`}
      />
    </PanelResizeHandle>
  );
}

function getDropPosition(rect: DOMRect, clientX: number, clientY: number): EditorDropPosition {
  const relativeX = (clientX - rect.left) / rect.width;
  const relativeY = (clientY - rect.top) / rect.height;
  const edgeThreshold = 0.22;

  if (relativeY <= edgeThreshold) {
    return 'top';
  }

  if (relativeY >= 1 - edgeThreshold) {
    return 'bottom';
  }

  if (relativeX <= edgeThreshold) {
    return 'left';
  }

  if (relativeX >= 1 - edgeThreshold) {
    return 'right';
  }

  return 'center';
}

function DropIndicator({ position }: { position: EditorDropPosition }) {
  const baseClassName = 'pointer-events-none absolute z-20 border-2 border-ide-accent-vivid bg-ide-accent/15';

  const positionClassName = position === 'center'
    ? 'inset-3'
    : position === 'left'
    ? 'left-0 top-0 h-full w-1/3 border-r-0'
    : position === 'right'
    ? 'right-0 top-0 h-full w-1/3 border-l-0'
    : position === 'top'
    ? 'left-0 top-0 h-1/3 w-full border-b-0'
    : 'bottom-0 left-0 h-1/3 w-full border-t-0';

  return <div data-testid={`editor-drop-indicator-${position}`} className={`${baseClassName} ${positionClassName}`} />;
}

function EditorGroupLeaf({
  groupId,
  focused,
  jumpToLine,
  dropPosition,
  onDropPosition,
  onClearDrop,
  onFocus,
  onMoveTab,
  onDragStart,
  onDragEnd,
  dragState,
}: {
  groupId: string;
  focused: boolean;
  jumpToLine?: number;
  dropPosition: EditorDropPosition | null;
  onDropPosition: (groupId: string, position: EditorDropPosition) => void;
  onClearDrop: (groupId: string) => void;
  onFocus: (groupId: string) => void;
  onMoveTab: (targetGroupId: string, position: EditorDropPosition) => void;
  onDragStart: (tabId: string) => void;
  onDragEnd: () => void;
  dragState: DragState | null;
}) {
  const {
    editorGroups,
    setActiveTabIdInGroup,
    closeFileInGroup,
    splitGroup,
    setCursorPos,
    fileContents,
    loadingFiles,
    loadErrors,
    loadFileContent,
    updateFileContent,
    registerEditorRef,
  } = useWorkspace();
  const group = editorGroups.find((currentGroup) => currentGroup.id === groupId);
  const editorRef = useRef<any>(null);

  if (!group) {
    return null;
  }

  return (
    <div
      data-testid={`editor-group-${group.id}`}
      className={`relative h-full min-w-0 ${focused ? 'ring-1 ring-inset ring-ide-accent-vivid/50' : ''}`}
      onMouseDown={() => onFocus(group.id)}
      onDragOver={(event) => {
        if (!dragState) {
          return;
        }

        event.preventDefault();
        onDropPosition(group.id, getDropPosition(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY));
      }}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node | null)) {
          return;
        }

        onClearDrop(group.id);
      }}
      onDrop={(event) => {
        if (!dragState) {
          return;
        }

        event.preventDefault();
        onMoveTab(group.id, getDropPosition(event.currentTarget.getBoundingClientRect(), event.clientX, event.clientY));
      }}
    >
      {dropPosition && <DropIndicator position={dropPosition} />}
      <EditorArea
        tabs={group.tabs}
        activeTabId={group.activeTabId}
        onTabChange={(tabId) => setActiveTabIdInGroup(group.id, tabId)}
        onTabClose={(tabId) => closeFileInGroup(group.id, tabId)}
        editorRef={editorRef}
        jumpToLine={focused ? jumpToLine : undefined}
        onCursorChange={(line, col) => setCursorPos(line, col, group.id)}
        onSplitEditor={() => splitGroup(group.id, 'horizontal')}
        onFocus={() => onFocus(group.id)}
        onTabDragStart={onDragStart}
        onTabDragEnd={onDragEnd}
        contentCache={fileContents}
        loadingFiles={loadingFiles}
        loadErrors={loadErrors}
        onLoadFile={loadFileContent}
        onContentChange={updateFileContent}
        onEditorMount={(editor) => registerEditorRef(group.id, editor)}
      />
    </div>
  );
}

export function EditorSplitLayout({ jumpToLine }: { jumpToLine?: number }) {
  const {
    editorLayout,
    focusedGroupId,
    focusGroup,
    moveTab,
    editorGroups,
  } = useWorkspace();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTargetState | null>(null);

  const groupsById = useMemo(
    () => Object.fromEntries(editorGroups.map((group) => [group.id, group])),
    [editorGroups],
  );

  const clearDragState = () => {
    setDragState(null);
    setDropTarget(null);
  };

  const renderNode = (node: EditorLayoutNode | null): React.ReactNode => {
    if (!node) {
      return (
        <EditorArea
          tabs={[]}
          activeTabId=""
          onTabChange={() => undefined}
          onTabClose={() => undefined}
          editorRef={{ current: null }}
        />
      );
    }

    if (node.type === 'group') {
      const group = groupsById[node.groupId];
      if (!group) {
        return null;
      }

      return (
        <EditorGroupLeaf
          key={group.id}
          groupId={group.id}
          focused={focusedGroupId === group.id}
          jumpToLine={jumpToLine}
          dropPosition={dropTarget?.groupId === group.id ? dropTarget.position : null}
          onDropPosition={(groupId, position) => setDropTarget({ groupId, position })}
          onClearDrop={(groupId) => setDropTarget((current) => (current?.groupId === groupId ? null : current))}
          onFocus={focusGroup}
          onMoveTab={(targetGroupId, position) => {
            if (!dragState) {
              return;
            }

            moveTab(dragState.sourceGroupId, dragState.tabId, targetGroupId, position);
            clearDragState();
          }}
          onDragStart={(tabId) => setDragState({ sourceGroupId: group.id, tabId })}
          onDragEnd={clearDragState}
          dragState={dragState}
        />
      );
    }

    const direction = node.direction;
    return (
      <PanelGroup direction={direction} className="h-full min-w-0">
        <Panel defaultSize={50} minSize={15}>
          {renderNode(node.children[0])}
        </Panel>
        <ResizeHandle direction={direction} />
        <Panel defaultSize={50} minSize={15}>
          {renderNode(node.children[1])}
        </Panel>
      </PanelGroup>
    );
  };

  return <div className="h-full min-w-0">{renderNode(editorLayout)}</div>;
}
