import Konva from 'konva';
import type { VeConfig, VeSystem, VeSystemLayer, SoCInPagePanelSelected } from './types';
import { bindObjEvtHandle, deleteObj } from './shapeFactory';

// ─── Internal block helpers ───────────────────────────────────────────────────

function createDesignFlag(
  x: number, y: number, name: string, veConfig: VeConfig,
): Konva.Group {
  const flag = new Konva.Group({
    x, y,
    width: veConfig.gridSize * 2,
    height: veConfig.gridSize * 1,
  });

  const rect = new Konva.Rect({
    x: 0, y: 0,
    width: veConfig.gridSize * 2,
    height: veConfig.gridSize * 1,
    fill: 'white',
    stroke: '#DEB887',
  });

  const text = new Konva.Text({
    width: rect.width(),
    height: rect.height(),
    text: name,
    fontSize: 10,
    fontStyle: 'bold',
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  flag.add(rect);
  flag.add(text);
  return flag;
}

function createIPBlock(
  x: number, y: number, name: string, veConfig: VeConfig,
): Konva.Group {
  const ipBlock = new Konva.Group({
    x, y,
    width: veConfig.gridSize * 3,
    height: veConfig.gridSize * 3,
  });

  const rect = new Konva.Rect({
    x: 0, y: 0,
    width: veConfig.gridSize * 3,
    height: veConfig.gridSize * 3,
    cornerRadius: 10,
    fill: '#FDFDFD',
    stroke: '#556184',
  });

  const text = new Konva.Text({
    width: rect.width(),
    height: rect.height(),
    text: name,
    fontSize: 18,
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  const pointOffset = 4;

  const p11 = new Konva.Circle({ x: -pointOffset, y: 0, radius: 3, fill: 'black' });
  const p12 = new Konva.Circle({ x: rect.width() + pointOffset, y: 0, radius: 3, fill: 'black' });
  const p21 = new Konva.Circle({ x: -pointOffset, y: rect.height(), radius: 3, fill: 'black' });
  const p22 = new Konva.Circle({ x: rect.width() + pointOffset, y: rect.height(), radius: 3, fill: 'black' });

  const auxRect1 = new Konva.Rect({
    x: -pointOffset - 4,
    y: -4,
    width: rect.width() + (pointOffset + 4) * 2,
    height: rect.height() + (pointOffset + 4) * 1,
    stroke: '#556184',
    dash: [2.5, 2.5],
  });

  ipBlock.add(rect);
  ipBlock.add(text);
  ipBlock.add(p11);
  ipBlock.add(p12);
  ipBlock.add(p21);
  ipBlock.add(p22);
  ipBlock.add(auxRect1);

  return ipBlock;
}

function createBUSBlock(
  x: number, y: number, width: number, name: string,
  veConfig: VeConfig, setSoCInPagePanelSelected?: (v: SoCInPagePanelSelected) => void,
  getSoCInPagePanelSelected?: () => SoCInPagePanelSelected,
): Konva.Group {
  const ipBlock = new Konva.Group({
    x, y,
    width,
    height: veConfig.gridSize * 2,
  });

  const rect = new Konva.Rect({
    x: 0, y: 0,
    width,
    height: veConfig.gridSize * 2,
    cornerRadius: 10,
    fill: '#FDFDFD',
    stroke: '#556184',
  });

  const text = new Konva.Text({
    width: rect.width(),
    height: rect.height(),
    text: name,
    fontSize: 18,
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  const p11 = new Konva.Circle({
    x: rect.width() / 10,
    y: rect.height() / 2,
    radius: 3,
    fill: 'black',
  });

  const p12 = new Konva.Circle({
    x: rect.width() * 9 / 10,
    y: rect.height() / 2,
    radius: 3,
    fill: 'black',
  });

  const highlightWidth = 40;
  const highlightHeight = 25;

  const highlight = new Konva.Rect({
    x: (rect.width() - highlightWidth) / 2,
    y: (rect.height() - highlightHeight) / 2,
    width: highlightWidth,
    height: highlightHeight,
    fill: '#F5E8CA',
  });

  const auxLine1 = new Konva.Line({
    points: [0, (rect.height() - highlightHeight) / 2, rect.width(), (rect.height() - highlightHeight) / 2],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  const auxLine2 = new Konva.Line({
    points: [0, (rect.height() - highlightHeight) / 2 + highlightHeight, rect.width(), (rect.height() - highlightHeight) / 2 + highlightHeight],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  const auxLine3 = new Konva.Line({
    points: [(rect.width() - highlightWidth) / 2, 0, (rect.width() - highlightWidth) / 2, rect.height()],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  const auxLine4 = new Konva.Line({
    points: [(rect.width() - highlightWidth) / 2 + highlightWidth, 0, (rect.width() - highlightWidth) / 2 + highlightWidth, rect.height()],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  ipBlock.add(rect);
  ipBlock.add(highlight);
  ipBlock.add(text);
  ipBlock.add(auxLine1);
  ipBlock.add(auxLine2);
  ipBlock.add(auxLine3);
  ipBlock.add(auxLine4);
  ipBlock.add(p11);
  ipBlock.add(p12);

  for (let i = 0; i < 3; ++i) {
    ipBlock.add(new Konva.Rect({
      x: 50, y: 12 + i * 6,
      width: (rect.width() - highlightWidth) / 4,
      height: 3, cornerRadius: 10,
      stroke: '#556184', strokeWidth: 1,
    }));
  }

  for (let i = 0; i < 3; ++i) {
    ipBlock.add(new Konva.Rect({
      x: rect.width() - (rect.width() - highlightWidth) / 4 - 50,
      y: 12 + i * 6,
      width: (rect.width() - highlightWidth) / 4,
      height: 3, cornerRadius: 10,
      stroke: '#556184', strokeWidth: 1,
    }));
  }

  if (setSoCInPagePanelSelected && getSoCInPagePanelSelected) {
    ipBlock.on('pointerdblclick', () => {
      if (getSoCInPagePanelSelected() === 'BUS') {
        setSoCInPagePanelSelected('none');
      } else {
        setSoCInPagePanelSelected('BUS');
      }
    });
  }

  return ipBlock;
}

function createCOREBlock(
  x: number, y: number, width: number, name: string,
  veConfig: VeConfig, setSoCInPagePanelSelected?: (v: SoCInPagePanelSelected) => void,
  getSoCInPagePanelSelected?: () => SoCInPagePanelSelected,
): Konva.Group {
  const ipBlock = new Konva.Group({
    x, y,
    width,
    height: veConfig.gridSize * 2,
  });

  const rect = new Konva.Rect({
    x: 0, y: 0,
    width,
    height: veConfig.gridSize * 3,
    cornerRadius: 10,
    fill: 'white',
    stroke: '#556184',
  });

  const text = new Konva.Text({
    width: rect.width(),
    height: rect.height(),
    text: name,
    fontSize: 18,
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  const pointOffset = 4;
  const p11 = new Konva.Circle({ x: rect.width() / 3, y: rect.height() + pointOffset, radius: 3, fill: 'black' });
  const p12 = new Konva.Circle({ x: rect.width() * 2 / 3, y: rect.height() + pointOffset, radius: 3, fill: 'black' });

  const auxRect1 = new Konva.Rect({
    x: 0, y: rect.height(),
    width: rect.width(),
    height: pointOffset * 2,
    stroke: '#556184',
    fill: '#E6EBF5',
  });

  const highlightWidth = 45;
  const highlightHeight = rect.height() - 2;

  const highlight = new Konva.Rect({
    x: (rect.width() - highlightWidth) / 2,
    y: (rect.height() - highlightHeight) / 2,
    width: highlightWidth,
    height: highlightHeight,
    fill: '#F5E8CA',
  });

  const auxLine1 = new Konva.Line({
    points: [(rect.width() - highlightWidth) / 2, 0, (rect.width() - highlightWidth) / 2, rect.height()],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  const auxLine2 = new Konva.Line({
    points: [(rect.width() - highlightWidth) / 2 + highlightWidth, 0, (rect.width() - highlightWidth) / 2 + highlightWidth, rect.height()],
    stroke: 'black', strokeWidth: 1, dash: [2.5, 2.5],
  });

  const coreContainerWidth = 65;
  const coreContainerHeight = 50;
  const colorPalette = ['#FFFFFF', '#A6A6A6', '#EFD9BE'];

  const leftCoreGroup = new Konva.Group({
    x: ((rect.width() - highlightWidth) / 2 - coreContainerWidth) / 2,
    y: (rect.height() - coreContainerHeight) / 2,
    width: coreContainerWidth,
    height: coreContainerHeight,
  });
  leftCoreGroup.add(new Konva.Rect({
    x: 0, y: 0,
    width: coreContainerWidth, height: coreContainerHeight,
    fill: '#E6EBF5', cornerRadius: 5, opacity: 1,
  }));
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      const paletteIdx = Math.floor(Math.random() * colorPalette.length);
      leftCoreGroup.add(new Konva.Rect({
        x: 5 + j * 15, y: 2 + i * 12,
        width: 10, height: 10,
        cornerRadius: 2.5,
        fill: colorPalette[paletteIdx],
        stroke: 'black', strokeWidth: 1,
      }));
    }
  }

  const rightCoreGroup = new Konva.Group({
    x: ((rect.width() + highlightWidth) / 2 + rect.width()) / 2 - coreContainerWidth / 2,
    y: (rect.height() - coreContainerHeight) / 2,
    width: coreContainerWidth,
    height: coreContainerHeight,
  });
  rightCoreGroup.add(new Konva.Rect({
    x: 0, y: 0,
    width: coreContainerWidth, height: coreContainerHeight,
    fill: '#E6EBF5', cornerRadius: 5, opacity: 1,
  }));
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      const paletteIdx = Math.floor(Math.random() * colorPalette.length);
      rightCoreGroup.add(new Konva.Rect({
        x: 5 + j * 15, y: 2 + i * 12,
        width: 10, height: 10,
        cornerRadius: 2.5,
        fill: colorPalette[paletteIdx],
        stroke: 'black', strokeWidth: 1,
      }));
    }
  }

  ipBlock.add(auxRect1);
  ipBlock.add(p11);
  ipBlock.add(p12);
  ipBlock.add(rect);
  ipBlock.add(highlight);
  ipBlock.add(auxLine1);
  ipBlock.add(auxLine2);
  ipBlock.add(text);
  ipBlock.add(leftCoreGroup);
  ipBlock.add(rightCoreGroup);

  if (setSoCInPagePanelSelected && getSoCInPagePanelSelected) {
    ipBlock.on('pointerdblclick', () => {
      if (getSoCInPagePanelSelected() === 'CORE') {
        setSoCInPagePanelSelected('none');
      } else {
        setSoCInPagePanelSelected('CORE');
      }
    });
  }

  return ipBlock;
}

function createRCUBlock(
  x: number, y: number, width: number, name: string,
  veConfig: VeConfig, setSoCInPagePanelSelected?: (v: SoCInPagePanelSelected) => void,
  getSoCInPagePanelSelected?: () => SoCInPagePanelSelected,
): Konva.Group {
  const ipBlock = new Konva.Group({
    x, y,
    width,
    height: veConfig.gridSize * 2,
  });

  const rect = new Konva.Rect({
    x: 0, y: 0,
    width,
    height: veConfig.gridSize * 3,
    cornerRadius: 10,
    fill: 'white',
    stroke: '#556184',
  });

  const text = new Konva.Text({
    width: rect.width(),
    height: rect.height(),
    text: name,
    fontSize: 18,
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  const pointOffset = 4;
  const p11 = new Konva.Circle({ x: -pointOffset, y: 0, radius: 3, fill: 'black' });
  const p12 = new Konva.Circle({ x: rect.width() + pointOffset, y: 0, radius: 3, fill: 'black' });
  const p21 = new Konva.Circle({ x: -pointOffset, y: rect.height(), radius: 3, fill: 'black' });
  const p22 = new Konva.Circle({ x: rect.width() + pointOffset, y: rect.height(), radius: 3, fill: 'black' });

  const auxRect1 = new Konva.Rect({
    x: -pointOffset - 4,
    y: -4,
    width: rect.width() + (pointOffset + 4) * 2,
    height: rect.height() + (pointOffset + 4) * 1,
    stroke: '#556184',
    fill: '#E6EBF5',
    dash: [2.5, 2.5],
  });

  ipBlock.add(auxRect1);
  ipBlock.add(p11);
  ipBlock.add(p12);
  ipBlock.add(p21);
  ipBlock.add(p22);
  ipBlock.add(rect);
  ipBlock.add(text);

  if (setSoCInPagePanelSelected && getSoCInPagePanelSelected) {
    ipBlock.on('pointerdblclick', () => {
      if (getSoCInPagePanelSelected() === 'RCU') {
        setSoCInPagePanelSelected('none');
      } else {
        setSoCInPagePanelSelected('RCU');
      }
    });
  }

  return ipBlock;
}

// ─── Exported template factories ──────────────────────────────────────────────

export function createBlockTemplate(
  x: number, y: number,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  const blockDesign = new Konva.Group({
    x, y,
    width: veConfig.gridSize * 4,
    height: veConfig.gridSize * 3,
    visible: false,
    draggable: true,
    name: 'block',
  });

  const boundEdge = new Konva.Rect({
    x: 0, y: 0,
    width: blockDesign.width(),
    height: blockDesign.height(),
    cornerRadius: 10,
    stroke: '#DEB887',
    fill: '#f9f0e6',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowBlur: 2,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.6,
  });

  const text = new Konva.Text({
    width: boundEdge.width(),
    height: boundEdge.height(),
    text: 'RTL',
    fontSize: 24,
    align: 'center',
    verticalAlign: 'middle',
    fontFamily: 'Calibri',
    fill: 'black',
  });

  const shadowBlockDesign = new Konva.Rect({
    x: 0, y: 0, width: 0, height: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (blockDesign as any)._id,
  } as any);

  blockDesign.add(boundEdge);
  blockDesign.add(text);

  const sys = veSystem ?? {
    stage: null, xfer: null, resizeObsvr: null, grid: null,
    clipboard: [], history: null, selectedRect: null, picUploadInputer: null,
  };

  bindObjEvtHandle(blockDesign, shadowBlockDesign, veConfig, sys, pushState);

  blockDesign.visible(true);
  blockDesign.opacity(0.3);
  veSystemLayer.auxBot!.add(shadowBlockDesign);
  veSystemLayer.design!.add(blockDesign);
}

export function createSoC1Template(
  x: number, y: number,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
  setSoCInPagePanelSelected?: (v: SoCInPagePanelSelected) => void,
  getSoCInPagePanelSelected?: () => SoCInPagePanelSelected,
) {
  const gs = veConfig.gridSize;

  const blockDesign = new Konva.Group({
    x, y,
    width: gs * 17,
    height: gs * 16,
    visible: false,
    draggable: true,
    name: 'soc1',
  });

  const boundEdge = new Konva.Rect({
    x: -gs, y: -gs,
    width: blockDesign.width(),
    height: blockDesign.height(),
    cornerRadius: 10,
    stroke: '#DEB887',
    fill: '#f9f0e6',
    shadowColor: 'rgba(0,0,0,0.4)',
    shadowBlur: 2,
    shadowOffset: { x: 2, y: 2 },
    shadowOpacity: 0.6,
  });

  const shadowBlockDesign = new Konva.Rect({
    x: 0, y: 0, width: 0, height: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (blockDesign as any)._id,
  } as any);

  blockDesign.add(boundEdge);
  blockDesign.add(createDesignFlag(gs * 0, gs * -2, 'ACTIVE', veConfig));
  blockDesign.add(createCOREBlock(gs * 0, gs * 0, gs * 11, 'CORE', veConfig, setSoCInPagePanelSelected, getSoCInPagePanelSelected));
  blockDesign.add(createRCUBlock(gs * 12, gs * 0, gs * 3, 'RCU', veConfig, setSoCInPagePanelSelected, getSoCInPagePanelSelected));
  blockDesign.add(createBUSBlock(gs * 0, gs * 4, gs * 15, 'BUS', veConfig, setSoCInPagePanelSelected, getSoCInPagePanelSelected));
  blockDesign.add(createIPBlock(gs * 0, gs * 7, 'SPIFS', veConfig));
  blockDesign.add(createIPBlock(gs * 4, gs * 7, 'UART', veConfig));
  blockDesign.add(createIPBlock(gs * 8, gs * 7, 'QSPI', veConfig));
  blockDesign.add(createIPBlock(gs * 12, gs * 7, 'PSRAM', veConfig));
  blockDesign.add(createIPBlock(gs * 0, gs * 11, 'GPIO', veConfig));
  blockDesign.add(createIPBlock(gs * 4, gs * 11, 'TIMER', veConfig));
  blockDesign.add(createIPBlock(gs * 8, gs * 11, 'I2C', veConfig));
  blockDesign.add(createIPBlock(gs * 12, gs * 11, 'PWM', veConfig));

  const sys = veSystem ?? {
    stage: null, xfer: null, resizeObsvr: null, grid: null,
    clipboard: [], history: null, selectedRect: null, picUploadInputer: null,
  };

  bindObjEvtHandle(blockDesign, shadowBlockDesign, veConfig, sys, pushState);

  blockDesign.visible(true);
  blockDesign.opacity(0.3);
  veSystemLayer.auxBot!.add(shadowBlockDesign);
  veSystemLayer.design!.add(blockDesign);
}
