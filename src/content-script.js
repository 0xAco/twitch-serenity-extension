/* CONTENT SCRIPT - interact with the DOM */

async function onMutation(mutations, observer) {
  for (const mutation of mutations) {
    if (!mutation.type === 'childList') continue;
    for (const newNode of mutation.addedNodes)  {
      console.log('[CS] new node: ', newNode);
      const raidNode = newNode.querySelector('.seventv-raid-message-container');
      if (raidNode) {
        // call SW to know extension status
        const isInjected = await chrome.runtime.sendMessage({
          action: 'getInfo',
          data: 'isInjected'
        });
        const who = raidNode.querySelector('.bold');
        if (isInjected) raidNode.innerHTML = `
          <span class="--serenity-bold">${who.innerText}</span> just raided you!
        `;
      }
    }
  }
  
  // clear observer
  observer.takeRecords();
}

// function to start observing the chat container for new messages
async function startObserving(what) {
  const chatContainer = document.querySelector('#seventv-message-container > main');
  if (!chatContainer) {
    console.log('[CS] chat container not found');
    return false;
  }

  const observer = new MutationObserver(onMutation);
  observer.observe(chatContainer, { childList: true, subtree: true });

  return '[CS] observer up for ' + what;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('request received: ', request);
  if (request.action === 'startObserver')
    startObserving(request.data).then(sendResponse);
})