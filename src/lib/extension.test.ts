import { describe, expect, afterEach, jest, test } from "@jest/globals";
import { Extension } from "./extension";
import { DisplayMode } from "./configuration";

function chromeObject() {
  return {
    storage: {
      sync: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
  };
}

describe("extension", () => {
  describe("Extension.getConfiguration() ", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    test("correctly maps configuration from Chrome storage", async () => {
      //  Mock the chrome storage, note that it is key/value and not typed...
      const mockChrome = chromeObject();
      mockChrome.storage.sync.get.mockImplementation(() =>
        Promise.resolve({
          displayMode: "AsTabs",
        })
      );
      //  @ts-expect-error - TS knows the global 'window' doesn't have a 'chrome' object.
      global.chrome = mockChrome;

      //  Get the mapped config, note that it is typed.
      const config = await Extension.getConfiguration();
      expect(config.displayMode).toEqual(DisplayMode.AsTabs);
    });

    test("sets the correct defaults if there is no configuration in Chrome storage", async () => {
      //  Mock the chrome storage, note that it is empty...
      const mockChrome = chromeObject();
      mockChrome.storage.sync.get.mockImplementation((defaults) =>
        Promise.resolve(Object.assign({}, defaults))
      );
      //  @ts-expect-error - TS knows the global 'window' doesn't have a 'chrome' object.
      global.chrome = mockChrome;

      //  Get the mapped config, note that it is and the default values have been set.
      const config = await Extension.getConfiguration();
      expect(config.displayMode).toEqual(DisplayMode.BelowDiagram);
    });
  });
});
