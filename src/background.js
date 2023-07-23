'use strict';
console.log('background up');

const injectedStyle = 'src/injected.css';

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.status === "complete") {
    chrome.scripting.insertCSS({
      target: { tabId: tabId },
      files: [injectedStyle]
    });
  }
});

chrome.runtime.onMessage.addListener(message => {
  if (message.isActivated !== undefined) {
    chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
      const tabId = tabs[0].id;

      if (message.isActivated) {
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
    })
  }
});