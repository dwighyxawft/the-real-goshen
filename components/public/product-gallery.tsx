'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X, ZoomIn } from 'lucide-react';

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  const goPrev = useCallback(() => setActive((i) => (i === 0 ? images.length - 1 : i - 1)), [images.length]);
  const goNext = useCallback(() => setActive((i) => (i === images.length - 1 ? 0 : i + 1)), [images.length]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(false);
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, goPrev, goNext]);

  return (
    <>
      <div className="gallery-main" style={{ position: 'relative', borderRadius: 20, overflow: 'hidden', marginTop: 16 }}>
        <Image
          src={images[active]}
          alt={`${name} — image ${active + 1}`}
          width={600}
          height={750}
          className="detail-art"
          style={{ width: '100%', height: 'auto', display: 'block' }}
          unoptimized
        />
        <button className="gallery-nav gallery-prev" onClick={goPrev} aria-label="Previous image" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronLeft size={18} />
        </button>
        <button className="gallery-nav gallery-next" onClick={goNext} aria-label="Next image" style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 40, height: 40, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ChevronRight size={18} />
        </button>
        <button className="gallery-zoom" onClick={() => setLightbox(true)} aria-label="Zoom image" style={{ position: 'absolute', right: 12, bottom: 12, width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,.2)', background: 'rgba(0,0,0,.4)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <ZoomIn size={16} />
        </button>
      </div>

      <div className="gallery-thumbs" style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
        {images.map((src, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`View image ${i + 1}`}
            style={{
              flexShrink: 0,
              width: 72,
              height: 72,
              borderRadius: 12,
              overflow: 'hidden',
              border: i === active ? '2px solid var(--gold-text)' : '2px solid transparent',
              cursor: 'pointer',
              padding: 0,
              background: 'none',
            }}
          >
            <Image src={src} alt={`${name} thumbnail ${i + 1}`} width={72} height={72} style={{ width: '100%', height: '100%', objectFit: 'cover' }} unoptimized />
          </button>
        ))}
      </div>

      <div className="gallery-dots" style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12 }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            aria-label={`Go to image ${i + 1}`}
            style={{
              width: i === active ? 24 : 8,
              height: 8,
              borderRadius: 4,
              border: 'none',
              background: i === active ? 'var(--gold-text)' : 'rgba(0,0,0,.2)',
              cursor: 'pointer',
              transition: 'width .2s, background .2s',
            }}
          />
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,.9)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 40,
          }}
        >
          <button
            onClick={() => setLightbox(false)}
            aria-label="Close"
            style={{ position: 'absolute', top: 20, right: 20, width: 44, height: 44, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <X size={22} />
          </button>
          <img src={images[active]} alt={`${name} — image ${active + 1}`} style={{ maxWidth: '90vw', maxHeight: '85vh', borderRadius: 12 }} />
          <button onClick={(e) => { e.stopPropagation(); goPrev(); }} aria-label="Previous" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronLeft size={24} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); goNext(); }} aria-label="Next" style={{ position: 'absolute', right: 20, top: '50%', transform: 'translateY(-50%)', width: 48, height: 48, borderRadius: '50%', border: 'none', background: 'rgba(255,255,255,.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ChevronRight size={24} />
          </button>
        </div>
      )}
    </>
  );
}
