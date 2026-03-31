import { useRef, useCallback, useState, useEffect } from 'react';
import Konva from 'konva';
import type {
  VeSystem, VeSystemLayer, VeStageState, VeConfig, VeSelectedBtn,
  SelectedRectPosition, LayerControl,
  PicUploadData, ShapeInPagePanelState, ShapeInPagePanelTool,
  ClipboardItem,
} from './types';
import { defaultVeConfig } from './constants';
import { useHistory } from './useHistory';
import { useKeyboard } from './useKeyboard';
import {
  createCircle, createTriangle, createRect, createText, createImage,
  createShape as createShapeFromSnapshot, bindObjEvtHandle, deleteObj as deleteObjUtil,
  copyObj as copyObjUtil, pasteObj as pasteObjUtil, getPolygonName,
  getObjectAbsolutePosition,
} from './shapeFactory';

export function useVisualEditor() {
  // ─── Refs ───────────────────────────────────────────────────────────────
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const picUploadInputRef = useRef<HTMLInputElement>(null);
  const previewImgRef = useRef<HTMLImageElement>(null);

  const veSystemRef = useRef<VeSystem>({
    stage: null, xfer: null, resizeObsvr: null, grid: null,
    clipboard: [], history: null, selectedRect: null, picUploadInputer: null,
  });

  const veSystemLayerRef = useRef<VeSystemLayer>({
    auxBot: null, shape: null, design: null, comment: null, auxTop: null,
  });

  const selectedRectPosRef = useRef<SelectedRectPosition>({ xPos1: 0, yPos1: 0, xPos2: 0, yPos2: 0 });

  // ─── State ──────────────────────────────────────────────────────────────
  const [veConfig] = useState<VeConfig>(defaultVeConfig);
  const [veStageState, setVeStageState] = useState<VeStageState>({
    xPos: 0, yPos: 0, scale: 1, isShiftPressed: false, isCtrlPressed: false,
  });

  const [veSelectedBtn, setVeSelectedBtn] = useState<VeSelectedBtn>('select');
  const [veIsGrabbing, setVeIsGrabbing] = useState(false);
  const [veIsCodeFreeze, setVeIsCodeFreeze] = useState(false);
  const [wbTheme, setWbTheme] = useState<'light' | 'dark'>('light');
  const toggleWbTheme = useCallback(() => setWbTheme((t) => (t === 'light' ? 'dark' : 'light')), []);
  const [veTemplateType, setVeTemplateType] = useState('MDD-GDS');
  const [veKeyboardKey, setVeKeyboardKey] = useState('none');
  const [isTopBarLeftHomeBtnClick, setIsTopBarLeftHomeBtnClick] = useState(false);

  // Layer controls
  const [veGridLayerControl, setVeGridLayerControl] = useState<LayerControl>({ isHide: false, isLock: false });
  const [veShapeLayerControl, setVeShapeLayerControl] = useState<LayerControl>({ isHide: false, isLock: false });
  const [veDesignLayerControl, setVeDesignLayerControl] = useState<LayerControl>({ isHide: false, isLock: false });
  const [veCommentLayerControl, setVeCommentLayerControl] = useState<LayerControl>({ isHide: false, isLock: false });

  // Picture upload
  const [vePicUploadBtnIdx, setVePicUploadBtnIdx] = useState(0);
  const [vePicPreviewDataList, setVePicPreviewDataList] = useState<PicUploadData[]>([
    { uploadImg: null, size: 0 },
    { uploadImg: null, size: 0 },
    { uploadImg: null, size: 0 },
  ]);

  // Shape in-page panel
  const [veShapeInPagePanelState, setVeShapeInPagePanelState] = useState<ShapeInPagePanelState>({
    top: 0, left: 0, display: 'none',
  });
  const [veShapeInPagePanelTool, setVeShapeInPagePanelTool] = useState<ShapeInPagePanelTool>({
    borderColorPicker: null, borderColor: 'rgba(255, 0, 0, 1)', borderType: 'line',
    borderStroke: 1, fillColorPicker: null, fillColor: 'rgba(255, 0, 0, 1)',
  });

  // Pen sub-bar selections
  const [selectedPenSubBarFirst, setSelectedPenSubBarFirst] = useState('pen-ball');
  const [selectedPenSubBarSecond, setSelectedPenSubBarSecond] = useState('pen-solid');
  const [selectedPenSubBarThird, setSelectedPenSubBarThird] = useState('pen-small');
  const [selectedPenSubBarFourth, setSelectedPenSubBarFourth] = useState('pen-black');
  const [selectedEraserSubBarFirst, setSelectedEraserSubBarFirst] = useState('earser-small');
  const [selectedShapeSubBarFirst, setSelectedShapeSubBarFirst] = useState('shape-circle');

  // ─── Helpers ────────────────────────────────────────────────────────────
  const getSystemLayer = useCallback(() => veSystemLayerRef.current, []);

  const deleteObj = useCallback((node: Konva.Node) => {
    deleteObjUtil(node, veSystemLayerRef.current);
  }, []);

  const createShapeFromData = useCallback((shapeData: any) => {
    createShapeFromSnapshot(shapeData, veConfig, veSystemLayerRef.current);
  }, [veConfig]);

  // ─── History ────────────────────────────────────────────────────────────
  const {
    pushState, undo, redo, handleHistoryItemClick,
    historyState, historyItemList, historyListPanelRef,
  } = useHistory({
    maxHistory: 100, getSystemLayer, createShapeFromData, deleteObj,
  });

  // ─── Grid ───────────────────────────────────────────────────────────────
  const updateGridSystem = useCallback(() => {
    const grid = veSystemRef.current.grid;
    if (!grid) return;

    grid.destroyChildren();
    const auxGridOffset = 6000;
    let gridSize = veConfig.gridSize;
    let gridPointStrokeWidth = veConfig.gridPointStrokeWidth;
    let gridPointDash = [1, gridSize - 1];
    const scale = veStageState.scale;

    const gridLineColor = wbTheme === 'light' ? '#d0d0d0' : '#2a2a4a';
    const gridPointColor = wbTheme === 'light' ? '#b0b0b0' : '#3a3a5a';

    if (scale <= 0.3) {
      gridSize *= 3;
      gridPointStrokeWidth *= 3;
      gridPointDash = gridPointDash.map((v) => v * 3);
    } else if (scale <= 0.5) {
      gridSize *= 2;
      gridPointStrokeWidth *= 2;
      gridPointDash = gridPointDash.map((v) => v * 2);
    }

    for (let i = 0; i < (auxGridOffset * 2) / gridSize; i++) {
      if (veConfig.gridType === 'line') {
        grid.add(new Konva.Line({
          points: [Math.round(i * gridSize) + 0.5 - auxGridOffset, -auxGridOffset, Math.round(i * gridSize) + 0.5 - auxGridOffset, auxGridOffset * 2],
          stroke: gridLineColor, strokeWidth: veConfig.gridLineStrokeWidth.ver, listening: false,
        }));
      } else {
        grid.add(new Konva.Line({
          points: [Math.round(i * gridSize) + 0.5 - auxGridOffset, -auxGridOffset, Math.round(i * gridSize) + 0.5 - auxGridOffset, auxGridOffset * 2],
          stroke: gridPointColor, strokeWidth: gridPointStrokeWidth, dash: gridPointDash, listening: false,
        }));
      }
    }

    for (let j = 0; j < (auxGridOffset * 2) / gridSize; j++) {
      if (veConfig.gridType === 'line') {
        grid.add(new Konva.Line({
          points: [-auxGridOffset, Math.round(j * gridSize) + 0.5 - auxGridOffset, auxGridOffset * 2, Math.round(j * gridSize) + 0.5 - auxGridOffset],
          stroke: gridLineColor, strokeWidth: veConfig.gridLineStrokeWidth.hor, listening: false,
        }));
      } else {
        grid.add(new Konva.Line({
          points: [-auxGridOffset, Math.round(j * gridSize) + 0.5 - auxGridOffset, auxGridOffset * 2, Math.round(j * gridSize) + 0.5 - auxGridOffset],
          stroke: gridPointColor, strokeWidth: gridPointStrokeWidth, dash: gridPointDash, listening: false,
        }));
      }
    }
  }, [veConfig, veStageState.scale, wbTheme]);

  // ─── Preview ────────────────────────────────────────────────────────────
  const updatePreview = useCallback(() => {
    const stage = veSystemRef.current.stage;
    if (!stage || !previewImgRef.current) return;
    try {
      previewImgRef.current.src = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 1 / 3, quality: 1 });
    } catch { /* silent on cross-origin */ }
  }, []);

  // ─── Guides ─────────────────────────────────────────────────────────────
  const addGuidesLine = useCallback((layer: Konva.Layer) => {
    layer.on('dragmove', (e) => {
      layer.find('.guid-line').forEach((l) => l.destroy());
      const lineGuideStops = getLineGuideStops(e.target, veSystemRef.current.stage!);
      const itemBounds = getObjectSnappingEdges(e.target);
      const guides = getGuides(lineGuideStops, itemBounds, veConfig.guidelineOffset);
      if (!guides.length) return;

      drawGuides(layer, guides);

      const absPos = e.target.absolutePosition();
      guides.forEach((lg) => {
        if (lg.orientation === 'V') absPos.x = lg.lineGuide + lg.offset;
        else absPos.y = lg.lineGuide + lg.offset;
      });
      e.target.absolutePosition(absPos);
    });

    layer.on('dragend', () => {
      layer.find('.guid-line').forEach((l) => l.destroy());
    });
  }, [veConfig.guidelineOffset]);

  // ─── Zoom / Move ────────────────────────────────────────────────────────
  const handleVEZoom = useCallback((delta: number) => {
    const stage = veSystemRef.current.stage;
    if (!stage) return;
    const oldScale = veStageState.scale;
    const pointer = stage.getPointerPosition()!;
    const newScale = Math.min(Math.max(oldScale * delta, veConfig.minZoom), veConfig.maxZoom);

    const newPos = {
      x: pointer.x - (pointer.x - stage.x()) * (newScale / oldScale),
      y: pointer.y - (pointer.y - stage.y()) * (newScale / oldScale),
    };

    stage.scale({ x: newScale, y: newScale });
    stage.position(newPos);
    stage.batchDraw();
    setVeStageState((s) => ({ ...s, scale: newScale }));
  }, [veStageState.scale, veConfig.minZoom, veConfig.maxZoom]);

  const handleVEZoomReset = useCallback(() => {
    const stage = veSystemRef.current.stage;
    if (!stage) return;
    stage.x(0);
    stage.y(0);
    stage.scale({ x: 1, y: 1 });
    setVeStageState((s) => ({ ...s, scale: 1 }));
  }, []);

  // ─── Canvas Events ──────────────────────────────────────────────────────
  const setupCanvasEvents = useCallback((stage: Konva.Stage) => {
    const system = veSystemRef.current;

    stage.on('wheel', (e) => {
      e.evt.preventDefault();
      if (veStageState.isShiftPressed) {
        stage.move({ x: -e.evt.deltaY, y: 0 });
      } else if (veStageState.isCtrlPressed) {
        const delta = e.evt.deltaY > 0 ? veConfig.zoomoutScale : veConfig.zoominScale;
        handleVEZoom(delta);
      } else {
        stage.move({ x: 0, y: -e.evt.deltaY });
      }
      updatePreview();
    });

    stage.on('mousedown touchstart', (e) => {
      if (e.target !== stage) {
        if (veSelectedBtn === 'select') setVeIsGrabbing(true);
        return;
      }
      if (veSelectedBtn === 'select') {
        const pos = stage.getRelativePointerPosition()!;
        selectedRectPosRef.current.xPos1 = pos.x;
        selectedRectPosRef.current.yPos1 = pos.y;
        system.selectedRect?.setAttrs({ x: pos.x, y: pos.y, width: 0, height: 0, visible: true });
      } else if (veSelectedBtn === 'grab') {
        setVeIsGrabbing(true);
      }
    });

    stage.on('mousemove touchmove', () => {
      const pointerPos = stage.getRelativePointerPosition();
      if (pointerPos) {
        setVeStageState((s) => ({ ...s, xPos: pointerPos.x, yPos: pointerPos.y }));
      }

      if (veSelectedBtn === 'select') {
        if (!system.selectedRect?.visible()) return;
        const pos = stage.getRelativePointerPosition()!;
        selectedRectPosRef.current.xPos2 = pos.x;
        selectedRectPosRef.current.yPos2 = pos.y;
        const rp = selectedRectPosRef.current;
        system.selectedRect?.setAttrs({
          x: Math.min(rp.xPos1, rp.xPos2),
          y: Math.min(rp.yPos1, rp.yPos2),
          width: Math.abs(rp.xPos2 - rp.xPos1),
          height: Math.abs(rp.yPos2 - rp.yPos1),
        });
      }
    });

    stage.on('mouseup touchend', (e) => {
      if (e.target !== stage) {
        if (veSelectedBtn === 'select') setVeIsGrabbing(false);
        return;
      }

      if (veSelectedBtn === 'select') {
        if (!system.selectedRect?.visible()) return;
        setTimeout(() => system.selectedRect?.visible(false));

        const obj = stage.find('.circle, .triangle, .rectangle, .text, .image, .block, .soc1');
        const box = system.selectedRect!.getClientRect();
        const selected = obj.filter((shape) => Konva.Util.haveIntersection(box, shape.getClientRect()));
        const filteredSelected = selected.filter((node) => node.visible());
        system.xfer?.moveToTop();
        system.xfer?.nodes(filteredSelected);
      } else if (veSelectedBtn === 'grab') {
        setVeIsGrabbing(false);
      }
    });

    stage.on('click tap', (e) => {
      if (veSelectedBtn === 'select') {
        if (system.selectedRect?.visible() && system.selectedRect.width() > 0 && system.selectedRect.height() > 0) return;

        if (e.target === stage) {
          system.xfer?.nodes([]);
          setVeShapeInPagePanelState((s) => ({ ...s, display: 'none' }));
          return;
        }

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = (system.xfer?.nodes().indexOf(e.target) ?? -1) >= 0;

        let target = e.target;
        let rootGroup = target.findAncestors('.block');
        if (rootGroup.length > 0) {
          target = rootGroup[0];
        } else {
          rootGroup = target.findAncestors('.soc1');
          if (rootGroup.length > 0) target = rootGroup[0];
        }

        if (target.hasName('circle') || target.hasName('triangle') || target.hasName('rectangle') ||
            target.hasName('text') || target.hasName('image') || target.hasName('block') || target.hasName('soc1')) {
          if (!metaPressed && !isSelected) {
            system.xfer?.nodes([target]);
          } else if (metaPressed && isSelected) {
            const nodes = system.xfer?.nodes().slice() ?? [];
            nodes.splice(nodes.indexOf(target), 1);
            system.xfer?.nodes(nodes);
          } else if (metaPressed && !isSelected) {
            const nodes = (system.xfer?.nodes() ?? []).concat([target]);
            system.xfer?.nodes(nodes);
          }
        }
      } else if (veSelectedBtn === 'text') {
        const pointerPos = getSnapPointOnStage(stage, veConfig.gridSize);
        createText(pointerPos.x, pointerPos.y, 'text', veConfig, veSystemLayerRef.current, pushState);
      }
    });
  }, [veStageState.isShiftPressed, veStageState.isCtrlPressed, veSelectedBtn, veConfig, handleVEZoom, updatePreview, pushState]);

  // ─── Drag & Drop ───────────────────────────────────────────────────────
  const handleCanvasDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
  }, []);

  const handleCanvasDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    const stage = veSystemRef.current.stage;
    if (!stage) return;
    stage.setPointersPositions(e);
    const elemType = e.dataTransfer?.getData('elem-type');
    const pointerPos = getSnapPointOnStage(stage, veConfig.gridSize);

    switch (elemType) {
      case 'spec-note': {
        const size = veConfig.gridSize * 8;
        createRect(pointerPos.x - size / 2, pointerPos.y - size / 2, size, size, veConfig,
          veSystemLayerRef.current, pushState, 'gray', '#F3F1B1', true, true);
        break;
      }
      case 'picture': {
        const picIndex = parseInt(e.dataTransfer?.getData('elem-idx') ?? '0', 10);
        const picData = vePicPreviewDataList[picIndex];
        if (picData.size !== 0 && picData.uploadImg) {
          const width = picData.uploadImg.width;
          const height = picData.uploadImg.height;
          let scale = Math.round(height / (veConfig.gridSize * veConfig.placePictureMaxHeight));
          if (scale === 0) scale = 1;
          createImage(pointerPos.x, pointerPos.y, width / scale, height / scale,
            picData.uploadImg.src, veConfig, veSystemLayerRef.current, pushState);
        }
        break;
      }
    }
  }, [veConfig, vePicPreviewDataList, pushState]);

  // ─── Copy / Paste / Delete ──────────────────────────────────────────────
  const copyObj = useCallback(() => {
    copyObjUtil(veSystemRef.current, veSystemLayerRef.current, veConfig);
  }, [veConfig]);

  const pasteObj = useCallback(() => {
    pasteObjUtil(veSystemRef.current, veSystemLayerRef.current, veConfig);
  }, [veConfig]);

  const handleDelete = useCallback(() => {
    const xfer = veSystemRef.current.xfer;
    if (!xfer) return;
    const nodes = xfer.nodes();
    if (nodes.length > 0) {
      if (nodes.length === 1) {
        pushState('delete', (nodes[0] as any).attrs.bindObjId ?? -1, getPolygonName(nodes[0]));
      } else {
        pushState('delete', -1, 'Shapes');
      }
      for (let i = nodes.length - 1; i >= 0; --i) {
        deleteObj(nodes[i]);
      }
      xfer.nodes([]);
    }
  }, [deleteObj, pushState]);

  const onSelectAll = useCallback(() => {
    const stage = veSystemRef.current.stage;
    const xfer = veSystemRef.current.xfer;
    if (!stage || !xfer) return;
    const obj = stage.find('.circle, .triangle, .rectangle, .text, .image, .block, .soc1');
    const filtered = obj.filter((n) => n.visible());
    xfer.moveToTop();
    xfer.nodes(filtered);
  }, []);

  const onDeselectAll = useCallback(() => {
    veSystemRef.current.xfer?.nodes([]);
  }, []);

  // ─── Layer visibility controls ──────────────────────────────────────────
  const handleGridLayerHideClick = useCallback(() => {
    setVeGridLayerControl((c) => {
      const newHide = !c.isHide;
      veSystemRef.current.grid?.visible(!newHide);
      return { ...c, isHide: newHide };
    });
  }, []);

  const handleShapeLayerHideClick = useCallback(() => {
    setVeShapeLayerControl((c) => {
      const newHide = !c.isHide;
      const layer = veSystemLayerRef.current.shape;
      layer?.visible(!newHide);
      layer?.getChildren().forEach((n) => n.visible(!newHide));
      return { ...c, isHide: newHide };
    });
  }, []);

  const handleDesignLayerHideClick = useCallback(() => {
    setVeDesignLayerControl((c) => {
      const newHide = !c.isHide;
      const layer = veSystemLayerRef.current.design;
      layer?.visible(!newHide);
      layer?.getChildren().forEach((n) => n.visible(!newHide));
      return { ...c, isHide: newHide };
    });
  }, []);

  const handleCommentLayerHideClick = useCallback(() => {
    setVeCommentLayerControl((c) => {
      const newHide = !c.isHide;
      const layer = veSystemLayerRef.current.comment;
      layer?.visible(!newHide);
      layer?.getChildren().forEach((n) => n.visible(!newHide));
      return { ...c, isHide: newHide };
    });
  }, []);

  // ─── Bottom bar select/grab ─────────────────────────────────────────────
  const handleBottomBarLeftBtnClick = useCallback((tooltip: string) => {
    setVeSelectedBtn(tooltip as VeSelectedBtn);
    const stage = veSystemRef.current.stage;
    if (!stage) return;
    const shapes = stage.find('.circle, .triangle, .rectangle, .text, .image');
    if (tooltip === 'select') {
      stage.draggable(false);
      shapes.forEach((item) => item.draggable(true));
    } else if (tooltip === 'grab') {
      stage.draggable(true);
      shapes.forEach((item) => item.draggable(false));
    }
  }, []);

  // ─── Export ─────────────────────────────────────────────────────────────
  const exportCanvas = useCallback(() => {
    const stage = veSystemRef.current.stage;
    if (!stage) return;
    const dataURL = stage.toDataURL({ mimeType: 'image/png', pixelRatio: 2, quality: 1 });
    const link = document.createElement('a');
    link.download = 'canvas-drawing.png';
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  // ─── Image Upload ──────────────────────────────────────────────────────
  const handleImageFileUpload = useCallback((e: Event) => {
    const input = e.target as HTMLInputElement;
    if (!input.files?.length) return;
    const file = input.files[0];
    if (!file.type.match('image.*')) {
      alert('Please select a valid image format (JPG, PNG, GIF...)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const imgURL = (ev.target as FileReader).result as string;
      const img = new Image();
      img.src = imgURL;
      img.onload = () => {
        setVePicPreviewDataList((prev) => {
          const next = [...prev];
          next[vePicUploadBtnIdx] = { uploadImg: img, size: parseFloat((file.size / 1024).toFixed(1)) };
          return next;
        });
      };
    };
    reader.readAsDataURL(file);
  }, [vePicUploadBtnIdx]);

  const handlePicUploadBtnClick = useCallback((idx: number) => {
    setVePicUploadBtnIdx(idx);
    picUploadInputRef.current?.click();
  }, []);

  // ─── Keyboard ──────────────────────────────────────────────────────────
  useKeyboard({
    veSelectedBtn, setVeSelectedBtn, setVeKeyboardKey,
    setVeStageStatePartial: (patch) => setVeStageState((s) => ({ ...s, ...patch })),
    isTopBarLeftHomeBtnClick, setIsTopBarLeftHomeBtnClick,
    onSelectAll, onCopy: copyObj, onPaste: pasteObj,
    onUndo: undo, onRedo: redo, onDelete: handleDelete, onDeselectAll,
  });

  // ─── Init Stage ─────────────────────────────────────────────────────────
  const initStage = useCallback(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const width = container.offsetWidth;
    const height = container.offsetHeight;

    // Destroy existing stage if any
    if (veSystemRef.current.stage) {
      veSystemRef.current.stage.destroy();
    }

    const stage = new Konva.Stage({ container: 'konva-veStage', width, height });
    veSystemRef.current.stage = stage;

    const layers = veSystemLayerRef.current;
    layers.auxBot = new Konva.Layer();
    layers.shape = new Konva.Layer();
    layers.design = new Konva.Layer();
    layers.comment = new Konva.Layer();
    layers.auxTop = new Konva.Layer();

    stage.add(layers.auxBot);
    stage.add(layers.shape);
    stage.add(layers.design);
    stage.add(layers.comment);
    stage.add(layers.auxTop);

    // Transformer
    const xfer = new Konva.Transformer({
      centeredScaling: false, keepRatio: false, rotateEnabled: false, ignoreStroke: true,
    });
    xfer.anchorDragBoundFunc((_oldPos, newPos) => ({
      x: Math.round(newPos.x / veConfig.gridSize) * veConfig.gridSize,
      y: Math.round(newPos.y / veConfig.gridSize) * veConfig.gridSize,
    }));
    xfer.on('transformend', () => {
      const nodes = xfer.nodes();
      nodes.forEach((node) => {
        if (node instanceof Konva.Circle) {
          node.radius(node.radius() * node.scaleX());
        } else if (node instanceof Konva.RegularPolygon) {
          node.radius(node.radius() * node.scaleX());
        } else if (node instanceof Konva.Rect || node instanceof Konva.Text || node instanceof Konva.Image) {
          node.width(node.width() * node.scaleX());
          node.height(node.height() * node.scaleY());
        }
        node.scaleX(1);
        node.scaleY(1);
        pushState('resize', (node.attrs as any).bindObjId ?? node._id, getPolygonName(node));
      });
    });
    veSystemRef.current.xfer = xfer;
    layers.auxTop.add(xfer);

    // Selection rect
    const selectedRect = new Konva.Rect({ fill: 'rgba(220,234,245,1)', visible: false });
    veSystemRef.current.selectedRect = selectedRect;
    layers.auxBot.add(selectedRect);

    // Grid
    const grid = new Konva.Group();
    veSystemRef.current.grid = grid;
    layers.auxBot.add(grid);

    // Setup
    setupCanvasEvents(stage);
    updateGridSystem();
    addInitialShapes();
    addGuidesLine(layers.shape);
    addGuidesLine(layers.design);
    addGuidesLine(layers.comment);
    updatePreview();
    pushState('init', -1, 'all');

    // Drag & Drop on container
    const stageContainer = stage.container();
    stageContainer.addEventListener('dragover', handleCanvasDragOver);
    stageContainer.addEventListener('drop', handleCanvasDrop as any);

    return () => {
      stageContainer.removeEventListener('dragover', handleCanvasDragOver);
      stageContainer.removeEventListener('drop', handleCanvasDrop as any);
    };
  }, [veConfig, setupCanvasEvents, updateGridSystem, addGuidesLine, updatePreview, pushState, handleCanvasDragOver, handleCanvasDrop]);

  const addInitialShapes = useCallback(() => {
    const g = veConfig.gridSize;
    const layers = veSystemLayerRef.current;
    createCircle(g * 3, g * 5, veConfig, layers, pushState);
    createTriangle(g * 10, g * 6, veConfig, layers, pushState);
    createRect(g * 15, g * 2, g * 3, g * 6, veConfig, layers, pushState);
    createRect(g * 42, g * 8, g * 3, g * 4, veConfig, layers, pushState);
    createText(g * 42, g * 5, 'Open Silicon Design', veConfig, layers, pushState);
    createRect(g * 42, g * 18, g * 8, g * 8, veConfig, layers, pushState, 'gray', '#F3F1B1', true, true);
  }, [veConfig, pushState]);

  // ─── Mount / Unmount ──────────────────────────────────────────────────
  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    let cleanupDragDrop: (() => void) | undefined;

    veSystemRef.current.resizeObsvr = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          cleanupDragDrop = initStage();
        }
      }
    });

    veSystemRef.current.resizeObsvr.observe(container);

    // Input listener
    const input = picUploadInputRef.current;
    if (input) {
      input.addEventListener('change', handleImageFileUpload);
    }

    return () => {
      veSystemRef.current.resizeObsvr?.disconnect();
      veSystemRef.current.stage?.destroy();
      cleanupDragDrop?.();
      if (input) input.removeEventListener('change', handleImageFileUpload);
    };
  }, [initStage, handleImageFileUpload]);

  // ─── Return ────────────────────────────────────────────────────────────
  return {
    // Refs
    canvasContainerRef, picUploadInputRef, previewImgRef,
    // Config
    veConfig,
    // Stage state
    veStageState,
    // UI state
    veSelectedBtn, setVeSelectedBtn,
    veIsGrabbing,
    veIsCodeFreeze, setVeIsCodeFreeze,
    wbTheme, toggleWbTheme,
    veTemplateType, setVeTemplateType,
    veKeyboardKey,
    isTopBarLeftHomeBtnClick, setIsTopBarLeftHomeBtnClick,
    // Layer controls
    veGridLayerControl, veShapeLayerControl, veDesignLayerControl, veCommentLayerControl,
    handleGridLayerHideClick, handleShapeLayerHideClick, handleDesignLayerHideClick, handleCommentLayerHideClick,
    setVeShapeLayerControl, setVeDesignLayerControl, setVeCommentLayerControl,
    // Picture upload
    vePicUploadBtnIdx, vePicPreviewDataList, handlePicUploadBtnClick,
    // Shape in-page panel
    veShapeInPagePanelState, veShapeInPagePanelTool,
    // Sub-bar selections
    selectedPenSubBarFirst, setSelectedPenSubBarFirst,
    selectedPenSubBarSecond, setSelectedPenSubBarSecond,
    selectedPenSubBarThird, setSelectedPenSubBarThird,
    selectedPenSubBarFourth, setSelectedPenSubBarFourth,
    selectedEraserSubBarFirst, setSelectedEraserSubBarFirst,
    selectedShapeSubBarFirst, setSelectedShapeSubBarFirst,
    // History
    historyState, historyItemList, historyListPanelRef, handleHistoryItemClick,
    // Actions
    handleVEZoom, handleVEZoomReset,
    handleBottomBarLeftBtnClick,
    exportCanvas,
    undo, redo,
  };
}

// ─── Utility Functions (module-level) ─────────────────────────────────────

function getSnapPointOnStage(stage: Konva.Stage, gridSize: number) {
  const pointerPos = stage.getRelativePointerPosition()!;
  pointerPos.x = Math.round(pointerPos.x / gridSize) * gridSize;
  pointerPos.y = Math.round(pointerPos.y / gridSize) * gridSize;
  return pointerPos;
}

function getLineGuideStops(skipShape: Konva.Node, stage: Konva.Stage) {
  let vertical = [0, stage.width() / 2, stage.width()];
  let horizontal = [0, stage.height() / 2, stage.height()];

  stage.find('.circle, .triangle, .rectangle, .text, .image').forEach((guideItem) => {
    if (guideItem === skipShape) return;
    const box = guideItem.getClientRect();
    vertical.push(box.x, box.x + box.width, box.x + box.width / 2);
    horizontal.push(box.y, box.y + box.height, box.y + box.height / 2);
  });

  return { vertical: vertical.flat(), horizontal: horizontal.flat() };
}

function getObjectSnappingEdges(node: Konva.Node) {
  const box = node.getClientRect();
  const absPos = node.absolutePosition();

  return {
    vertical: [
      { guide: Math.round(box.x), offset: Math.round(absPos.x - box.x), snap: 'start' },
      { guide: Math.round(box.x + box.width / 2), offset: Math.round(absPos.x - box.x - box.width / 2), snap: 'center' },
      { guide: Math.round(box.x + box.width), offset: Math.round(absPos.x - box.x - box.width), snap: 'end' },
    ],
    horizontal: [
      { guide: Math.round(box.y), offset: Math.round(absPos.y - box.y), snap: 'start' },
      { guide: Math.round(box.y + box.height / 2), offset: Math.round(absPos.y - box.y - box.height / 2), snap: 'center' },
      { guide: Math.round(box.y + box.height), offset: Math.round(absPos.y - box.y - box.height), snap: 'end' },
    ],
  };
}

function getGuides(
  lineGuideStops: { vertical: number[]; horizontal: number[] },
  itemBounds: ReturnType<typeof getObjectSnappingEdges>,
  guidelineOffset: number,
) {
  const resultV: any[] = [];
  const resultH: any[] = [];

  lineGuideStops.vertical.forEach((lineGuide) => {
    itemBounds.vertical.forEach((itemBound) => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < guidelineOffset) {
        resultV.push({ lineGuide, diff, snap: itemBound.snap, offset: itemBound.offset });
      }
    });
  });

  lineGuideStops.horizontal.forEach((lineGuide) => {
    itemBounds.horizontal.forEach((itemBound) => {
      const diff = Math.abs(lineGuide - itemBound.guide);
      if (diff < guidelineOffset) {
        resultH.push({ lineGuide, diff, snap: itemBound.snap, offset: itemBound.offset });
      }
    });
  });

  const guides: any[] = [];
  const minV = resultV.sort((a, b) => a.diff - b.diff)[0];
  const minH = resultH.sort((a, b) => a.diff - b.diff)[0];
  if (minV) guides.push({ lineGuide: minV.lineGuide, offset: minV.offset, orientation: 'V', snap: minV.snap });
  if (minH) guides.push({ lineGuide: minH.lineGuide, offset: minH.offset, orientation: 'H', snap: minH.snap });
  return guides;
}

function drawGuides(layer: Konva.Layer, guides: any[]) {
  guides.forEach((lg) => {
    const line = new Konva.Line({
      points: lg.orientation === 'H' ? [-6000, 0, 6000, 0] : [0, -6000, 0, 6000],
      stroke: 'rgb(0, 161, 255)', strokeWidth: 1, name: 'guid-line', dash: [4, 6],
    });
    layer.add(line);
    line.absolutePosition(
      lg.orientation === 'H' ? { x: 0, y: lg.lineGuide } : { x: lg.lineGuide, y: 0 },
    );
  });
}
