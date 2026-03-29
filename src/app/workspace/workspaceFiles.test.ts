import { describe, expect, it } from 'vitest';
import { getEditorLanguage, getEditorLanguageLabel } from './workspaceFiles';

describe('workspaceFiles language helpers', () => {
  it('routes .s and .S files to the assembly editor language', () => {
    expect(getEditorLanguage('startup/crt0.s')).toBe('assembly');
    expect(getEditorLanguage('startup/boot.S')).toBe('assembly');
  });

  it('routes shell, Tcl, and constraint files to dedicated editor languages', () => {
    expect(getEditorLanguage('scripts/deploy.sh')).toBe('shell');
    expect(getEditorLanguage('scripts/build.tcl')).toBe('tcl');
    expect(getEditorLanguage('constraints/top.xdc')).toBe('constraints');
    expect(getEditorLanguage('constraints/top.sdc')).toBe('constraints');
  });

  it('returns Assembly as the status-bar label for .s and .S files', () => {
    expect(getEditorLanguageLabel('startup/crt0.s')).toBe('Assembly');
    expect(getEditorLanguageLabel('startup/boot.S')).toBe('Assembly');
  });

  it('returns specialized labels for shell, Tcl, XDC, and SDC files', () => {
    expect(getEditorLanguageLabel('scripts/deploy.sh')).toBe('Shell');
    expect(getEditorLanguageLabel('scripts/build.tcl')).toBe('Tcl');
    expect(getEditorLanguageLabel('constraints/top.xdc')).toBe('XDC');
    expect(getEditorLanguageLabel('constraints/top.sdc')).toBe('SDC');
  });
});