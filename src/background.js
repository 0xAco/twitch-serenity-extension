'use strict';

console.log('[Serenity] background up');

let isInjected = true;
const injectedStyle = 'src/injected.css';

// sets a new value for isInjected
function setIsInjected(value) {
  isInjected = value;
  if (isInjected) {
    chrome.action.setBadgeBackgroundColor({ color: '#6441a5' })
    chrome.action.setBadgeText({ text: 'on' });
  } else {
    chrome.action.setBadgeText({ text: '' });
  }
}

// check if style is injected
async function isStyleInjected() {
  try {
    const response = await fetch(chrome.runtime.getURL(injectedStyle));
    if (response.url.endsWith(injectCSS)) setIsInjected(true);
    return isInjected;
  } catch {
    console.error('not found: ', injectedStyle);
    setIsInjected(false);
    return isInjected;
  }
}

// retrieve an info from background.js
function askBackground(info) {
  let res = null;
  switch (info) {
    case 'injectionStatus':
      res = isInjected;
      break;
  }
  return res;
}

// inject or remove CSS from the site
async function injectCSS(state) {
  const queryOptions = { url: 'https://*.twitch.tv/*'};
  try {
    await chrome.tabs.query(queryOptions, tabs => {

      for(const tab of tabs) {
        const cssInfos = {
          target: { tabId: tab.id, allFrames: true },
          files: [injectedStyle],
        }

        if (state) chrome.scripting.insertCSS(cssInfos);
        else chrome.scripting.removeCSS(cssInfos);
      }

      setIsInjected(state);
    });
  } catch(e) {
    console.warn(e);
  }
}

// inject css when loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    // check if we got permission
    const regex = /https:\/\/www\..*twitch\.tv(\/.*)?$/gm;
    if (!tab.url.match(regex)) return;

    chrome.scripting.insertCSS({
      target: { tabId, allFrames: true },
      files: [injectedStyle]
    }).then(isStyleInjected());
   }
});

// handle messages
chrome.runtime.onMessage.addListener(message => {
  if (message.hasOwnProperty('requestInfo')) return askBackground(message.requestInfo);
  if (message.hasOwnProperty('activate')) return injectCSS(message.activate);
});