'use strict';

console.log('[Serenity] background up');

const cssPath = 'src/injected.css';

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

// retrieve an info from background.js
async function askBackground(info) {
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
  
  // remove css before re-injecting to
  // fix a bug when reloading the page
  if (newState === true) {
    await chrome.tabs.query(queryOptions, tabs => {
      for(const tab of tabs) {
        const cssInfos = {
          target: { tabId: tab.id, allFrames: true },
          files: [cssPath],
        };
        chrome.scripting.removeCSS(cssInfos);
      }
    });
  }

  try {
    await chrome.tabs.query(queryOptions, tabs => {
      for(const tab of tabs) {
        const cssInfos = {
          target: { tabId: tab.id, allFrames: true },
          files: [cssPath],
        };

        if (newState) chrome.scripting.insertCSS(cssInfos);
        else chrome.scripting.removeCSS(cssInfos);
      }

      setIsInjected(newState);
      return true;
    });
  } catch(e) {
    console.warn(e);
    return false;
  }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // check if we got permission
    const regex = /https:\/\/www\..*twitch\.tv(\/.*)?$/gm;
    if (!tab.url.match(regex)) return;

    // init style injection if needed
    isStyleInjected()
      .then(initIsInjected => injectCSS(initIsInjected));
  }
});

// handle messages
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // used to get an info from the background
  if (request.hasOwnProperty('getInfo'))
    askBackground(request.getInfo).then(sendResponse);

  // notifies the background that the slider's value has changed
  if (request.hasOwnProperty('sliderUpdate'))
    injectCSS(request.sliderUpdate).then(sendResponse);

  return true; // allows for async calls
});

// handle keyboard shortcuts
chrome.commands.onCommand.addListener((command) => {
  switch (command) {
    case 'toggle':
      isStyleInjected()
        .then(toggleInjected => injectCSS(!toggleInjected));
      break;
  }
});