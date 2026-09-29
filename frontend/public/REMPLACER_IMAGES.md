# Guide : Remplacer les SVG par des photos de mannequins réels

## Structure des dossiers

```
frontend/public/
├── mannequins/
│   ├── homme/
│   │   ├── mince.svg       ← Remplacer par mince.jpg
│   │   ├── athletique.svg  ← Remplacer par athletique.jpg
│   │   └── costaud.svg     ← Remplacer par costaud.jpg
│   └── femme/
│       ├── mince.svg       ← Remplacer par mince.jpg
│       ├── athletique.svg  ← Remplacer par athletique.jpg
│       └── costaud.svg     ← Remplacer par costaud.jpg
└── essayage/
    ├── hoodie-tech.svg           ← Remplacer par hoodie-tech.jpg
    ├── veste-wind-breaker.svg    ← Remplacer par veste-wind-breaker.jpg
    ├── legging-performance.svg   ← Remplacer par legging-performance.jpg
    ├── tshirt-essential.svg      ← Remplacer par tshirt-essential.jpg
    ├── sweat-oversized.svg       ← Remplacer par sweat-oversized.jpg
    └── short-training.svg        ← Remplacer par short-training.jpg
```

## Étapes pour remplacer

### 1. Préparer les photos

**Mannequins :**
- Format : JPG ou WebP
- Taille recommandée : 800×1600 px (ratio 1:2)
- Fond : Blanc ou transparent
- Pose : Face, bras le long du corps

**Vêtements :**
- Format : JPG ou WebP
- Taille recommandée : 800×800 px
- Fond : Blanc ou transparent
- Vue : Face, à plat ou sur mannequin

### 2. Remplacer les fichiers

Pour chaque fichier :
1. Supprimer l'ancien fichier `.svg`
2. Ajouter la nouvelle photo `.jpg` ou `.webp` avec le **même nom** (mais extension différente)

### 3. Mettre à jour la configuration

Dans `frontend/src/config/tryOn.js`, remplacer les extensions :

```javascript
// Avant
export const TRY_ON_PRODUCT_CONFIG = {
  1: { category: 'haut', asset: '/essayage/hoodie-tech.svg' },
  // ...
};

// Après
export const TRY_ON_PRODUCT_CONFIG = {
  1: { category: 'haut', asset: '/essayage/hoodie-tech.jpg' },
  // ...
};
```

Et pour les mannequins :

```javascript
// Avant
mannequins: {
  homme: {
    mince: '/mannequins/homme/mince.svg',
    // ...
  },
  // ...
},

// Après
mannequins: {
  homme: {
    mince: '/mannequins/homme/mince.jpg',
    // ...
  },
  // ...
},
```

## Où trouver des photos de mannequins ?

### Banques d'images gratuites
- [Unsplash](https://unsplash.com) — Photos de mode, mannequins
- [Pexels](https://pexels.com) — Photos de vêtements, mannequins
- [Pixabay](https://pixabay.com) — Images libres de droits

### Recherches suggérées
- "fashion mannequin front view"
- "clothing model neutral pose"
- "apparel flat lay"
- "clothing on hanger white background"

### Outils IA pour générer des images
- Midjourney
- DALL-E 3
- Stable Diffusion

## Ajustement des positions

Après avoir remplacé les images, tu devras peut-être ajuster les positions des vêtements dans `frontend/src/config/tryOn.js` :

```javascript
placements: {
  homme: {
    mince: {
      bas:  { top: '47%', left: '50%', width: '50%', zIndex: 2 },
      haut:  { top: '19%', left: '50%', width: '62%', zIndex: 3 },
      veste: { top: '16%', left: '50%', width: '66%', zIndex: 4 },
    },
    // ...
  },
  // ...
},
```

Ajuste les valeurs `top`, `left`, `width` pour que les vêtements s'alignent parfaitement sur tes nouvelles photos.

## Tester

```bash
cd C:\Dev\ub_mindset\frontend
npm run dev
```

Ouvre `http://localhost:5173` et va sur la page d'essayage pour vérifier l'alignement.
