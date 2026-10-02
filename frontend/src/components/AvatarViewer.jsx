// Enveloppe React mince autour du moteur Three.js (AvatarEngine).
// Monte la scène dans une div, applique le profil quand il change,
// et libère les ressources WebGL au démontage.

import { useEffect, useRef, useState } from 'react';
import { AvatarEngine } from '../avatar3d/engine';
import { AVATAR_CONFIG } from '../avatar3d/avatarConfig';
import './AvatarViewer.css';

export default function AvatarViewer({ profile, modelUrl = AVATAR_CONFIG.modelUrl, className = '' }) {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const profileRef = useRef(profile);
  const [status, setStatus] = useState('loading'); // loading | ready | error

  useEffect(() => {
    profileRef.current = profile;
  }, [profile]);

  useEffect(() => {
    let cancelled = false;
    let engine;

    const setup = async () => {
      try {
        engine = new AvatarEngine(containerRef.current);
      } catch {
        if (!cancelled) setStatus('error');
        return;
      }

      engineRef.current = engine;

      try {
        await engine.load(modelUrl);
        if (cancelled) return;
        if (profileRef.current) engine.setBodyProfile(profileRef.current);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    };

    setup();

    return () => {
      cancelled = true;
      if (engine) engine.dispose();
      engineRef.current = null;
    };
  }, [modelUrl]);

  useEffect(() => {
    if (engineRef.current && status === 'ready') {
      engineRef.current.setBodyProfile(profile);
    }
  }, [profile, status]);

  return (
    <div className={`avatar-viewer ${className}`.trim()}>
      <div className="avatar-viewer__canvas" ref={containerRef} aria-hidden="true" />

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
