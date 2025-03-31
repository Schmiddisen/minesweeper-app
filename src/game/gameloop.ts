export class GameLoop {
  private animationFrame: number | null = null;
  private lastTime: number = 0;
  private updateCallback: (deltaTime: number) => void;

  constructor(updateCallback: (deltaTime: number) => void) {
    this.updateCallback = updateCallback;
  }

  public start() {
    this.lastTime = performance.now();
    this.loop();
  }

  private loop = () => {
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    // Aktualisiere den Spielstatus, Animationen oder Timer
    this.updateCallback(deltaTime);
    this.animationFrame = requestAnimationFrame(this.loop);
  };


  public stop() {
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }
}
