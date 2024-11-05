/* SERVICE WORKER - main event handler */
const CSS_PATH = 'src/injection.css';

console.log('[Serenity] service-worker up');

async function getCurrentTab() {
  const queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function messageToCS(tabId, payload) {
  if (!payload.hasOwnProperty('action')) {
    console.warn('[SW] trying to pass a message to service-worker without providing an "action" property: ', payload);
    return;
  }
  console.log('[SW] send message to tab ', tabId, ':', payload);
  try {
    const response = await chrome.tabs.sendMessage(tabId, payload);
    console.log(response);
    return response;
  } catch(err) { console.warn('[SW] CS unreachable', err) }
}

// sets a new value for isInjected
function setIsInjected(newValue) {
  // store new value in local storage
  chrome.storage.local.set({ isInjected: newValue })
    .then('[storage] isInjected', newValue)
    .catch(() => console.warn('storage unreachable'));
  
  // update extension badge
  if (newValue) {
    chrome.action.setBadgeBackgroundColor({ color: '#6441a5' })
    chrome.action.setBadgeText({ text: 'on' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// check if style is injected
async function isStyleInjected() {
  try {
    const { isInjected } = await chrome.storage.local.get('isInjected');
    return await isInjected;
  } catch {
    console.warn('local storage empty');
    setIsInjected(false);
    return false;
  }
}

// retrieve an info from the service worker
async function getInfo(info) {
  let res = null;
  switch (info) {
    case 'isInjected':
      res = await isStyleInjected();
      break;
  }
  return res;
}

// inject or remove CSS from the site
async function injectCSS(newState) {
  const queryOptions = { url: 'https://*.twitch.tv/*'};

  try {
    await chrome.tabs.query(queryOptions, tabs => {
      for(const tab of tabs) {
        const cssInfos = {
          target: { tabId: tab.id, allFrames: true },
          files: [CSS_PATH],
        };
        
        if (newState) {
          // remove css before re-injecting to
          // fix a bug when reloading the page
          chrome.scripting.removeCSS(cssInfos);
          chrome.scripting.insertCSS(cssInfos);
        } else chrome.scripting.removeCSS(cssInfos);
      }

      setIsInjected(newState);
      return true;
    });
  } catch(err) {
    console.warn(err);
    return false;
  }
}

chrome.scripting.registerContentScripts([{
  id: "session-script",
  js: ["src/content-script.js"],
  matches: ["https://*.twitch.tv/*"],
  runAt: "document_end",
}])
  .then(() => console.log("[SW] CS registered"))
  .catch((err) => console.warn("registration error", err));

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // check if we got permission
    const regex = /https:\/\/www\..*twitch\.tv(\/.*)?$/gm;
    if (!tab.url.match(regex)) return;

    // init style injection if needed
    isStyleInjected()
      .then(initIsInjected => injectCSS(initIsInjected));

    // start observing for DOM changes
    messageToCS(tabId, { action: 'startObserver', data: 'chat' });
  }
});

// handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getInfo') getInfo(request.data).then(sendResponse);
  if (request.action === 'sliderUpdated') injectCSS(request.data);

  return true; // allows for async calls
});

// handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  console.log('command called: ', command);
  switch (command) {
    case 'toggle':
      isStyleInjected()
        .then(toggleInjected => injectCSS(!toggleInjected));
      break;
  }
});