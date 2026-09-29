import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch';

function Controls() {
  const { zoomIn, zoomOut, resetTransform, centerView } = useControls();
  return (
    <div className="controls">
      <button title="Zoom in" aria-label="Zoom in" onClick={() => zoomIn()}>+</button>
      <button title="Zoom out" aria-label="Zoom out" onClick={() => zoomOut()}>−</button>
      <button
        className="fit"
        title="Fit to screen"
        onClick={() => {
          resetTransform();
          centerView(1, 0);
        }}
      >
        Fit
      </button>
    </div>
  );
}

/**
 * Renders one pre-rendered diagram SVG in a zoom/pan canvas: wheel to zoom,
 * drag to pan, double-click to reset, plus explicit controls. The parent sets a
 * `key` per slide so the view re-fits whenever the diagram changes.
 */
export function DiagramViewer({ svg }: { svg: string }) {
  return (
    <TransformWrapper
      minScale={0.1}
      maxScale={16}
      centerOnInit
      limitToBounds={false}
      wheel={{ step: 0.12 }}
      doubleClick={{ mode: 'reset' }}
      panning={{ velocityDisabled: true }}
    >
      <Controls />
      <TransformComponent wrapperClass="canvas" contentClass="content">
        <div className="svg-host" dangerouslySetInnerHTML={{ __html: svg }} />
      </TransformComponent>
    </TransformWrapper>
  );
}
