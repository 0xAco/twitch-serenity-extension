'use strict';
console.log('background up');

chrome.runtime.onMessage.addListener( message => {
  if (message.isActivated !== undefined) {

    console.log('new value: ', message.isActivated);
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      const tabId = tabs[0].id;
      const injectedStyle = 'src/injected.css';
      
      if (message.isActivated)
        chrome.scripting.insertCSS({ 
          target: { tabId },
          css: injectedStyle
        });
      else
        chrome.scripting.removeCSS({ 
          target: { tabId },
          css: injectedStyle
        });
    })
  }
})