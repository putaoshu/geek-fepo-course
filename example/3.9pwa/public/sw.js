function displayMessage(message) {
  document.querySelector('#sw-status').innerText = message;
}

if ('serviceWorker' in navigator) {
  // See https://developers.google.com/web/fundamentals/instant-and-offline/service-worker/registration
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js').then(function(registration) {
      registration.onupdatefound = function() {
        var installingWorker = registration.installing;

        installingWorker.onstatechange = function() {
          switch (installingWorker.state) {
            case 'installed':
              if (navigator.serviceWorker.controller) {
                displayMessage('Please refresh for updates to this site.');
              } else {
                displayMessage('This site is available offline!');
              }
              break;
            case 'fetch':
              displayMessage('Service worker fetch');
              break;
            case 'activate':
              displayMessage('Service worker activate');
              break;
            case 'redundant':
              displayMessage('Service worker installation failed.');
              break;
          }
        };
      };
    }).catch(function(e) {
      displayMessage('Error during service worker registration:' + e);
    });
  });
}