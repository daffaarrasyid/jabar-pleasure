import * as THREE from 'three';
import { CarMarkerInstance } from './GlbCarMarker';

/**
 * ThreeCarMarker: High-fidelity 3D procedural sports car rendered via Three.js
 * for MapLibre GL 3D flyover timelapse replays.
 *
 * Features:
 * - True 3D volumetric sports coupe styled in JabarPleasure Primary Blue (#4941EC)
 * - Metallic gloss car paint with specular highlights and clearcoat reflections
 * - Aerodynamic cabin greenhouse with tinted glass and cyan sky specular reflections
 * - Glowing twin LED headlights (cyan-white) & full-width continuous red LED taillight
 * - 4 distinct 3D rotating alloy wheels with rubber tires and spoke rims
 * - Dynamic suspension banking on turns (rolls into corners like TravelBoast)
 * - Asphalt micro-vibration while moving for realistic road feel
 * - Ground contact shadow grounded to the road surface
 */
export class ThreeCarMarker implements CarMarkerInstance {
  public readonly domElement: HTMLDivElement;
  private innerContainer: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private carGroup: THREE.Group;
  private chassisMesh!: THREE.Group;
  private wheels: THREE.Mesh[] = [];
  private currentRoll: number = 0;
  private lastBearing: number = 0;
  private animTime: number = 0;
  private isDisposed: boolean = false;

  constructor(size: number = 88) {
    // 1. Container DOM element for MapLibre Marker (Positioned exclusively by MapLibre)
    this.domElement = document.createElement('div');
    this.domElement.className = 'timelapse-3d-car-marker';
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
    this.innerContainer.style.filter = 'drop-shadow(0 12px 24px rgba(0,0,0,0.55))';
    this.domElement.appendChild(this.innerContainer);

    // 3. High-DPI Canvas for crisp 3D rendering
    this.canvas = document.createElement('canvas');
    const pixelRatio = Math.min(2.5, typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1);
    this.canvas.width = Math.round(size * pixelRatio);
    this.canvas.height = Math.round(size * pixelRatio);
    this.canvas.style.width = `${size}px`;
    this.canvas.style.height = `${size}px`;
    this.innerContainer.appendChild(this.canvas);

    // 3. Three.js Scene, Camera & Renderer
    this.scene = new THREE.Scene();

    // Elevated 3D third-person chase camera (looks from behind-above along driving direction)
    this.camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    this.camera.position.set(0, -4.1, 2.5);
    this.camera.lookAt(0, 0.2, 0.45);

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
      this.renderer.toneMappingExposure = 1.25;
    } catch (e) {
      console.warn('WebGL initialization for 3D car marker failed:', e);
    }

    // 4. Studio Lighting System
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.1);
    this.scene.add(ambientLight);

    // Main key sunlight from top-right giving sleek reflections on car body
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(4, -3, 7);
    this.scene.add(sunLight);

    // Soft teal rim-light matching JabarPleasure (#60CE9F)
    const rimLight = new THREE.DirectionalLight(0x60ce9f, 0.8);
    rimLight.position.set(-4, 3, 4);
    this.scene.add(rimLight);

    // 5. Build 3D Car Model
    this.carGroup = new THREE.Group();
    this.buildCarModel();
    this.scene.add(this.carGroup);

    // Initial render
    this.render();
  }

  private buildCarModel(): void {
    this.chassisMesh = new THREE.Group();

    // --- High-Quality Materials ---
    // Primary Blue Metallic Car Paint (#4941EC)
    const bodyMaterial = new THREE.MeshStandardMaterial({
      color: 0x4941ec,
      metalness: 0.8,
      roughness: 0.18,
    });

    // Dark Carbon / Slate Trim
    const darkTrimMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.85,
      roughness: 0.25,
    });

    // Tinted Panoramic Glass with Sky Reflection
    const glassMaterial = new THREE.MeshStandardMaterial({
      color: 0x0a192f,
      metalness: 0.95,
      roughness: 0.05,
    });

    // Secondary Teal Accent (#60CE9F)
    const tealAccentMaterial = new THREE.MeshStandardMaterial({
      color: 0x60ce9f,
      metalness: 0.6,
      roughness: 0.3,
    });

    // Rubber Tires
    const tireMaterial = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.9,
    });

    // Chrome Alloy Rims
    const rimMaterial = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      metalness: 0.98,
      roughness: 0.12,
    });

    // Glowing Twin LED Headlights (White-Cyan)
    const headlightMaterial = new THREE.MeshStandardMaterial({
      color: 0xf0fdfa,
      emissive: 0x60ce9f,
      emissiveIntensity: 3.2,
    });

    // Glowing Neon Taillight Lightbar (Bright Red)
    const taillightMaterial = new THREE.MeshStandardMaterial({
      color: 0xff1744,
      emissive: 0xff1744,
      emissiveIntensity: 4.0,
    });

    // 1. Main Lower Chassis (Aerodynamic Coupe Body)
    const chassisGeo = new THREE.BoxGeometry(1.35, 2.7, 0.38);
    const chassis = new THREE.Mesh(chassisGeo, bodyMaterial);
    chassis.position.z = 0.34;
    this.chassisMesh.add(chassis);

    // Front Bumper Splitter & Lower Grille
    const frontSplitterGeo = new THREE.BoxGeometry(1.36, 0.4, 0.15);
    const frontSplitter = new THREE.Mesh(frontSplitterGeo, darkTrimMaterial);
    frontSplitter.position.set(0, 1.25, 0.2);
    this.chassisMesh.add(frontSplitter);

    // 2. Sloping Front Hood (Wedge)
    const hoodGeo = new THREE.BoxGeometry(1.28, 0.85, 0.25);
    const hood = new THREE.Mesh(hoodGeo, bodyMaterial);
    hood.position.set(0, 0.88, 0.32);
    hood.rotation.x = -0.14;
    this.chassisMesh.add(hood);

    // Hood Center Accent Stripe (Teal)
    const stripeGeo = new THREE.BoxGeometry(0.18, 0.8, 0.02);
    const stripe = new THREE.Mesh(stripeGeo, tealAccentMaterial);
    stripe.position.set(0, 0.86, 0.46);
    stripe.rotation.x = -0.14;
    this.chassisMesh.add(stripe);

    // 3. Cabin Greenhouse & Aerodynamic Windshield
    const cabinGeo = new THREE.BoxGeometry(1.1, 1.4, 0.46);
    const cabin = new THREE.Mesh(cabinGeo, glassMaterial);
    cabin.position.set(0, -0.14, 0.65);
    this.chassisMesh.add(cabin);

    // Slanted Front Windshield Glass
    const windshieldGeo = new THREE.BoxGeometry(1.05, 0.5, 0.04);
    const windshield = new THREE.Mesh(windshieldGeo, glassMaterial);
    windshield.position.set(0, 0.48, 0.62);
    windshield.rotation.x = -0.45;
    this.chassisMesh.add(windshield);

    // Cabin Roof Plate (Primary Blue)
    const roofGeo = new THREE.BoxGeometry(1.0, 1.05, 0.05);
    const roof = new THREE.Mesh(roofGeo, bodyMaterial);
    roof.position.set(0, -0.2, 0.89);
    this.chassisMesh.add(roof);

    // Dual Roof Rails (Dark Trim)
    [-0.42, 0.42].forEach((x) => {
      const railGeo = new THREE.BoxGeometry(0.04, 0.9, 0.06);
      const rail = new THREE.Mesh(railGeo, darkTrimMaterial);
      rail.position.set(x, -0.2, 0.93);
      this.chassisMesh.add(rail);
    });

    // 4. Rear Sport Aerodynamic Spoiler Wing
    const spoilerGeo = new THREE.BoxGeometry(1.36, 0.22, 0.06);
    const spoiler = new THREE.Mesh(spoilerGeo, darkTrimMaterial);
    spoiler.position.set(0, -1.28, 0.72);
    this.chassisMesh.add(spoiler);

    // Dual Upright Spoiler Struts
    [-0.42, 0.42].forEach((x) => {
      const strutGeo = new THREE.BoxGeometry(0.05, 0.08, 0.24);
      const strut = new THREE.Mesh(strutGeo, darkTrimMaterial);
      strut.position.set(x, -1.28, 0.56);
      this.chassisMesh.add(strut);
    });

    // 5. Glowing LED Projector Headlights (Front)
    [-0.48, 0.48].forEach((x) => {
      const hlGeo = new THREE.BoxGeometry(0.28, 0.08, 0.12);
      const hl = new THREE.Mesh(hlGeo, headlightMaterial);
      hl.position.set(x, 1.34, 0.32);
      this.chassisMesh.add(hl);
    });

    // 6. Glowing Full-Width LED Taillight Bar (Rear)
    const tlBarGeo = new THREE.BoxGeometry(1.24, 0.06, 0.08);
    const tlBar = new THREE.Mesh(tlBarGeo, taillightMaterial);
    tlBar.position.set(0, -1.35, 0.4);
    this.chassisMesh.add(tlBar);

    // 7. Side Mirrors
    [-0.64, 0.64].forEach((x) => {
      const mirrorGeo = new THREE.BoxGeometry(0.14, 0.1, 0.08);
      const mirror = new THREE.Mesh(mirrorGeo, bodyMaterial);
      mirror.position.set(x, 0.35, 0.62);
      this.chassisMesh.add(mirror);
    });

    // 8. 4 Rotating 3D Wheels with Chrome Multi-Spoke Rims
    const wheelPositions: [number, number][] = [
      [-0.72, 0.8],  // Front Left
      [0.72, 0.8],   // Front Right
      [-0.72, -0.8], // Rear Left
      [0.72, -0.8],  // Rear Right
    ];

    wheelPositions.forEach(([x, y]) => {
      const wheelHolder = new THREE.Group();
      wheelHolder.position.set(x, y, 0.22);

      // Rubber Tire Cylinder
      const tireGeo = new THREE.CylinderGeometry(0.25, 0.25, 0.2, 16);
      tireGeo.rotateZ(Math.PI / 2);
      const tire = new THREE.Mesh(tireGeo, tireMaterial);
      wheelHolder.add(tire);

      // Center Chrome Alloy Rim
      const rimGeo = new THREE.CylinderGeometry(0.15, 0.15, 0.21, 12);
      rimGeo.rotateZ(Math.PI / 2);
      const rim = new THREE.Mesh(rimGeo, rimMaterial);
      wheelHolder.add(rim);

      this.wheels.push(tire);
      this.chassisMesh.add(wheelHolder);
    });

    // 9. Soft Ground Contact Shadow (Radial Gradient)
    const shadowGeo = new THREE.PlaneGeometry(1.8, 3.4);
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 64;
    shadowCanvas.height = 128;
    const ctx = shadowCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(32, 64, 12, 32, 64, 32);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
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
    shadowMesh.position.set(0, 0, 0.02);
    this.carGroup.add(shadowMesh);

    this.carGroup.add(this.chassisMesh);
  }

  /**
   * Update 3D car corner banking, road vibration and wheel spin
   */
  public update(bearing: number, deltaSeconds: number, isMoving: boolean): void {
    if (this.isDisposed || !this.renderer) return;

    this.animTime += deltaSeconds;

    // 1. Dynamic Corner Banking (Roll into turn)
    const bearingDiff = ((bearing - this.lastBearing + 540) % 360) - 180;
    this.lastBearing = bearing;

    const targetRoll = Math.max(-0.25, Math.min(0.25, -bearingDiff * 0.1));
    this.currentRoll += (targetRoll - this.currentRoll) * 0.22;
    this.chassisMesh.rotation.y = this.currentRoll;

    // 2. Road Suspension Vibration & Wheel Spin when moving
    if (isMoving) {
      // Subtle micro-suspension bounce
      this.chassisMesh.position.z = Math.sin(this.animTime * 18) * 0.02;

      // Spin wheels
      const spinSpeed = deltaSeconds * 28;
      for (const wheel of this.wheels) {
        wheel.rotation.x += spinSpeed;
      }
    } else {
      this.chassisMesh.position.z = 0;
    }

    this.render();
  }

  /**
   * Spawn animation: car emerges and rises smoothly from beneath the departure point ground
   */
  public spawnFromBelow(onComplete?: () => void): void {
    if (this.isDisposed) return;

    this.innerContainer.style.opacity = '0';
    this.innerContainer.style.transform = 'translateY(35px) scale(0.2)';
    this.chassisMesh.position.z = -2.4;

    const startTime = performance.now();
    const duration = 750;

    const animateSpawn = (now: number) => {
      if (this.isDisposed) return;
      const elapsed = now - startTime;
      const p = Math.min(1, elapsed / duration);

      const eased = 1 - Math.pow(1 - p, 3);
      const bounce = Math.sin(p * Math.PI) * 0.16;

      this.chassisMesh.position.z = -2.4 * (1 - eased) + bounce;
      this.innerContainer.style.transform = `translateY(${(1 - eased) * 35}px) scale(${0.2 + 0.8 * eased})`;
      this.innerContainer.style.opacity = `${Math.min(1, p * 3)}`;

      this.render();

      if (p < 1) {
        requestAnimationFrame(animateSpawn);
      } else {
        this.chassisMesh.position.z = 0;
        this.innerContainer.style.transform = 'scale(1)';
        this.innerContainer.style.opacity = '1';
        this.render();
        onComplete?.();
      }
    };

    requestAnimationFrame(animateSpawn);
  }

  /**
   * Framer-style spring pop-in (0 -> 1) or pop-out (1 -> 0)
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
      console.warn('Error disposing ThreeCarMarker:', e);
    }
  }
}
