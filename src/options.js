import { DisplayMode, Configuration } from './lib/configuration';
import { Extension } from './lib/extension';

// Saves options to chrome.storage
const saveOptions = async () => {
  //  Create a new configuration object, then populate it from the html.
  const displayMode = document.getElementById('display_mode').value;
  const likesColor = document.getElementById('like').checked;
  console.log(`UI State: Display Mode - ${displayMode}, Likes Color - ${likesColor}`);
  const configuration = new Configuration(displayMode);

  await Extension.setConfiguration(configuration);

  // Update status to let user know options were saved.
  const status = document.getElementById('status');
  status.textContent = 'Options saved.';
  setTimeout(() => {
    status.textContent = '';
  }, 750);
};

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
const restoreOptions = async () => {
  console.log('test version 1');
  const options = await Extension.getConfiguration();

  //  Check what we get from Chrome, update the UI.
  console.log(`Loaded options from storge: ${JSON.stringify(options, null, 2)}`);
  document.getElementById('display_mode').value = options.displayMode;
  document.getElementById('like').checked = options.likesColor;
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.getElementById('save').addEventListener('click', saveOptions);
