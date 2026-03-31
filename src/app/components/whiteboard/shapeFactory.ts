import Konva from 'konva';
import type { VeConfig, VeSystem, VeSystemLayer } from './types';

// ─── Name utility ─────────────────────────────────────────────────────────────

export function getPolygonName(shape: Konva.Node): string {
  const className = shape.getClassName();
  if (className !== 'RegularPolygon') return className;

  switch ((shape as Konva.RegularPolygon).sides()) {
    case 3: return 'Triangle';
    case 5: return 'Pentagon';
    case 6: return 'Hexagon';
    default: return 'Triangle';
  }
}

export function getObjectAbsolutePosition(
  obj: Konva.Node,
  stage: Konva.Stage,
): { x: number; y: number } {
  const absPosition = obj.absolutePosition();
  const stageBox = stage.container().getBoundingClientRect();
  return {
    x: stageBox.left + absPosition.x,
    y: stageBox.top + absPosition.y,
  };
}

// ─── Shadow config builder ────────────────────────────────────────────────────

function makeShadowConfig(bindObjId: number): Konva.RectConfig {
  return {
    x: 0, y: 0, width: 0, height: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId,
  } as Konva.RectConfig & { bindObjId: number };
}

// ─── bindObjEvtHandle ─────────────────────────────────────────────────────────

export function bindObjEvtHandle(
  obj: Konva.Node,
  shadowObj: Konva.Node,
  veConfig: VeConfig,
  veSystem: VeSystem,
  pushState: (action: string, shapeId: number, shapeClass: string) => void,
) {
  obj.on('mouseenter', () => {
    (obj as any).strokeWidth?.((obj as any).strokeWidth?.() ?? 0);
    shadowObj.moveToTop();
  });

  obj.on('mouseleave', () => {
    shadowObj.moveToTop();
  });

  // Inline text editing on double-click
  obj.on('dblclick dbltap', () => {
    if (obj.getClassName() !== 'Text') return;
    const textNode = obj as Konva.Text;

    textNode.hide();
    veSystem.xfer?.hide();

    const textarea = document.createElement('textarea');
    const stage = veSystem.stage;
    if (!stage) return;

    const areaPosition = getObjectAbsolutePosition(textNode, stage);
    document.body.appendChild(textarea);

    textarea.value = textNode.text();
    textarea.style.position = 'absolute';
    textarea.style.top = areaPosition.y + 'px';
    textarea.style.left = areaPosition.x + 'px';
    textarea.style.width = textNode.width() - textNode.padding() * 2 + 'px';
    textarea.style.height = textNode.height() - textNode.padding() * 2 + 5 + 'px';
    textarea.style.fontSize = textNode.fontSize() + 'px';
    textarea.style.border = 'none';
    textarea.style.padding = '0px';
    textarea.style.margin = '0px';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = textNode.lineHeight().toString();
    textarea.style.fontFamily = textNode.fontFamily();
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = textNode.align();
    textarea.style.color = textNode.fill().toString();

    const rotation = textNode.rotation();
    let transform = '';
    if (rotation) {
      transform += 'rotateZ(' + rotation + 'deg)';
    }
    transform += 'translateY(-2px)';
    textarea.style.transform = transform;

    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 3 + 'px';

    textarea.focus();

    const setTextareaWidth = (newWidth = 0) => {
      if (!newWidth) {
        newWidth = ((textNode as any).placeholder?.length * textNode.fontSize()) ?? (textNode.fontSize() * 4);
      }
      textarea.style.width = newWidth + 'px';
    };

    const removeTextarea = (outsideClick = false) => {
      textarea.parentNode?.removeChild(textarea);
      window.removeEventListener('click', handleOutsideClick);
      window.removeEventListener('touchstart', handleOutsideClick);
      textNode.show();
      veSystem.xfer?.show();
      veSystem.xfer?.forceUpdate();
    };

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        textNode.text(textarea.value);
        removeTextarea();
      }
      if (e.key === 'Escape') {
        removeTextarea();
      }
    });

    textarea.addEventListener('keydown', () => {
      const scale = textNode.getAbsoluteScale().x;
      setTextareaWidth(textNode.width() * scale);
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + textNode.fontSize() + 'px';
    });

    const handleOutsideClick = (e: Event) => {
      if (e.target !== textarea) {
        textNode.text(textarea.value);
        removeTextarea(true);
      }
    };

    setTimeout(() => {
      window.addEventListener('click', handleOutsideClick);
    });
  });

  // Drag start: show shadow
  obj.on('dragstart', () => {
    if (shadowObj instanceof Konva.Circle) {
      (shadowObj as Konva.Circle).radius((obj as Konva.Circle).radius());
    } else if (shadowObj instanceof Konva.RegularPolygon) {
      (shadowObj as Konva.RegularPolygon).radius((obj as Konva.RegularPolygon).radius());
    } else if (shadowObj instanceof Konva.Rect) {
      shadowObj.width(obj.width());
      shadowObj.height(obj.height());
    } else if (shadowObj instanceof Konva.Text) {
      shadowObj.width(obj.width());
      shadowObj.height(obj.height());
    } else if (shadowObj instanceof Konva.Image) {
      shadowObj.width(obj.width());
      shadowObj.height(obj.height());
    }
    shadowObj.show();
    shadowObj.moveToTop();
    obj.moveToTop();
  });

  // Drag end: snap to grid, hide shadow, push history
  obj.on('dragend', () => {
    obj.position({
      x: Math.round(obj.x() / veConfig.gridSize) * veConfig.gridSize,
      y: Math.round(obj.y() / veConfig.gridSize) * veConfig.gridSize,
    });
    shadowObj.hide();
    pushState('move', (obj as any)._id, getPolygonName(obj));
  });

  // Drag move: update shadow position (soc1 special case)
  if (obj.hasName('soc1')) {
    obj.on('dragmove', () => {
      shadowObj.position({
        x: Math.round(obj.x() / veConfig.gridSize - 1) * veConfig.gridSize,
        y: Math.round(obj.y() / veConfig.gridSize - 1) * veConfig.gridSize,
      });
    });
  } else {
    obj.on('dragmove', () => {
      shadowObj.position({
        x: Math.round(obj.x() / veConfig.gridSize) * veConfig.gridSize,
        y: Math.round(obj.y() / veConfig.gridSize) * veConfig.gridSize,
      });
    });
  }
}

// ─── createCircle ─────────────────────────────────────────────────────────────

export function createCircle(
  x: number, y: number,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  const circle = new Konva.Circle({
    x, y,
    radius: veConfig.gridSize * 2,
    fill: veConfig.shapeFillColor,
    stroke: 'white',
    strokeWidth: 2,
    draggable: true,
    name: 'circle',
    strokeScaleEnabled: false,
  });

  const shadowCircle = new Konva.Circle({
    x: 0, y: 0, radius: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (circle as any)._id,
  } as any);

  bindObjEvtHandle(circle, shadowCircle, veConfig,
    veSystem ?? { stage: null, xfer: null, resizeObsvr: null, grid: null, clipboard: [], history: null, selectedRect: null, picUploadInputer: null },
    pushState);
  veSystemLayer.auxBot!.add(shadowCircle);
  veSystemLayer.shape!.add(circle);
}

// ─── createTriangle ───────────────────────────────────────────────────────────

export function createTriangle(
  x: number, y: number,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  const triangle = new Konva.RegularPolygon({
    x, y,
    sides: 3,
    radius: veConfig.gridSize * 3,
    fill: veConfig.shapeFillColor,
    stroke: 'white',
    strokeWidth: 2,
    draggable: true,
    name: 'triangle',
    strokeScaleEnabled: false,
  });

  const shadowTriangle = new Konva.RegularPolygon({
    x: 0, y: 0, sides: 3, radius: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (triangle as any)._id,
  } as any);

  bindObjEvtHandle(triangle, shadowTriangle, veConfig,
    veSystem ?? { stage: null, xfer: null, resizeObsvr: null, grid: null, clipboard: [], history: null, selectedRect: null, picUploadInputer: null },
    pushState);
  veSystemLayer.auxBot!.add(shadowTriangle);
  veSystemLayer.shape!.add(triangle);
}

// ─── createRect ───────────────────────────────────────────────────────────────

export function createRect(
  x: number, y: number, width: number, height: number,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  strokeColor = 'white',
  fillColor?: string,
  hasShadow = false,
  commentLayer = false,
  veSystem?: VeSystem,
) {
  const fill = fillColor ?? veConfig.shapeFillColor;
  let defaultConfig: any = {
    x, y, width, height,
    stroke: strokeColor,
    fill,
    strokeWidth: 1,
    draggable: true,
    strokeScaleEnabled: false,
    cornerRadius: 8,
    name: 'rectangle',
  };

  if (hasShadow) {
    defaultConfig = {
      ...defaultConfig,
      shadowColor: 'rgba(0,0,0,0.4)',
      shadowBlur: 8,
      shadowOffset: { x: 4, y: 4 },
      shadowOpacity: 0.6,
    };
  }

  const rectangle = new Konva.Rect(defaultConfig);

  const shadowRectangle = new Konva.Rect({
    x: 0, y: 0, width: 0, height: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (rectangle as any)._id,
  } as any);

  rectangle.on('pointerclick', () => {
    // single click handler placeholder
  });

  bindObjEvtHandle(rectangle, shadowRectangle, veConfig,
    veSystem ?? { stage: null, xfer: null, resizeObsvr: null, grid: null, clipboard: [], history: null, selectedRect: null, picUploadInputer: null },
    pushState);

  veSystemLayer.auxBot!.add(shadowRectangle);
  if (commentLayer) {
    veSystemLayer.comment!.add(rectangle);
  } else {
    veSystemLayer.shape!.add(rectangle);
  }
}

// ─── createImage ──────────────────────────────────────────────────────────────

export function createImage(
  x: number, y: number, width: number, height: number, imgSrc: string,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  Konva.Image.fromURL(imgSrc, (image: Konva.Image) => {
    image.setAttrs({
      x, y, width, height,
      scaleX: 1, scaleY: 1,
      draggable: true,
      cornerRadius: 0,
      name: 'image',
      strokeScaleEnabled: false,
    });

    const shadowImage = new Konva.Rect({
      x: 0, y: 0, width: 0, height: 0,
      fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
      visible: false, dash: [20, 2], strokeScaleEnabled: false,
      bindObjId: (image as any)._id,
    } as any);

    bindObjEvtHandle(image, shadowImage, veConfig,
      veSystem ?? { stage: null, xfer: null, resizeObsvr: null, grid: null, clipboard: [], history: null, selectedRect: null, picUploadInputer: null },
      pushState);
    veSystemLayer.auxBot!.add(shadowImage);
    veSystemLayer.comment!.add(image);
  });
}

// ─── createText ───────────────────────────────────────────────────────────────

export function createText(
  x: number, y: number, content: string,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  const text = new Konva.Text({
    x, y,
    text: content,
    fontSize: 27,
    fontFamily: 'Calibri',
    fill: 'black',
    name: 'text',
    draggable: true,
    strokeScaleEnabled: false,
  });

  const shadowText = new Konva.Rect({
    x: 0, y: 0, width: 0, height: 0,
    fill: '#FF7B17', opacity: 0.3, stroke: '#CF6412', strokeWidth: 3,
    visible: false, dash: [20, 2], strokeScaleEnabled: false,
    bindObjId: (text as any)._id,
  } as any);

  bindObjEvtHandle(text, shadowText, veConfig,
    veSystem ?? { stage: null, xfer: null, resizeObsvr: null, grid: null, clipboard: [], history: null, selectedRect: null, picUploadInputer: null },
    pushState);
  veSystemLayer.auxBot!.add(shadowText);
  veSystemLayer.comment!.add(text);
}

// ─── createShape (restore from history) ───────────────────────────────────────

export function createShape(
  shapeData: any,
  veConfig: VeConfig, veSystemLayer: VeSystemLayer,
  pushState?: (a: string, id: number, cls: string) => void,
  veSystem?: VeSystem,
) {
  const noop = pushState ?? (() => {});
  switch (shapeData.type) {
    case 'Circle':
      createCircle(shapeData.attrs.x, shapeData.attrs.y, veConfig, veSystemLayer, noop, veSystem);
      break;
    case 'RegularPolygon':
      createTriangle(shapeData.attrs.x, shapeData.attrs.y, veConfig, veSystemLayer, noop, veSystem);
      break;
    case 'Rect':
      createRect(shapeData.attrs.x, shapeData.attrs.y, shapeData.attrs.width, shapeData.attrs.height,
        veConfig, veSystemLayer, noop, undefined, undefined, false, false, veSystem);
      break;
    default:
      break;
  }
}

// ─── deleteObj ────────────────────────────────────────────────────────────────

export function deleteObj(node: Konva.Node, veSystemLayer: VeSystemLayer) {
  const id = (node as any)._id;
  const shadowObjs = veSystemLayer.auxBot!.find((n: Konva.Node) => {
    return (n as any).attrs.bindObjId && (n as any).attrs.bindObjId === id;
  });

  for (let i = shadowObjs.length - 1; i >= 0; --i) {
    shadowObjs[i].destroy();
  }
  node.destroy();
}

// ─── copyObj ──────────────────────────────────────────────────────────────────

export function copyObj(
  veSystem: VeSystem, veSystemLayer: VeSystemLayer, veConfig: VeConfig,
) {
  veSystem.clipboard = [];
  const nodes = veSystem.xfer?.nodes() ?? [];

  nodes.forEach((node) => {
    const id = (node as any)._id;
    const shadowNodes = veSystemLayer.auxBot!.find((n: Konva.Node) => {
      return (n as any).attrs.bindObjId && (n as any).attrs.bindObjId === id;
    });

    veSystem.clipboard.push({
      obj: node,
      shadow: shadowNodes[0],
      layer: node.getLayer()!,
      offset: { x: veConfig.gridSize, y: veConfig.gridSize },
    });
  });

  veSystem.xfer?.nodes([]);
}

// ─── pasteObj ─────────────────────────────────────────────────────────────────

export function pasteObj(
  veSystem: VeSystem, veSystemLayer: VeSystemLayer, veConfig: VeConfig,
) {
  veSystem.clipboard.forEach((item) => {
    const cloneObj = item.obj.clone();
    const cloneShadowObj = item.shadow.clone();

    (cloneShadowObj as any).attrs.bindObjId = (cloneObj as any)._id;
    bindObjEvtHandle(cloneObj, cloneShadowObj, veConfig, veSystem, () => {});

    cloneObj.x(cloneObj.x() + item.offset.x);
    cloneObj.y(cloneObj.y() + item.offset.y);
    item.offset.x += veConfig.gridSize;
    item.offset.y += veConfig.gridSize;

    veSystemLayer.auxBot!.add(cloneShadowObj);
    item.layer.add(cloneObj);
  });
}
