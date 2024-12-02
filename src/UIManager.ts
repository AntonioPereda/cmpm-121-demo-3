export class UIManager {
    private moveHandlers: { [key: string]: () => void } = {};
    private buttons: { [key: string]: HTMLElement } = {};
    private onGeolocationToggle: () => void;
  
    constructor(onGeolocationToggle: () => void) {
      this.onGeolocationToggle = onGeolocationToggle;
  
      // Cache buttons
      this.buttons = {
        up: document.getElementById("up")!,
        down: document.getElementById("down")!,
        left: document.getElementById("left")!,
        right: document.getElementById("right")!,
        sensor: document.getElementById("sensor")!
      };
    }
  
    setMovementHandlers(handlers: { up: () => void; down: () => void; left: () => void; right: () => void }) {
      this.moveHandlers = handlers;
      this.bindMovementEvents();
    }
  
    private bindMovementEvents(): void {
      this.buttons["up"].onclick = this.moveHandlers["up"];
      this.buttons["down"].onclick = this.moveHandlers["down"];
      this.buttons["left"].onclick = this.moveHandlers["left"];
      this.buttons["right"].onclick = this.moveHandlers["right"];
    }
  
    bindGeolocationToggle(): void {
      this.buttons["sensor"].onclick = this.onGeolocationToggle;
    }
  }