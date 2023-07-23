'use strict';

console.log('init popup');
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');

  // slider event
  slider.addEventListener('change', () => {
    sendSliderUpdate(slider.checked);
  })
});

const sendSliderUpdate = (status) => {
  chrome.runtime.sendMessage({ isActivated: status });
}