/* CONTENT SCRIPT - interact with the DOM */

function handleRaidedMessage(raidNode) {
  const who = raidNode.querySelector('.bold');
  raidNode.innerHTML = chrome.i18n.getMessage('raided', who.innerText);
}

function handleRaidChatMessage(textElement) {
  const digits = /\d+/gm;
  textElement.innerText = textElement.innerText.replace(digits, 'π')
}

async function onMutation(mutations, observer) {
  // call SW to know extension status
  const isInjected = await chrome.runtime.sendMessage({
    action: 'getInfo',
    data: 'isInjected'
  });
  if (!isInjected) return;

  for (const mutation of mutations) {
    if (!mutation.type === 'childList') continue;
    for (const newNode of mutation.addedNodes)  {
      
      // when a chat message contains raid
      const textEl = newNode.querySelector('.seventv-chat-message-body > .text-token');
      const raidRegex = /\braids?/gmi;
      if (textEl && raidRegex.test(textEl.innerText)) handleRaidChatMessage(textEl);

      // when the channel gets raided
      const raidNode = newNode.querySelector('.seventv-raid-message-container');
      if (raidNode) handleRaidedMessage(raidNode);
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
  if (request.action === 'startObserver')
    startObserving(request.data).then(sendResponse);
})