// Moteur 3D (Three.js) agnostique du framework.
// Gère la scène, la caméra, l'éclairage, le rendu et l'application du profil
// corporel (morph targets + échelle verticale) sur le modèle chargé.
// Réutilisable hors de la page d'essayage (catalogue, lookbook, etc.).

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { AVATAR_CONFIG } from './avatarConfig.js';
import { AVATAR_GARMENTS } from '../config/avatarExperience.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export class AvatarEngine {
  constructor(container) {
    if (!container) throw new Error('AvatarEngine : conteneur manquant.');

    this.container = container;
    this.morphBindings = {}; // { logicalKey: [{ mesh, index, direction }] }
    this.availableMorphs = []; // noms des morph targets présents dans le GLB
    this.profile = null;
    this.model = null;
    this.baseScale = 1;
    this.modelHeight = 1;
    this.animationFrame = null;
    this.handleWindowResize = null;

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(35, 1, 0.05, 100);
    this.camera.position.set(0, 1.05, 3.4);

    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.renderer.domElement.setAttribute('aria-hidden', 'true');
    this.container.appendChild(this.renderer.domElement);

    this.setupLights();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.target.set(0, 0.95, 0);
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.minDistance = 1.6;
    this.controls.maxDistance = 6;
    this.controls.minPolarAngle = Math.PI * 0.15;
    this.controls.maxPolarAngle = Math.PI * 0.62;
    this.controls.update();

    this.character = new THREE.Group();
    this.outfitGroup = new THREE.Group();
    this.scene.add(this.character);
    this.character.add(this.outfitGroup);

    this.observeResize();
    this.resize();
    this.startLoop();
  }

  setupLights() {
    this.scene.add(new THREE.HemisphereLight(0xffffff, 0x9a958f, 1.1));
    this.scene.add(new THREE.AmbientLight(0xffffff, 0.35));

    const key = new THREE.DirectionalLight(0xffffff, 2.1);
    key.position.set(2.4, 3.2, 2.6);
    this.scene.add(key);

    const fill = new THREE.DirectionalLight(0xfff2e2, 0.8);
    fill.position.set(-2.6, 1.8, 1.4);
    this.scene.add(fill);

    const rim = new THREE.DirectionalLight(0xdfe8ff, 0.9);
    rim.position.set(0, 2.4, -3);
    this.scene.add(rim);
  }

  async load(modelUrl = AVATAR_CONFIG.modelUrl, signal) {
    const loader = new GLTFLoader();
    let gltf;

    if (typeof DecompressionStream !== 'undefined') {
      const response = await fetch(`${modelUrl}.gz`, { signal });
      if (response.status === 404) {
        gltf = await loader.loadAsync(modelUrl);
      } else {
        if (!response.ok) {
          throw new Error(`Chargement du modèle avatar impossible (${response.status}).`);
        }

        let data = await response.arrayBuffer();
        const header = new Uint8Array(data, 0, 4);
        if (header[0] === 0x1f && header[1] === 0x8b) {
          const stream = new Blob([data]).stream().pipeThrough(new DecompressionStream('gzip'));
          data = await new Response(stream).arrayBuffer();
        }

        const glbHeader = new Uint8Array(data, 0, 4);
        if (glbHeader[0] !== 0x67 || glbHeader[1] !== 0x6c || glbHeader[2] !== 0x54 || glbHeader[3] !== 0x46) {
          throw new Error('Le fichier avatar reçu n’est pas un modèle GLB valide.');
        }

        if (signal?.aborted) throw signal.reason;
        const basePath = new URL('.', new URL(modelUrl, window.location.href)).href;
        gltf = await loader.parseAsync(data, basePath);
      }
    } else {
      gltf = await loader.loadAsync(modelUrl);
    }

    if (signal?.aborted) throw signal.reason;
    const model = gltf.scene;

    model.traverse((node) => {
      if (node.isMesh) {
        node.frustumCulled = false;
      }
    });

    // Aligner les pieds sur le sol puis normaliser à la taille de référence.
    const box = new THREE.Box3().setFromObject(model);
    const modelHeight = Math.max(box.max.y - box.min.y, 0.001);
    this.modelHeight = modelHeight;
    model.position.y -= box.min.y;

    this.baseScale = (AVATAR_CONFIG.referenceHeightCm / 100) / modelHeight;
    this.character.add(model);
    this.character.scale.set(this.baseScale, this.baseScale, this.baseScale);

    // Recense les morph targets présents dans le GLB, par nom brut.
    const rawBindings = {};
    model.traverse((node) => {
      if (node.isMesh && node.morphTargetDictionary) {
        Object.entries(node.morphTargetDictionary).forEach(([name, index]) => {
          if (!rawBindings[name]) rawBindings[name] = [];
          rawBindings[name].push({ mesh: node, index });
        });
      }
    });

    // Associe chaque clé logique de la config au morph target réel du modèle.
    this.morphBindings = {};
    Object.entries(AVATAR_CONFIG.morphTargets).forEach(([key, config]) => {
      const raw = rawBindings[config.model || key];
      if (raw) {
        this.morphBindings[key] = raw.map((binding) => ({ ...binding, direction: config.direction ?? 1 }));
      }
    });

    this.availableMorphs = Object.keys(rawBindings);
    if (this.availableMorphs.length && !Object.keys(this.morphBindings).length) {
      console.warn('[AvatarEngine] Aucun morph target apparié. Noms trouvés:', this.availableMorphs);
    }

    this.model = model;
    if (this.profile) this.setBodyProfile(this.profile);

    return { availableMorphs: this.availableMorphs, boundMorphs: Object.keys(this.morphBindings) };
  }

  setOutfit(items = []) {
    while (this.outfitGroup.children.length) {
      const mesh = this.outfitGroup.children.pop();
      mesh.geometry?.dispose?.();
      mesh.material?.dispose?.();
    }

    // Aperçu volumétrique temporaire, affiché tant qu'une pièce n'a pas encore
    // de mesh skinné validé dans le pipeline d'assets.
    const height = this.modelHeight;
    items.forEach((item) => {
      const garment = AVATAR_GARMENTS[item.product.id];
      if (!garment) return;
      const material = new THREE.MeshStandardMaterial({ color: garment.fallbackColor, roughness: 0.78, metalness: 0.02, side: THREE.DoubleSide });
      if (garment.category === 'bas') {
        [-0.105, 0.105].forEach((x) => {
          const mesh = new THREE.Mesh(new THREE.CylinderGeometry(height * 0.105, height * 0.12, height * 0.38, 20, 1, true), material.clone());
          mesh.position.set(x * height, height * 0.3, 0);
          this.outfitGroup.add(mesh);
        });
        return;
      }
      const isJacket = garment.category === 'veste';
      const mesh = new THREE.Mesh(
        new THREE.CylinderGeometry(height * (isJacket ? 0.23 : 0.19), height * (isJacket ? 0.26 : 0.22), height * (isJacket ? 0.42 : 0.34), 24, 1, true),
        material,
      );
      mesh.position.set(0, height * 0.62, 0);
      this.outfitGroup.add(mesh);
    });
  }

  setAppearance({ skinTone } = {}) {
    if (!this.model || !skinTone) return;
    this.model.traverse((node) => {
      if (!node.isMesh) return;
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (material?.color) material.color.set(skinTone);
      });
    });
  }

  resetView() {
    this.camera.position.set(0, 1.05, 3.4);
    this.controls.target.set(0, 0.95, 0);
    this.controls.update();
  }

  setBodyProfile(profile) {
    this.profile = profile;
    if (!profile) return;

    const { morphs = {}, scales = {} } = profile;

    Object.entries(morphs).forEach(([key, value]) => {
      const bindings = this.morphBindings[key];
      if (!bindings) return;
      const raw = clamp(Number(value) || 0, 0, 1);
      bindings.forEach(({ mesh, index, direction }) => {
        if (!mesh.morphTargetInfluences) return;
        mesh.morphTargetInfluences[index] = direction < 0 ? 1 - raw : raw;
      });
    });

    const heightScale = clamp(Number(scales.height) || 1, 0.8, 1.25);
    this.character.scale.set(this.baseScale, this.baseScale * heightScale, this.baseScale);
  }

  resize() {
    const width = this.container.clientWidth || 1;
    const height = this.container.clientHeight || 1;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height, false);
  }

  observeResize() {
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => this.resize());
      this.resizeObserver.observe(this.container);
    } else {
      this.handleWindowResize = () => this.resize();
      window.addEventListener('resize', this.handleWindowResize);
    }
  }

  startLoop() {
    const tick = () => {
      this.animationFrame = requestAnimationFrame(tick);
      this.controls.update();
      this.renderer.render(this.scene, this.camera);
    };
    tick();
  }

  dispose() {
    if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
    this.animationFrame = null;

    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.handleWindowResize) window.removeEventListener('resize', this.handleWindowResize);
    if (this.controls) this.controls.dispose();

    this.scene.traverse((node) => {
      if (!node.isMesh) return;
      node.geometry?.dispose?.();
      const materials = Array.isArray(node.material) ? node.material : [node.material];
      materials.forEach((material) => {
        if (!material) return;
        Object.values(material).forEach((value) => {
          if (value && value.isTexture) value.dispose();
        });
        material.dispose?.();
      });
    });

    this.renderer?.dispose?.();
    if (this.renderer?.domElement?.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }

    this.morphBindings = {};
    this.availableMorphs = [];
    this.setOutfit([]);
    this.model = null;
  }
}
