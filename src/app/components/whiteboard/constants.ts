import noteImageSrc from '@/assets/images/whiteboard/note.svg';

import type {
  ToolbarButton, PenSubBarItem, EraserSubBarItem,
  ColorSubBarItem, ShapeSubBarItem, TopSubBarHomeItem,
  VeConfig, SoCPanelAddr, SoCTemplate,
} from './types';

// ─── Asset Exports ──────────────────────────────────────────────────────────

export { noteImageSrc };

// ─── Top Bar ────────────────────────────────────────────────────────────────

export const topBarLeft: ToolbarButton[] = [
  { name: 'ri-home-9-line', tooltip: 'home' },
  { name: 'ri-stack-line', tooltip: 'layer' },
  { name: 'ri-kanban-view', tooltip: 'kanban' },
];

export const topSubBarHome: TopSubBarHomeItem[] = [
  { name: 'open', tooltip: 'xxxx' },
  { name: 'save', tooltip: 'xxxx' },
  { name: 'export', tooltip: 'xxxx' },
  { name: 'shortcuts', tooltip: 'xxxx' },
  { name: 'guide', tooltip: 'xxxx' },
];

export const topBarRight: ToolbarButton[] = [
  { name: 'ri-search-line', tooltip: 'search' },
  { name: 'ri-notification-badge-line', tooltip: 'message' },
  { name: 'ri-ai-generate-2', tooltip: 'ai' },
  { name: 'ri-share-line', tooltip: 'export' },
];

// ─── Bottom Bar Left ────────────────────────────────────────────────────────

export const bottomBarLeft: ToolbarButton[] = [
  { name: 'ri-cursor-line', tooltip: 'select', shortcut: 'S' },
  { name: 'ri-hand', tooltip: 'grab', shortcut: 'G' },
  { name: 'ri-arrow-go-back-line', tooltip: 'undo', shortcut: 'ctrl-Z' },
  { name: 'ri-arrow-go-forward-line', tooltip: 'redo', shortcut: 'ctrl-R' },
];


// ─── Bottom Bar Right ───────────────────────────────────────────────────────

export const bottomBarRight: ToolbarButton[] = [
  { name: 'ri-edit-line', tooltip: 'pen', shortcut: 'Q' },
  { name: 'ri-eraser-line', tooltip: 'eraser', shortcut: 'E' },
  { name: 'ri-text', tooltip: 'text', shortcut: 'T' },
  { name: 'ri-image-line', tooltip: 'image', shortcut: 'I' },
  { name: 'ri-shapes-line', tooltip: 'shape', shortcut: 'D' },
  { name: 'ri-route-line', tooltip: 'wire', shortcut: 'W' },
  { name: 'ri-clipboard-line', tooltip: 'report', shortcut: 'R' },
];

// ─── Pen Sub-bars ───────────────────────────────────────────────────────────

export const penSubBarFirst: PenSubBarItem[] = [
  { name: 'ri-ball-pen-line', tooltip: 'pen-ball' },
  { name: 'ri-quill-pen-line', tooltip: 'pen-quill' },
  { name: 'ri-pen-nib-line', tooltip: 'pen-nib' },
  { name: 'ri-mark-pen-line', tooltip: 'pen-mark' },
  { name: 'ri-brush-line', tooltip: 'pen-brush' },
  { name: 'ri-paint-brush-line', tooltip: 'pen-paint' },
];

export const penSubBarSecond: PenSubBarItem[] = [
  { name: 'ri-circle-line', tooltip: 'pen-solid' },
  { name: 'ri-circle-fill', tooltip: 'pen-dash' },
];

export const penSubBarThird: PenSubBarItem[] = [
  { name: 'S', tooltip: 'pen-small' },
  { name: 'M', tooltip: 'pen-medium' },
  { name: 'L', tooltip: 'pen-large' },
];

export const penSubBarFourth: ColorSubBarItem[] = [
  { name: 'bg-black', tooltip: 'pen-black' },
  { name: 'bg-white', tooltip: 'pen-white' },
  { name: 'bg-gray-500', tooltip: 'pen-gray' },
  { name: 'bg-red-500', tooltip: 'pen-red' },
  { name: 'bg-orange-500', tooltip: 'pen-orange' },
  { name: 'bg-yellow-500', tooltip: 'pen-yellow' },
  { name: 'bg-green-500', tooltip: 'pen-green' },
  { name: 'bg-cyan-500', tooltip: 'pen-cyan' },
  { name: 'bg-blue-500', tooltip: 'pen-blue' },
  { name: 'bg-purple-500', tooltip: 'pen-purple' },
];

// ─── Eraser Sub-bar ─────────────────────────────────────────────────────────

export const eraserSubBarFirst: EraserSubBarItem[] = [
  { size: 'w-3 h-3', tooltip: 'earser-small' },
  { size: 'w-4 h-4', tooltip: 'earser-medium' },
  { size: 'w-5 h-5', tooltip: 'earser-large' },
  { size: 'w-6 h-6', tooltip: 'earser-extra large' },
];

// ─── Shape Sub-bar ──────────────────────────────────────────────────────────

export const shapeSubBarFirst: ShapeSubBarItem[] = [
  { name: 'ri-circle-line', tooltip: 'shape-circle' },
  { name: 'ri-triangle-line', tooltip: 'shape-triangle' },
  { name: 'ri-rectangle-line', tooltip: 'shape-rectangle' },
  { name: 'ri-pentagon-line', tooltip: 'shape-pentagon' },
  { name: 'ri-hexagon-line', tooltip: 'shape-hexagon' },
  { name: 'ri-octagon-line', tooltip: 'shape-octagon' },
];

// ─── History Icon Maps ──────────────────────────────────────────────────────

export const veHistoryItemActionMap: Record<string, string> = {
  'init': 'ri-radio-button-line',
  'move': 'ri-drag-move-fill',
  'resize': 'ri-custom-size',
  'add': 'ri-add-box-fill',
  'delete': 'ri-delete-bin-5-fill',
  'paste': 'ri-file-copy-fill',
};

export const veHistoryItemShapeMap: Record<string, string> = {
  'all': 'ri-macbook-line',
  'Circle': 'ri-circle-fill',
  'Triangle': 'ri-triangle-fill',
  'Rect': 'ri-rectangle-fill',
  'Pentagon': 'ri-pentagon-fill',
  'Hexagon': 'ri-hexagon-fill',
  'Design': 'ri-puzzle-fill',
  'SoC': 'ri-cpu-fill',
  'Text': 'ri-t-box-fill',
  'SpecNote': 'ri-sticky-note-fill',
  'Image': 'ri-image-fill',
  'Shapes': 'ri-shapes-fill',
};

// ─── Default Canvas Config ──────────────────────────────────────────────────

export const defaultVeConfig: VeConfig = {
  gridSize: 20,
  gridType: 'point',
  gridLineStrokeWidth: { ver: 1, hor: 0.5 },
  gridPointStrokeWidth: 1.5,
  gridColor: 'rgba(255,255,255,0.2)',
  shapeFillColor: '#4da6ff',
  backgroundColor: '#34495e',
  guidelineOffset: 5,
  minZoom: 0.1,
  maxZoom: 8,
  zoominScale: 1.2,
  zoomoutScale: 0.8,
  placePictureMaxHeight: 10,
};

export const defaultSoCPanelAddr: SoCPanelAddr[] = [
  { name: 'SPIFS', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'UART', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'QSPI', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'PSRAM', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'GPIO', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'TIMER', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'I2C', addr: '0x3000_000 - 0x3000_1000' },
  { name: 'PWM', addr: '0x3000_000 - 0x3000_1000' },
];

export const defaultSoCTemplateList: SoCTemplate[] = [
  {
    name: 'ECOS retroSoC Tiny',
    icon: 'ri-file-line',
    status: { tag: 'success', name: 'done' },
    instance: '<10K',
    tags: [
      { color: 'bg-green-500', name: 'Official' },
      { color: 'bg-green-500', name: 'RTL done' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
  {
    name: 'ECOS retroSoC Mini',
    icon: 'ri-file-line',
    status: { tag: 'success', name: 'done' },
    instance: '10K~50K',
    tags: [
      { color: 'bg-green-500', name: 'Official' },
      { color: 'bg-green-500', name: 'RTL done' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
  {
    name: 'ECOS retroSoC Std',
    icon: 'ri-file-line',
    status: { tag: 'warn', name: 'feat' },
    instance: '20K~80K',
    tags: [
      { color: 'bg-green-500', name: 'Official' },
      { color: 'bg-yellow-500', name: 'RTL dev' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
  {
    name: 'ECOS retroSoC Pro',
    icon: 'ri-file-line',
    status: { tag: 'danger', name: 'bug' },
    instance: '60K~100K',
    tags: [
      { color: 'bg-green-500', name: 'Official' },
      { color: 'bg-red-500', name: 'RTL fix bugs' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
  {
    name: 'PULP Basilisk',
    icon: 'ri-file-line',
    status: { tag: 'info', name: 'eval' },
    instance: 'unknown',
    tags: [
      { color: 'bg-yellow-500', name: '3rd party' },
      { color: 'bg-blue-500', name: 'RTL eval' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
  {
    name: 'UCB-BAR Chipyard',
    icon: 'ri-file-line',
    status: { tag: 'info', name: 'eval' },
    instance: 'unknown',
    tags: [
      { color: 'bg-yellow-500', name: '3rd party' },
      { color: 'bg-blue-500', name: 'RTL eval' },
      { color: 'bg-green-500', name: 'Document done' },
    ],
  },
];
