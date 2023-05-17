import { DisplayMode, Configuration } from './configuration';

export abstract class Extension {
  public static async getConfiguration(): Promise<Configuration> {
    const options = await chrome.storage.sync.get(
      { displayMode: DisplayMode.BelowDiagram, likesColor: true },
    );

    //  Set the options.
    const config = new Configuration(options.displayMode);

    return config;
  }

  public static async setConfiguration(configuration: Configuration): Promise<void> {
    return await chrome.storage.sync.set(configuration);
  }
}
