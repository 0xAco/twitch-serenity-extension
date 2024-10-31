'use strict';

function messageToBG(payload) {
  return chrome.runtime.sendMessage(payload);
}

document.addEventListener('DOMContentLoaded', function() {
  const slider = document.getElementById('slider');

  // restore check status
  messageToBG({ getInfo: 'isInjected' })
    .then(response => slider.checked = response);

  // slider event
  slider.addEventListener('change', () => {
    messageToBG({ sliderUpdate: slider.checked })
      .then(response => console.log('[popup] css handled succesfully: ', response));
  })
});

// todo :
//   - handle raid messages properly
//   - i18n