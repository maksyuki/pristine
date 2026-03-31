import { getRootThemeStyles, resolveDraculaPalette, type StyleReader } from './themeSource';

function normalizeMonacoTokenColor(color: string) {
  const normalized = color.trim().replace(/^#/, '');

  if (normalized.length === 3 || normalized.length === 4) {
    return normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
  }

  return normalized;
}

export function createDraculaThemeDefinition(styles: StyleReader | null = getRootThemeStyles()) {
  const palette = resolveDraculaPalette(styles);

  return {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: normalizeMonacoTokenColor(palette.pink), fontStyle: 'bold' },
      { token: 'keyword.control', foreground: normalizeMonacoTokenColor(palette.pink) },
      { token: 'support.function', foreground: normalizeMonacoTokenColor(palette.green) },
      { token: 'support.function.shell', foreground: normalizeMonacoTokenColor(palette.green) },
      { token: 'comment', foreground: normalizeMonacoTokenColor(palette.comment), fontStyle: 'italic' },
      { token: 'string', foreground: normalizeMonacoTokenColor(palette.yellow) },
      { token: 'string.invalid', foreground: normalizeMonacoTokenColor(palette.red) },
      { token: 'number', foreground: normalizeMonacoTokenColor(palette.purple) },
      { token: 'identifier', foreground: normalizeMonacoTokenColor(palette.foreground) },
      { token: 'variable', foreground: normalizeMonacoTokenColor(palette.orange) },
      { token: 'variable.automatic', foreground: normalizeMonacoTokenColor(palette.orange), fontStyle: 'bold' },
      { token: 'variable.shell', foreground: normalizeMonacoTokenColor(palette.cyan) },
      { token: 'delimiter', foreground: normalizeMonacoTokenColor(palette.foreground) },
      { token: 'operator', foreground: normalizeMonacoTokenColor(palette.pink) },
      { token: 'operator.assignment.immediate', foreground: normalizeMonacoTokenColor(palette.pink), fontStyle: 'bold' },
      { token: 'operator.assignment.append', foreground: normalizeMonacoTokenColor(palette.green), fontStyle: 'bold' },
      { token: 'operator.assignment.conditional', foreground: normalizeMonacoTokenColor(palette.purple), fontStyle: 'bold' },
      { token: 'operator.assignment.recursive', foreground: normalizeMonacoTokenColor(palette.orange), fontStyle: 'bold' },
      { token: 'meta.recipe', foreground: normalizeMonacoTokenColor(palette.comment) },
      { token: 'type', foreground: normalizeMonacoTokenColor(palette.cyan), fontStyle: 'italic' },
    ],
    colors: {
      'editor.background': palette.background,
      'editor.foreground': palette.foreground,
      'editorLineNumber.foreground': palette.comment,
      'editorLineNumber.activeForeground': palette.foreground,
      'editor.selectionBackground': palette.selection,
      'editor.inactiveSelectionBackground': `${palette.selection}88`,
      'editor.lineHighlightBackground': `${palette.selection}55`,
      'editorCursor.foreground': palette.foreground,
      'editorWhitespace.foreground': palette.selection,
      'editorWidget.background': palette.surface,
      'editorWidget.border': palette.comment,
      'editorSuggestWidget.background': palette.surface,
      'editorSuggestWidget.border': palette.comment,
      'editorSuggestWidget.selectedBackground': palette.selection,
      'editorGutter.background': palette.background,
      'editorError.foreground': palette.red,
      'editorWarning.foreground': palette.orange,
      'editorIndentGuide.background1': palette.selection,
      'editorIndentGuide.activeBackground1': palette.comment,
      'editorBracketMatch.background': palette.selection,
      'editorBracketMatch.border': palette.foreground,
      'scrollbar.shadow': palette.surface,
      'scrollbarSlider.background': `${palette.selection}88`,
      'scrollbarSlider.hoverBackground': `${palette.selection}cc`,
      'scrollbarSlider.activeBackground': palette.comment,
    },
  } as const;
}

export const draculaThemeDefinition = createDraculaThemeDefinition(null);

export function defineDraculaTheme(monaco: any): void {
  if (!monaco) {
    return;
  }

  monaco.editor.defineTheme('dracula', createDraculaThemeDefinition() as any);
}