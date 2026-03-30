import { describe, expect, it } from 'vitest';
import {
  closeFileInEditorGroup,
  createEditorGroup,
  createInitialEditorWorkspace,
  moveEditorTab,
  openFileInEditorGroup,
  splitEditorGroup,
  type EditorWorkspaceModel,
} from './editorLayout';

describe('editorLayout', () => {
  it('opens files into the focused group without duplicating tabs inside that group', () => {
    let state = createInitialEditorWorkspace('group-1');

    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v', 'reg_file.v');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v', 'reg_file.v');

    expect(state.groups['group-1']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/reg_file.v']);
    expect(state.groups['group-1']?.activeTabId).toBe('rtl/core/reg_file.v');
  });

  it('creates a second group when splitting the active tab', () => {
    let state = createInitialEditorWorkspace('group-1');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v', 'reg_file.v');

    state = splitEditorGroup(state, 'group-1', 'group-2', 'split-1', 'horizontal');

    expect(state.groups['group-2']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/reg_file.v']);
    expect(state.focusedGroupId).toBe('group-2');
    expect(state.layout?.type).toBe('split');
  });

  it('moves a tab into another group when dropped at the center', () => {
    let state = createInitialEditorWorkspace('group-1');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v', 'reg_file.v');
    state = splitEditorGroup(state, 'group-1', 'group-2', 'split-1', 'horizontal');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/alu.v', 'alu.v');

    state = moveEditorTab(state, 'group-1', 'rtl/core/alu.v', 'group-2', 'center', 'group-3', 'split-2');

    expect(state.groups['group-1']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/reg_file.v']);
    expect(state.groups['group-2']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/reg_file.v', 'rtl/core/alu.v']);
    expect(state.focusedGroupId).toBe('group-2');
  });

  it('creates a new split when a tab is dropped on an edge', () => {
    let state = createInitialEditorWorkspace('group-1');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v', 'reg_file.v');
    state = openFileInEditorGroup(state, 'group-1', 'rtl/core/alu.v', 'alu.v');

    state = moveEditorTab(state, 'group-1', 'rtl/core/alu.v', 'group-1', 'right', 'group-2', 'split-1');

    expect(state.groups['group-1']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/reg_file.v']);
    expect(state.groups['group-2']?.tabs.map((tab) => tab.id)).toEqual(['rtl/core/alu.v']);
    expect(state.focusedGroupId).toBe('group-2');
    expect(state.layout?.type).toBe('split');
  });

  it('removes an empty group after its last tab closes', () => {
    let state: EditorWorkspaceModel = {
      ...createInitialEditorWorkspace('group-1'),
      groups: {
        'group-1': createEditorGroup('group-1', [{ id: 'rtl/core/reg_file.v', name: 'reg_file.v' }], 'rtl/core/reg_file.v'),
      },
    };

    state = closeFileInEditorGroup(state, 'group-1', 'rtl/core/reg_file.v');

    expect(state.groups['group-1']).toBeUndefined();
    expect(state.layout).toBeNull();
    expect(state.focusedGroupId).toBeNull();
  });
});