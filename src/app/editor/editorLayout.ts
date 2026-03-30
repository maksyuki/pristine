export type SplitDirection = 'horizontal' | 'vertical';
export type EditorDropPosition = 'center' | 'left' | 'right' | 'top' | 'bottom';

export interface EditorTab {
  id: string;
  name: string;
  modified?: boolean;
}

export interface EditorGroup {
  id: string;
  tabs: EditorTab[];
  activeTabId: string;
}

export interface EditorLayoutGroupNode {
  type: 'group';
  groupId: string;
}

export interface EditorLayoutSplitNode {
  type: 'split';
  id: string;
  direction: SplitDirection;
  children: [EditorLayoutNode, EditorLayoutNode];
}

export type EditorLayoutNode = EditorLayoutGroupNode | EditorLayoutSplitNode;

export interface EditorWorkspaceModel {
  layout: EditorLayoutNode | null;
  groups: Record<string, EditorGroup>;
  focusedGroupId: string | null;
}

function createGroupNode(groupId: string): EditorLayoutGroupNode {
  return { type: 'group', groupId };
}

export function createEditorGroup(id: string, tabs: EditorTab[] = [], activeTabId?: string): EditorGroup {
  return {
    id,
    tabs,
    activeTabId: activeTabId ?? tabs[0]?.id ?? '',
  };
}

export function createInitialEditorWorkspace(initialGroupId: string): EditorWorkspaceModel {
  return {
    layout: createGroupNode(initialGroupId),
    groups: {
      [initialGroupId]: createEditorGroup(initialGroupId),
    },
    focusedGroupId: initialGroupId,
  };
}

export function getFirstGroupId(layout: EditorLayoutNode | null): string | null {
  if (!layout) {
    return null;
  }

  if (layout.type === 'group') {
    return layout.groupId;
  }

  return getFirstGroupId(layout.children[0]) ?? getFirstGroupId(layout.children[1]);
}

function replaceLayoutNode(
  layout: EditorLayoutNode,
  targetGroupId: string,
  replacer: (node: EditorLayoutGroupNode) => EditorLayoutNode,
): EditorLayoutNode {
  if (layout.type === 'group') {
    return layout.groupId === targetGroupId ? replacer(layout) : layout;
  }

  return {
    ...layout,
    children: [
      replaceLayoutNode(layout.children[0], targetGroupId, replacer),
      replaceLayoutNode(layout.children[1], targetGroupId, replacer),
    ],
  };
}

function removeGroupLayoutNode(layout: EditorLayoutNode | null, targetGroupId: string): EditorLayoutNode | null {
  if (!layout) {
    return null;
  }

  if (layout.type === 'group') {
    return layout.groupId === targetGroupId ? null : layout;
  }

  const left = removeGroupLayoutNode(layout.children[0], targetGroupId);
  const right = removeGroupLayoutNode(layout.children[1], targetGroupId);

  if (!left && !right) {
    return null;
  }

  if (!left) {
    return right;
  }

  if (!right) {
    return left;
  }

  return {
    ...layout,
    children: [left, right],
  };
}

function normalizeFocusedGroup(model: EditorWorkspaceModel): EditorWorkspaceModel {
  const nextFocusedGroupId = model.focusedGroupId && model.groups[model.focusedGroupId]
    ? model.focusedGroupId
    : getFirstGroupId(model.layout);

  return {
    ...model,
    focusedGroupId: nextFocusedGroupId,
  };
}

function removeEmptyGroup(model: EditorWorkspaceModel, groupId: string): EditorWorkspaceModel {
  const group = model.groups[groupId];
  if (!group || group.tabs.length > 0) {
    return model;
  }

  const nextGroups = { ...model.groups };
  delete nextGroups[groupId];

  const nextLayout = removeGroupLayoutNode(model.layout, groupId);
  return normalizeFocusedGroup({
    layout: nextLayout,
    groups: nextGroups,
    focusedGroupId: model.focusedGroupId,
  });
}

export function focusEditorGroup(model: EditorWorkspaceModel, groupId: string): EditorWorkspaceModel {
  if (!model.groups[groupId]) {
    return model;
  }

  return {
    ...model,
    focusedGroupId: groupId,
  };
}

export function openFileInEditorGroup(
  model: EditorWorkspaceModel,
  groupId: string,
  fileId: string,
  fileName: string,
): EditorWorkspaceModel {
  const group = model.groups[groupId];
  if (!group) {
    return model;
  }

  const existingTab = group.tabs.find((tab) => tab.id === fileId);
  const nextGroup: EditorGroup = existingTab
    ? { ...group, activeTabId: fileId }
    : {
        ...group,
        tabs: [...group.tabs, { id: fileId, name: fileName }],
        activeTabId: fileId,
      };

  return {
    ...model,
    groups: {
      ...model.groups,
      [groupId]: nextGroup,
    },
    focusedGroupId: groupId,
  };
}

export function setActiveTabInEditorGroup(
  model: EditorWorkspaceModel,
  groupId: string,
  tabId: string,
): EditorWorkspaceModel {
  const group = model.groups[groupId];
  if (!group || !group.tabs.some((tab) => tab.id === tabId)) {
    return model;
  }

  return {
    ...model,
    groups: {
      ...model.groups,
      [groupId]: {
        ...group,
        activeTabId: tabId,
      },
    },
    focusedGroupId: groupId,
  };
}

export function closeFileInEditorGroup(
  model: EditorWorkspaceModel,
  groupId: string,
  fileId: string,
): EditorWorkspaceModel {
  const group = model.groups[groupId];
  if (!group) {
    return model;
  }

  const closingIndex = group.tabs.findIndex((tab) => tab.id === fileId);
  if (closingIndex === -1) {
    return model;
  }

  const nextTabs = group.tabs.filter((tab) => tab.id !== fileId);
  const nextActiveTabId = group.activeTabId === fileId
    ? nextTabs[Math.min(closingIndex, nextTabs.length - 1)]?.id ?? ''
    : group.activeTabId;

  const nextModel: EditorWorkspaceModel = {
    ...model,
    groups: {
      ...model.groups,
      [groupId]: {
        ...group,
        tabs: nextTabs,
        activeTabId: nextActiveTabId,
      },
    },
  };

  return removeEmptyGroup(nextModel, groupId);
}

function insertSplitAroundGroup(
  layout: EditorLayoutNode | null,
  targetGroupId: string,
  newGroupId: string,
  splitId: string,
  direction: SplitDirection,
  placeAfter: boolean,
): EditorLayoutNode {
  if (!layout) {
    return createGroupNode(newGroupId);
  }

  return replaceLayoutNode(layout, targetGroupId, (node) => ({
    type: 'split',
    id: splitId,
    direction,
    children: placeAfter
      ? [node, createGroupNode(newGroupId)]
      : [createGroupNode(newGroupId), node],
  }));
}

export function splitEditorGroup(
  model: EditorWorkspaceModel,
  targetGroupId: string,
  newGroupId: string,
  splitId: string,
  direction: SplitDirection,
): EditorWorkspaceModel {
  const targetGroup = model.groups[targetGroupId];
  if (!targetGroup || !targetGroup.activeTabId) {
    return model;
  }

  const activeTab = targetGroup.tabs.find((tab) => tab.id === targetGroup.activeTabId);
  if (!activeTab) {
    return model;
  }

  return {
    layout: insertSplitAroundGroup(model.layout, targetGroupId, newGroupId, splitId, direction, true),
    groups: {
      ...model.groups,
      [newGroupId]: createEditorGroup(newGroupId, [{ ...activeTab }], activeTab.id),
    },
    focusedGroupId: newGroupId,
  };
}

function addTabToGroup(
  model: EditorWorkspaceModel,
  groupId: string,
  tab: EditorTab,
): EditorWorkspaceModel {
  const group = model.groups[groupId];
  if (!group) {
    return model;
  }

  const existingTab = group.tabs.find((currentTab) => currentTab.id === tab.id);
  return {
    ...model,
    groups: {
      ...model.groups,
      [groupId]: existingTab
        ? { ...group, activeTabId: tab.id }
        : { ...group, tabs: [...group.tabs, tab], activeTabId: tab.id },
    },
    focusedGroupId: groupId,
  };
}

function removeTabFromGroup(
  model: EditorWorkspaceModel,
  groupId: string,
  tabId: string,
): EditorWorkspaceModel {
  return closeFileInEditorGroup(model, groupId, tabId);
}

function mapDropPosition(position: Exclude<EditorDropPosition, 'center'>): { direction: SplitDirection; placeAfter: boolean } {
  if (position === 'left') {
    return { direction: 'horizontal', placeAfter: false };
  }

  if (position === 'right') {
    return { direction: 'horizontal', placeAfter: true };
  }

  if (position === 'top') {
    return { direction: 'vertical', placeAfter: false };
  }

  return { direction: 'vertical', placeAfter: true };
}

export function moveEditorTab(
  model: EditorWorkspaceModel,
  sourceGroupId: string,
  tabId: string,
  targetGroupId: string,
  position: EditorDropPosition,
  newGroupId: string,
  splitId: string,
): EditorWorkspaceModel {
  const sourceGroup = model.groups[sourceGroupId];
  const targetGroup = model.groups[targetGroupId];
  const tab = sourceGroup?.tabs.find((currentTab) => currentTab.id === tabId);

  if (!sourceGroup || !targetGroup || !tab) {
    return model;
  }

  if (position === 'center') {
    if (sourceGroupId === targetGroupId) {
      return setActiveTabInEditorGroup(model, sourceGroupId, tabId);
    }

    const nextModel = addTabToGroup(removeTabFromGroup(model, sourceGroupId, tabId), targetGroupId, tab);
    return normalizeFocusedGroup(nextModel);
  }

  const shouldDuplicate = sourceGroupId === targetGroupId && sourceGroup.tabs.length === 1;
  const { direction, placeAfter } = mapDropPosition(position);
  const baseModel = shouldDuplicate ? model : normalizeFocusedGroup(removeTabFromGroup(model, sourceGroupId, tabId));
  const nextModel: EditorWorkspaceModel = {
    layout: insertSplitAroundGroup(baseModel.layout, targetGroupId, newGroupId, splitId, direction, placeAfter),
    groups: {
      ...baseModel.groups,
      [newGroupId]: createEditorGroup(newGroupId, [{ ...tab }], tab.id),
    },
    focusedGroupId: newGroupId,
  };

  return nextModel;
}