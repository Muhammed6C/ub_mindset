import { useState } from 'react';
import { BookOpen, Grid2X2, House, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import './GlassBottomBar.css';

const TABS = [
  { label: 'Accueil', to: '/', Icon: House },
  { label: 'Collection', to: '/catalog', Icon: Grid2X2 },
  { label: 'Lookbook', to: '/lookbook', Icon: BookOpen },
  { label: 'Panier', to: '/cart', Icon: ShoppingBag },
];

export default function GlassBottomBar({ activeIndex, onTabChange }) {
  const [motionKey, setMotionKey] = useState(0);
  const [watchingIndex, setWatchingIndex] = useState(null);
  const visualIndex = activeIndex;

  const selectTab = (index) => {
    if (index === visualIndex) return;
    setWatchingIndex(visualIndex);
    setMotionKey((value) => value + 1);
    onTabChange?.(index);
    window.setTimeout(() => setWatchingIndex(null), 360);
    if ('vibrate' in navigator) navigator.vibrate(10);
  };

  return (
    <nav className="glass-bottom-bar" aria-label="Navigation principale mobile">
      <div className="glass-bottom-bar__pill-position" style={{ transform: `translateX(${visualIndex * 100}%)` }} aria-hidden="true">
        <div className="glass-bottom-bar__pill-surface" key={motionKey} />
      </div>
      {TABS.map(({ label, to, Icon }, index) => {
        const isActive = index === visualIndex;
        const isWatching = watchingIndex === index;
        return (
          <Link
            className={`glass-bottom-bar__item${isActive ? ' is-active' : ''}${isWatching ? ' is-watching' : ''}`}
            key={label}
            to={to}
            aria-current={activeIndex === index ? 'page' : undefined}
            onClick={() => selectTab(index)}
          >
            <Icon className="glass-bottom-bar__icon" size={21} strokeWidth={isActive ? 2.2 : 1.65} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
