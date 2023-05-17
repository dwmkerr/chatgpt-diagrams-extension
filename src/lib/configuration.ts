export enum DisplayMode {
  BelowDiagram,
  AsTabs,
}

export class Configuration {
  displayMode: DisplayMode;

  constructor(displayMode: DisplayMode) {
    this.displayMode = displayMode;
  }
}
