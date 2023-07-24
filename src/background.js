'use strict';
console.log('background up');

let isInjected;
const injectedStyle = 'src/injected.css';

// check if style is injected
async function isStyleInjected() {
  try {
    const response = await fetch(chrome.runtime.getURL(injectedStyle));
    const cssurl = response.url.slice(52);
    // 52 first caracters is the chrome-extension/[id] prefix
    if (cssurl === injectedStyle) return true;
  } catch {
    console.error('not found: ', injectedStyle);
    return false;
  }
}

// retrieve an info from background.js
function retrieveInfo(info) {
  console.log('requestedInfo: ', info);
  let res;
  switch (info) {
    case 'injectionStatus':
      res = isInjected;
      break;
    default:
      res = null;
      break;
  }
  console.log('value: ', res);
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

    isInjected = checked;
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
  console.log(message);
  if (message.hasOwnProperty('requestInfo')) return retrieveInfo(message.requestInfo);
  if (message.hasOwnProperty('activate')) return handleCSS(message.activate);
});