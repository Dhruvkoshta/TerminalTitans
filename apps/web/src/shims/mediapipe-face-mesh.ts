// Proxy shim for @mediapipe/face_mesh that loads the real browser build
// and forwards calls to it. This satisfies bundlers expecting ESM exports
// while still using the official Mediapipe implementation via CDN.

export type ResultsListener = (results: any) => void | Promise<void>;

export interface FaceMeshConfig {
  locateFile?: (path: string, prefix?: string) => string;
}

export interface Options {
  selfieMode?: boolean;
  maxNumFaces?: number;
  refineLandmarks?: boolean;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
  enableFaceGeometry?: boolean;
  cameraNear?: number;
  cameraFar?: number;
  cameraVerticalFovDegrees?: number;
}

function loadScriptOnce(src: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  // Reuse if already present
  // @ts-ignore
  if ((window as any).__mp_loaded__?.[src]) return Promise.resolve();

  return new Promise<void>((resolve, reject) => {
    const d = document;
    // @ts-ignore
    const reg = ((window as any).__mp_loaded__ = (window as any).__mp_loaded__ || {});
    const existing = Array.from(d.getElementsByTagName("script")).find(s => s.src === src);
    if (existing) {
      reg[src] = true;
      resolve();
      return;
    }
    const s = d.createElement("script");
    s.src = src;
    s.async = true;
    s.crossOrigin = "anonymous";
    s.onload = () => { reg[src] = true; resolve(); };
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    d.head.appendChild(s);
  });
}

export class FaceMesh {
  private config?: FaceMeshConfig;
  private real: any | null = null;
  private pendingOptions: Options | null = null;
  private pendingListener: ResultsListener | null = null;

  constructor(config?: FaceMeshConfig) {
    this.config = config;
  }

  private async ensureReal(): Promise<any> {
    if (this.real) return this.real;
    if (typeof window === "undefined") throw new Error("FaceMesh is browser-only");

    const defaultCdn = "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh";
    const locate = this.config?.locateFile;
    const scriptUrl = locate ? locate("face_mesh.js", defaultCdn) : `${defaultCdn}/face_mesh.js`;

    await loadScriptOnce(scriptUrl);
    const RealCtor = (window as any).FaceMesh;
    if (!RealCtor) throw new Error("Mediapipe FaceMesh global not found after loading script");

    const real = new RealCtor(this.config);
    if (this.pendingListener) real.onResults(this.pendingListener);
    if (this.pendingOptions) real.setOptions(this.pendingOptions);
    this.real = real;
    return real;
  }

  async initialize(): Promise<void> {
    const real = await this.ensureReal();
    await real.initialize();
  }

  async send(inputs: any): Promise<void> {
    const real = await this.ensureReal();
    await real.send(inputs);
  }

  onResults(listener: ResultsListener): void {
    this.pendingListener = listener;
    if (this.real) this.real.onResults(listener);
  }

  setOptions(options: Options): void {
    this.pendingOptions = { ...(this.pendingOptions || {}), ...(options || {}) };
    if (this.real) this.real.setOptions(this.pendingOptions);
  }

  reset(): void {
    if (this.real?.reset) this.real.reset();
  }

  close(): Promise<void> | void {
    if (this.real?.close) return this.real.close();
  }
}

export default FaceMesh;
