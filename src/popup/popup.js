'use strict';

console.log('init popup');
document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');
  slider.addEventListener('change', function() {
    console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
    chrome.runtime.sendMessage({ isActivated: slider.checked });
  })
});