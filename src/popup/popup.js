'use strict';

function sendSliderUpdate(status) {
  chrome.runtime.sendMessage({ activate: status });
}

function checkSlider() {
  chrome.runtime.sendMessage({ requestInfo: 'injectionStatus' })
    .then(msg => { slider.checked = msg; })
    .catch(err => { console.error('error with checkSlider: ' + err) });
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');

  // restore check status
  checkSlider();

  // slider event
  slider.addEventListener('change', () => {
    sendSliderUpdate(slider.checked);
  })
});