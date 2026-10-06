// Enveloppe React mince autour du moteur Three.js (AvatarEngine).
// Monte la scène dans une div, applique le profil quand il change,
// et libère les ressources WebGL au démontage.

import { useEffect, useRef, useState } from 'react';
import { AVATAR_CONFIG } from '../avatar3d/avatarConfig';
import './AvatarViewer.css';

export default function AvatarViewer({ profile, items = [], appearance, modelUrl = AVATAR_CONFIG.modelUrl, fallbackModelUrl, className = '' }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const profileRef = useRef(profile);
  const itemsRef = useRef(items);
  const appearanceRef = useRef(appearance);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    appearanceRef.current = appearance;
  }, [appearance]);

  useEffect(() => {
    let cancelled = false;
    let engine;
    const controller = new AbortController();

    const setup = async () => {
      try {
        const { AvatarEngine } = await import('../avatar3d/engine');
        if (cancelled) return;
        engine = new AvatarEngine(containerRef.current);
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }

      engineRef.current = engine;

      try {
        try {
          await engine.load(modelUrl, controller.signal);
        } catch (error) {
          if (controller.signal.aborted) return;
          if (!fallbackModelUrl) throw error;
          await engine.load(fallbackModelUrl, controller.signal);
        }
        if (cancelled) return;
        if (profileRef.current) engine.setBodyProfile(profileRef.current);
        engine.setOutfit(itemsRef.current);
        engine.setAppearance(appearanceRef.current);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    let observer;
    if (typeof IntersectionObserver === 'undefined') {
      setup();
    } else {
      observer = new IntersectionObserver((entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        setup();
      }, { rootMargin: '160px 0px' });
      observer.observe(containerRef.current);
    }

    return () => {
      cancelled = true;
      controller.abort();
      observer?.disconnect();
      if (engine) engine.dispose();
      engineRef.current = null;
    };
  }, [modelUrl, fallbackModelUrl]);

  useEffect(() => {
    if (engineRef.current && status === 'ready') {
      engineRef.current.setBodyProfile(profile);
    }
  }, [profile, status]);

  useEffect(() => {
    if (engineRef.current && status === 'ready') engineRef.current.setOutfit(items);
  }, [items, status]);

  useEffect(() => {
    if (engineRef.current && status === 'ready') engineRef.current.setAppearance(appearance);
  }, [appearance, status]);

  return (
    <div className={`avatar-viewer ${className}`.trim()}>
      <div className="avatar-viewer__canvas" ref={containerRef} aria-hidden="true" />
      {status === 'ready' && <button className="avatar-viewer__reset" type="button" onClick={() => engineRef.current?.resetView()}>FACE</button>}

      {status === 'loading' && (
        <div className="avatar-viewer__status" aria-live="polite">Chargement de l'avatar 3D…</div>
      )}

      {status === 'error' && (
        <div className="avatar-viewer__status avatar-viewer__status--error" role="status">
          <p>Avatar 3D indisponible</p>
          <small>
            Déposez le modèle dans <code>public{modelUrl}</code>
          </small>
        </div>
      )}
    </div>
  );
}
