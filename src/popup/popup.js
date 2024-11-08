// sends a message to the service worker
async function messageToSW(payload) {
  if (!payload.hasOwnProperty('action')) return;
  const response = await chrome.runtime.sendMessage(payload);
  return await response;
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');
  // text elements
  const sliderLabel = document.getElementById('slider-label');
  const githubRepo = document.querySelector('#repo-link > .footer__text');
  const githubIssue = document.querySelector('#repo-issue > .footer__text');

  // translation
  sliderLabel.innerText = chrome.i18n.getMessage('hideStats');
  githubRepo.innerText = chrome.i18n.getMessage('githubLabel');
  githubIssue.innerText = chrome.i18n.getMessage('githubBug');

  // restore check status
  messageToSW({ action: 'getInfo', data: 'isInjected' })
    .then(response => slider.checked = response);

  // slider event
  slider.addEventListener('change', () => {
    messageToSW({ action: 'sliderUpdated', data: slider.checked })
  });
});