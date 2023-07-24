'use strict';

function sendSliderUpdate(status) {
  chrome.runtime.sendMessage({ activate: status });
}

function checkSlider() {
  alert('checking slider');
  chrome.runtime.sendMessage({ requestInfo: 'injectionStatus' })
  // TODO: récupérer la valeur pour l'envoyer dans le slider
    .then(msg => { alert(msg); slider.checked = response.value; }) 
    .catch(err => { alert('error with checkSlider: ', err) });
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');

  // slider event
  slider.addEventListener('change', () => {
    sendSliderUpdate(slider.checked);
  })

  // restore check status
  checkSlider();
});