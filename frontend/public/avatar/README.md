# Modèles 3D du studio avatar

## Où déposer les fichiers

Conserve les modèles dans ce dossier :

```
frontend/public/avatar/
├── mannequin_homme_base.glb
├── mannequin_homme_base.glb.gz  # version compressée utilisée en priorité
├── mannequin_femme_base.glb
├── mannequin_neutre_base.glb
└── garments/
    ├── hoodie-tech.glb
    ├── pantalon-training.glb
    └── veste-wind-breaker.glb
```

Les profils disponibles et les noms de fichiers se règlent dans
`frontend/src/config/avatarExperience.js` → `AVATAR_PROFILES`.
Tant que `mannequin_femme_base.glb` ou `mannequin_neutre_base.glb` manquent,
le studio utilise le mannequin homme comme secours et l'indique à l'utilisateur.

Les vêtements portables se déclarent dans le même fichier,
`AVATAR_GARMENTS` : renseigne la catégorie, la couche et l'URL d'asset prévue.
Sans mesh skinné validé, le studio affiche un volume de démonstration clairement
identifiable, afin que l'essayage reste utilisable. L'intégration des meshes
skinnés réels devra être validée sur chaque morphologie avant activation.

## Réglages administrables

- Profils, teints, coiffures et styles : `src/config/avatarExperience.js`.
- Morphologies et correspondance des blend shapes : `src/avatar3d/avatarConfig.js`.
- Règles de tailles et numéro WhatsApp : `src/config/tryOn.js`.
- Taille/poids et calcul de silhouette : `src/avatar3d/bodyProfile.js`.

---

# Modèle de l'avatar 3D — dépose ton fichier ici

Dépose ton export Blender **au format GLB** à cet emplacement exact :

```
frontend/public/avatar/mannequin_homme_base.glb
```

Le code (voir `frontend/src/avatar3d/avatarConfig.js`) le charge automatiquement
depuis `/avatar/mannequin_homme_base.glb`. Si le fichier compagnon
`mannequin_homme_base.glb.gz` est présent et que le navigateur prend en charge
la décompression gzip, il est utilisé en priorité ; son contenu est strictement
identique au GLB original. Le GLB non compressé reste disponible comme solution
de repli. Après remplacement du modèle, régénère aussi le fichier `.glb.gz`.
Tant que le modèle est absent, la page `/essayage` affiche un message de secours
« Avatar 3D indisponible ».

Si tu utilises un autre nom de fichier, tu as juste à modifier la valeur
`modelUrl` dans `frontend/src/avatar3d/avatarConfig.js`.

---

## Contrat technique attendu (pour que le rig et les morph targets s'appliquent automatiquement)

### Export
- Format : **glTF Binary (.glb)**
- Axe : **Y-up**, **+Z vers l'avant**
- Échelle : 1 unité = 1 mètre, **pieds sur le sol** (origine à Y = 0)
- Pose : **A-pose** ou **T-pose**, maillage UV-mappé, un ou peu de meshes *skinned*

### Squelette (rig) — noms de bones standard (compatibles habillage de vêtements)
```
hips, spine, chest, neck, head,
shoulder.L / shoulder.R,
upperArm.L / upperArm.R, lowerArm.L / lowerArm.R, hand.L / hand.R,
upperLeg.L / upperLeg.R, lowerLeg.L / lowerLeg.R, foot.L / foot.R
```

### Morph targets (blend shapes) — influencent la silhouette
Le modèle actuel (`mannequin_homme_base.glb`) contient **6 morph targets**, avec une
influence allant de **0 à 1** :

| Morph target (GLB) | Zone           | Rôle                                   |
|--------------------|----------------|----------------------------------------|
| `Shoulders_Wide`   | Épaules        | Largeur / carrure d'épaules            |
| `Chest_Broad`      | Poitrine       | Volume de poitrine                     |
| `Waist_Slim`       | Taille         | Affine la taille (direction inversée)  |
| `Hips_Wide`        | Hanches        | Largeur de hanches                     |
| `Overall_Bulky`    | Carrure        | Volume / masse générale                |
| `Lean_Correction`  | —              | Correction de pose (laissée neutre)    |

> La correspondance clé logique → morph target réel (et la direction, ex.
> `Waist_Slim` inversé) se fait dans `frontend/src/avatar3d/avatarConfig.js` →
> `morphTargets`. Si tu renommes/ajoutes un morph target dans Blender, mets à
> jour ce fichier (`model`) plutôt que le code du moteur.

Le squelette attendu (**19 os** typiques) : `Pelvis, Spine, Chest, Neck, Head,
Shoulder_L/R, UpperArm_L/R, LowerArm_L/R, Hand_L/R, UpperLeg_L/R, LowerLeg_L/R,
Foot_L/R` — compatible habillage de vêtements (skinning) pour la suite.

> La correspondance entre ces noms et le code se fait dans
> `frontend/src/avatar3d/avatarConfig.js` → `morphTargets`. Si tu renommes un
> morph target dans Blender, mets à jour la même clé dans ce fichier.

La **hauteur** n'est pas un morph target : elle est appliquée par mise à l'échelle
verticale du squelette (pivot aux pieds), calculée par `BodyProfile`.
