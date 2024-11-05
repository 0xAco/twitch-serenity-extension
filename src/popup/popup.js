// sends a message to the service worker
async function messageToSW(payload) {
  if (!payload.hasOwnProperty('action')) return;
  const response = await chrome.runtime.sendMessage(payload);
  return await response;
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');

  // restore check status
  messageToSW({ action: 'getInfo', data: 'isInjected' })
    .then(response => slider.checked = response);

  // slider event
  slider.addEventListener('change', () => {
    messageToSW({ action: 'sliderUpdated', data: slider.checked })
  });
});