export enum DisplayMode {
  BelowDiagram = "BelowDiagram",
  AsTabs = "AsTabs",
}

export class Configuration {
  displayMode: DisplayMode;

  constructor(displayMode: DisplayMode) {
    this.displayMode = displayMode;
  }
}
