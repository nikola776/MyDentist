import { useCallback, useEffect, useState } from 'react';
import { slides } from './slides';
import { DiagramViewer } from './DiagramViewer';

export default function App() {
  const [i, setI] = useState(0);
  const slide = slides[i];

  const go = useCallback((delta: number) => {
    setI((v) => Math.min(Math.max(v + delta, 0), slides.length - 1));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') go(1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') go(-1);
      else if (e.key === 'Home') setI(0);
      else if (e.key === 'End') setI(slides.length - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">Client</span>
          <span className="brand-sub">Architecture</span>
        </div>
        <div className="slide-meta">
          <span className="slide-title">{slide ? slide.title : 'No diagrams yet'}</span>
          {slide && (
            <span className={`chip ${slide.audience === 'Technical' ? 'chip-tech' : 'chip-biz'}`}>
              {slide.audience}
            </span>
          )}
        </div>
        <div className="counter">
          {slides.length ? `${i + 1} / ${slides.length}` : '0 / 0'}
        </div>
      </header>

      <main className="stage">
        {slide ? (
          /* key forces a fresh mount, so the view re-fits on every slide change */
          <DiagramViewer key={slide.id} svg={slide.svg} />
        ) : (
          <div className="empty">
            <h1>The deck is empty</h1>
            <ol>
              <li>
                Write <code>docs/diagrams/mermaid/&lt;name&gt;.mmd</code>, following{' '}
                <code>docs/diagram-conventions.md</code>.
              </li>
              <li>
                <code>npm run render</code> — renders, validates, syncs into <code>src/assets</code>.
              </li>
              <li>
                Import the SVG in <code>src/slides.ts</code> and give it a title, caption and audience.
              </li>
            </ol>
          </div>
        )}

        {slides.length > 1 && (
          <>
            <button
              className="nav nav-prev"
              onClick={() => go(-1)}
              disabled={i === 0}
              title="Previous (Left arrow)"
              aria-label="Previous diagram"
            >
              ‹
            </button>
            <button
              className="nav nav-next"
              onClick={() => go(1)}
              disabled={i === slides.length - 1}
              title="Next (Right arrow)"
              aria-label="Next diagram"
            >
              ›
            </button>
          </>
        )}
      </main>

      {slides.length > 0 && (
        <footer className="filmstrip">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              className={`thumb ${idx === i ? 'active' : ''}`}
              onClick={() => setI(idx)}
              title={s.title}
            >
              <div className="thumb-svg" dangerouslySetInnerHTML={{ __html: s.svg }} />
              <span className="thumb-label">
                {idx + 1}. {s.title}
              </span>
            </button>
          ))}
        </footer>
      )}

      {slide && <div className="caption">{slide.caption}</div>}
    </div>
  );
}
