'use strict';
console.log('background up');

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
    const cssurl = response.url.slice(52); // 52 first caracters is the chrome-extension/[id] prefix

    if (cssurl === injectedStyle) setIsInjected(true);
    return isInjected;
  } catch {
    console.error('not found: ', injectedStyle);
    setIsInjected(false);
    return isInjected;
  }
}

// retrieve an info from background.js
function retrieveInfo(info) {
  let res = null;
  switch (info) {
    case 'injectionStatus':
      res = isInjected;
      break;
  }
  return res;
}

// inject or remove CSS from the site
function handleCSS(checked) {
  chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
    const tabId = tabs[0].id;

    if (checked) {
      chrome.scripting.insertCSS({
        target: { tabId },
        files: [injectedStyle]
      });
    } else {
      chrome.scripting.removeCSS({
        target: { tabId },
        files: [injectedStyle]
      });
    }

    setIsInjected(checked);
  })
}

// inject css when loaded
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === "complete") {
    chrome.scripting.insertCSS({
      target: { tabId },
      files: [injectedStyle]
    });
    isStyleInjected();
  }
});

// handle messages
chrome.runtime.onMessage.addListener(message => {
  if (message.hasOwnProperty('requestInfo')) return retrieveInfo(message.requestInfo);
  if (message.hasOwnProperty('activate')) return handleCSS(message.activate);
});