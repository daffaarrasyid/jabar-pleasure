import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export interface CarMarkerInstance {
  readonly domElement: HTMLDivElement;
  setScale(scale: number): void;
  spawnFromBelow(onComplete?: () => void): void;
  update(bearing: number, deltaSeconds: number, isMoving: boolean): void;
  dispose(): void;
}

/**
 * GlbCarMarker: High-fidelity 3D car loaded from external .glb model
 * (Low_poly_car.glb) with TravelBoast aesthetics, custom studio lighting,
 * asphalt contact shadow, pure longitudinal corner banking roll, and micro-suspension bounce.
 */
export class GlbCarMarker implements CarMarkerInstance {
  public readonly domElement: HTMLDivElement;
  private innerContainer: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private rootGroup: THREE.Group;
  private rollGroup: THREE.Group;
  private suspensionGroup: THREE.Group;
  private modelWrapper: THREE.Group;
  private wheels: THREE.Object3D[] = [];
  private currentRoll: number = 0;
  private lastBearing: number = 0;
  private animTime: number = 0;
  private isDisposed: boolean = false;
  public isLoaded: boolean = false;

  constructor(size: number = 92, modelUrl: string = '/models/low_poly_car.glb') {
    // 1. Container DOM Element for MapLibre Marker (Positioned exclusively by MapLibre)
    this.domElement = document.createElement('div');
    this.domElement.className = 'timelapse-glb-car-marker';
    this.domElement.style.width = `${size}px`;
    this.domElement.style.height = `${size}px`;
    this.domElement.style.position = 'relative';
    this.domElement.style.display = 'flex';
    this.domElement.style.alignItems = 'center';
    this.domElement.style.justifyContent = 'center';
    this.domElement.style.pointerEvents = 'none';

    // 2. Inner Visual Container (Holds transforms, scale, opacity without overwriting MapLibre's matrix)
    this.innerContainer = document.createElement('div');
    this.innerContainer.style.width = '100%';
    this.innerContainer.style.height = '100%';
    this.innerContainer.style.display = 'flex';
    this.innerContainer.style.alignItems = 'center';
    this.innerContainer.style.justifyContent = 'center';
    this.innerContainer.style.transformOrigin = 'center center';
    this.innerContainer.style.willChange = 'transform, opacity';
    this.innerContainer.style.filter = 'drop-shadow(0 14px 26px rgba(0,0,0,0.55))';
    this.domElement.appendChild(this.innerContainer);

    // 3. High-DPI Canvas for crisp rendering inside innerContainer
    this.canvas = document.createElement('canvas');
    const pixelRatio = Math.min(2.5, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    this.canvas.width = Math.round(size * pixelRatio);
    this.canvas.height = Math.round(size * pixelRatio);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.innerContainer.appendChild(this.canvas);

    // 3. Three.js Scene, Camera & Renderer
    this.scene = new THREE.Scene();

    // Third-person elevated chase perspective (camera behind car looking forward along -Z)
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    this.camera.position.set(0, 3.2, 5.8);
    this.camera.lookAt(0, 0.65, -0.4);

    try {
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(this.canvas.width, this.canvas.height, false);
      this.renderer.setPixelRatio(pixelRatio);
      this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
      this.renderer.toneMappingExposure = 1.35;
    } catch (e) {
      console.warn('WebGL initialization for GLB car marker failed:', e);
    }

    // 4. Studio Lighting Rig
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(4, 8, 5);
    this.scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x60ce9f, 0.9);
    rimLight.position.set(-4, 4, -4);
    this.scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.7);
    fillLight.position.set(-3, 2, 4);
    this.scene.add(fillLight);

    // 5. Hierarchy for Proper Longitudinal Roll & Micro-Suspension
    // rootGroup -> rollGroup (pure Z-axis roll along forward vector) -> suspensionGroup (Y bounce & spawn) -> modelWrapper (Y -90 deg align)
    this.rootGroup = new THREE.Group();
    this.rollGroup = new THREE.Group();
    this.suspensionGroup = new THREE.Group();
    this.modelWrapper = new THREE.Group();

    this.suspensionGroup.add(this.modelWrapper);
    this.rollGroup.add(this.suspensionGroup);
    this.rootGroup.add(this.rollGroup);
    this.scene.add(this.rootGroup);

    // 6. Soft Ground Contact Shadow (Radial Gradient)
    const shadowGeo = new THREE.PlaneGeometry(2.4, 4.4);
    shadowGeo.rotateX(-Math.PI / 2);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 64, 12, 32, 64, 32);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.75)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.3)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 128);
    }
    const shadowTexture = new THREE.CanvasTexture(shadowCanvas);
    const shadowMat = new THREE.MeshBasicMaterial({
      map: shadowTexture,
      transparent: true,
      depthWrite: false,
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.position.set(0, 0.02, 0);
    this.rootGroup.add(shadowMesh);

    // 7. Load GLB Model
    this.loadGlbModel(modelUrl);

    // Initial render
    this.render();
  }

  private loadGlbModel(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.load(
      modelUrl,
      (gltf) => {
        if (this.isDisposed) return;

        const model = gltf.scene;

        // Compute original bounding box
        const box = new THREE.Box3().setFromObject(model);
        const center = new THREE.Vector3();
        box.getCenter(center);

        // Center model geometry so bottom sits flat at y = 0
        model.position.x = -center.x;
        model.position.y = -box.min.y;
        model.position.z = -center.z;

        // Detect wheel nodes for spin animation and style materials with JabarPleasure theme
        model.traverse((o) => {
          if (
            o.name &&
            (o.name === 'Cylinder001' ||
              o.name === 'Cylinder002' ||
              o.name === 'Cylinder004' ||
              o.name === 'Cylinder000' ||
              o.name === 'Cylinder005')
          ) {
            this.wheels.push(o);
          }

          if ((o as THREE.Mesh).isMesh) {
            const mesh = o as THREE.Mesh;
            mesh.castShadow = true;
            mesh.receiveShadow = true;

            // Enhance materials for modern vibrant lighting
            if (mesh.material) {
              const mats = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
              mats.forEach((m) => {
                if (m instanceof THREE.MeshStandardMaterial) {
                  // Style main red body paint into JabarPleasure Primary Blue (#4941EC)
                  if (m.name === 'Material' || mesh.name.startsWith('Cube_1')) {
                    m.color.set(0x4941ec);
                    m.metalness = 0.72;
                    m.roughness = 0.22;
                  }
                  // Style window glass into sleek cyan
                  if (m.name.includes('ОКНО') || mesh.name.startsWith('Cube_2')) {
                    m.color.set(0x67e8f9);
                    m.metalness = 0.9;
                    m.roughness = 0.08;
                  }
                  // Style headlights with luminous emissive glow
                  if (m.name.includes('Material.007') || mesh.name.startsWith('Cube_3')) {
                    m.emissive = new THREE.Color(0xfef08a);
                    m.emissiveIntensity = 2.4;
                  }
                }
              });
            }
          }
        });

        // The GLB has front along -X. Rotate child modelWrapper by -90 deg (-Math.PI/2) around Y so front points to -Z (forward)
        this.modelWrapper.rotation.y = -Math.PI / 2;
        const targetScale = 0.58;
        this.modelWrapper.scale.set(targetScale, targetScale, targetScale);

        this.modelWrapper.add(model);
        this.isLoaded = true;
        this.render();
      },
      undefined,
      (err) => {
        console.warn('Failed loading GLB car model:', err);
      }
    );
  }

  /**
   * Spawn animation: car emerges and rises smoothly from beneath the departure point ground
   */
  public spawnFromBelow(onComplete?: () => void): void {
    if (this.isDisposed) return;

    this.innerContainer.style.opacity = '0';
    this.innerContainer.style.transform = 'translateY(35px) scale(0.2)';
    this.suspensionGroup.position.y = -2.4;

    const startTime = performance.now();
    const duration = 750; // ms

    const animateSpawn = (now: number) => {
      if (this.isDisposed) return;
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);

      // Cubic ease-out with soft suspension overshoot bounce
      const eased = 1 - Math.pow(1 - p, 3);
      const bounce = Math.sin(p * Math.PI) * 0.16;

      this.suspensionGroup.position.y = -2.4 * (1 - eased) + bounce;
      this.innerContainer.style.transform = `translateY(${(1 - eased) * 35}px) scale(${0.2 + 0.8 * eased})`;
      this.innerContainer.style.opacity = `${Math.min(1, p * 3)}`;

      this.render();

      if (p < 1) {
        requestAnimationFrame(animateSpawn);
      } else {
        this.suspensionGroup.position.y = 0;
        this.innerContainer.style.transform = 'scale(1)';
        this.innerContainer.style.opacity = '1';
        this.render();
        onComplete?.();
      }
    };

    requestAnimationFrame(animateSpawn);
  }

  /**
   * Update 3D car corner banking, road vibration and wheel spin
   */
  public update(bearing: number, deltaSeconds: number, isMoving: boolean): void {
    if (this.isDisposed || !this.renderer) return;

    this.animTime += deltaSeconds;

    // 1. Dynamic Pure Longitudinal Corner Banking (Roll along Z-axis)
    const bearingDiff = ((bearing - this.lastBearing + 540) % 360) - 180;
    this.lastBearing = bearing;

    // Turning right (bearingDiff > 0) -> roll right (negative Z rotation)
    // Turning left (bearingDiff < 0) -> roll left (positive Z rotation)
    const targetRoll = Math.max(-0.2, Math.min(0.2, -bearingDiff * 0.08));
    this.currentRoll += (targetRoll - this.currentRoll) * 0.18;
    this.rollGroup.rotation.z = this.currentRoll;

    // 2. Road Suspension Micro-Bounce & Wheel Spin
    if (isMoving) {
      this.suspensionGroup.position.y = Math.sin(this.animTime * 18) * 0.02;

      // Spin wheels
      const spinSpeed = deltaSeconds * 26;
      for (const wheel of this.wheels) {
        wheel.rotation.z += spinSpeed;
      }
    } else {
      this.suspensionGroup.position.y = 0;
    }

    this.render();
  }

  /**
   * Framer-style spring scale pop-in (0 -> 1) or pop-out (1 -> 0)
   */
  public setScale(scale: number): void {
    this.innerContainer.style.transform = `scale(${scale})`;
    this.innerContainer.style.opacity = scale === 0 ? '0' : '1';
    this.innerContainer.style.transition =
      scale === 0
        ? 'transform 0.15s ease-in, opacity 0.15s ease-in'
        : 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease-out';
  }

  private render(): void {
    if (this.renderer && !this.isDisposed) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  /**
   * Clean up WebGL resources
   */
  public dispose(): void {
    this.isDisposed = true;
    try {
      this.scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose();
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m) => m.dispose());
          } else {
            obj.material?.dispose();
          }
        }
      });

      if (this.renderer) {
        this.renderer.dispose();
        this.renderer.forceContextLoss();
        this.renderer = null;
      }

      if (this.domElement.parentNode) {
        this.domElement.parentNode.removeChild(this.domElement);
      }
    } catch (e) {
      console.warn('Error disposing GlbCarMarker:', e);
    }
  }
}
