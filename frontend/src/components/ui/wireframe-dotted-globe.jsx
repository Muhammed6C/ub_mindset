import { useEffect, useRef } from 'react';
import './wireframe-dotted-globe.css';

// Silhouettes volontairement simplifiées : le globe ne dépend pas d'un fetch externe.
const LANDMASSES = [
  [[-168, 72], [-150, 60], [-140, 48], [-125, 38], [-112, 28], [-102, 18], [-88, 14], [-78, 22], [-72, 42], [-88, 56], [-110, 70], [-140, 78], [-168, 72]],
  [[-82, 12], [-74, 5], [-70, -12], [-62, -30], [-58, -51], [-47, -54], [-36, -32], [-38, -8], [-48, 8], [-64, 12], [-82, 12]],
  [[-12, 70], [10, 72], [42, 61], [74, 58], [105, 51], [136, 53], [162, 63], [178, 53], [153, 35], [128, 20], [107, 8], [82, 10], [61, 29], [38, 38], [19, 34], [8, 48], [-5, 46], [-12, 70]],
  [[-18, 36], [8, 38], [32, 31], [42, 12], [39, -12], [28, -34], [16, -35], [7, -15], [-5, 5], [-18, 22], [-18, 36]],
  [[112, -12], [128, -15], [145, -23], [151, -37], [137, -43], [119, -35], [112, -12]],
];

const toRadians = (degrees) => degrees * (Math.PI / 180);

function pointInPolygon([x, y], polygon) {
  let isInside = false;
  for (let index = 0, previousIndex = polygon.length - 1; index < polygon.length; previousIndex = index++) {
    const [currentX, currentY] = polygon[index];
    const [previousX, previousY] = polygon[previousIndex];
    if ((currentY > y) !== (previousY > y) && x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX) isInside = !isInside;
  }
  return isInside;
}

function buildDots() {
  const dots = [];
  for (let longitude = -180; longitude <= 180; longitude += 4) {
    for (let latitude = -58; latitude <= 76; latitude += 4) {
      if (LANDMASSES.some((landmass) => pointInPolygon([longitude, latitude], landmass))) dots.push([longitude, latitude]);
    }
  }
  return dots;
}

const LAND_DOTS = buildDots();

export default function RotatingEarth({ className = '', label = 'Globe en rotation représentant la communauté UB Mindset' }) {
  const canvasRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return undefined;

    const context = canvas.getContext('2d');
    if (!context) return undefined;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frameId;
    let isDragging = false;
    let previousPoint = null;
    let rotation = [-14, -12];
    let dimensions = { width: 1, height: 1, radius: 1 };

    const project = (longitude, latitude) => {
      const [rotationLongitude, rotationLatitude] = rotation.map(toRadians);
      const lambda = toRadians(longitude);
      const phi = toRadians(latitude);
      const longitudeDifference = lambda - rotationLongitude;
      const cosine = Math.sin(rotationLatitude) * Math.sin(phi) + Math.cos(rotationLatitude) * Math.cos(phi) * Math.cos(longitudeDifference);
      if (cosine < 0) return null;
      const x = dimensions.width / 2 + dimensions.radius * Math.cos(phi) * Math.sin(longitudeDifference);
      const y = dimensions.height / 2 - dimensions.radius * (Math.cos(rotationLatitude) * Math.sin(phi) - Math.sin(rotationLatitude) * Math.cos(phi) * Math.cos(longitudeDifference));
      return [x, y];
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      dimensions = { width, height, radius: Math.min(width, height) * 0.42 };
    };

    const drawCurve = (points) => {
      let drawing = false;
      points.forEach(([longitude, latitude]) => {
        const point = project(longitude, latitude);
        if (!point) {
          drawing = false;
          return;
        }
        if (!drawing) {
          context.moveTo(point[0], point[1]);
          drawing = true;
        } else context.lineTo(point[0], point[1]);
      });
    };

    const draw = () => {
      const { width, height, radius } = dimensions;
      context.clearRect(0, 0, width, height);
      context.beginPath();
      context.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      context.fillStyle = '#090909';
      context.fill();
      context.strokeStyle = 'rgba(242, 241, 239, 0.86)';
      context.lineWidth = 1;
      context.stroke();

      context.beginPath();
      for (let longitude = -180; longitude < 180; longitude += 30) {
        const points = [];
        for (let latitude = -88; latitude <= 88; latitude += 3) points.push([longitude, latitude]);
        drawCurve(points);
      }
      for (let latitude = -60; latitude <= 60; latitude += 30) {
        const points = [];
        for (let longitude = -180; longitude <= 180; longitude += 3) points.push([longitude, latitude]);
        drawCurve(points);
      }
      context.strokeStyle = 'rgba(242, 241, 239, 0.18)';
      context.lineWidth = 0.7;
      context.stroke();

      LAND_DOTS.forEach(([longitude, latitude]) => {
        const point = project(longitude, latitude);
        if (!point) return;
        const [x, y] = point;
        const distance = Math.hypot(x - width / 2, y - height / 2);
        if (distance > radius) return;
        context.beginPath();
        context.arc(x, y, 1.05, 0, Math.PI * 2);
        context.fillStyle = distance > radius * 0.89 ? 'rgba(242, 241, 239, 0.20)' : 'rgba(242, 241, 239, 0.72)';
        context.fill();
      });
    };

    const animate = () => {
      if (!reduceMotion && !isDragging) rotation[0] += 0.16;
      draw();
      frameId = window.requestAnimationFrame(animate);
    };

    const pointerDown = (event) => {
      isDragging = true;
      previousPoint = { x: event.clientX, y: event.clientY };
      canvas.setPointerCapture?.(event.pointerId);
    };
    const pointerMove = (event) => {
      if (!isDragging || !previousPoint) return;
      rotation[0] += (event.clientX - previousPoint.x) * 0.35;
      rotation[1] = Math.max(-65, Math.min(65, rotation[1] - (event.clientY - previousPoint.y) * 0.28));
      previousPoint = { x: event.clientX, y: event.clientY };
    };
    const pointerUp = (event) => {
      isDragging = false;
      previousPoint = null;
      canvas.releasePointerCapture?.(event.pointerId);
    };
    const keyDown = (event) => {
      const moves = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 8], ArrowDown: [0, -8] };
      const move = moves[event.key];
      if (!move) return;
      event.preventDefault();
      rotation[0] += move[0];
      rotation[1] = Math.max(-65, Math.min(65, rotation[1] + move[1]));
    };

    const observer = new ResizeObserver(resize);
    observer.observe(wrapper);
    canvas.addEventListener('pointerdown', pointerDown);
    canvas.addEventListener('pointermove', pointerMove);
    canvas.addEventListener('pointerup', pointerUp);
    canvas.addEventListener('pointercancel', pointerUp);
    canvas.addEventListener('keydown', keyDown);
    resize();
    animate();

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frameId);
      canvas.removeEventListener('pointerdown', pointerDown);
      canvas.removeEventListener('pointermove', pointerMove);
      canvas.removeEventListener('pointerup', pointerUp);
      canvas.removeEventListener('pointercancel', pointerUp);
      canvas.removeEventListener('keydown', keyDown);
    };
  }, []);

  return (
    <div ref={wrapperRef} className={`rotating-earth ${className}`}>
      <canvas ref={canvasRef} aria-describedby="rotating-earth-instructions" aria-label={label} role="application" tabIndex="0" />
      <span className="rotating-earth__hint" aria-hidden="true">GLISSE POUR TOURNER</span>
      <span id="rotating-earth-instructions" className="rotating-earth__instructions">Glisse pour tourner le globe ou utilise les touches fléchées.</span>
    </div>
  );
}
