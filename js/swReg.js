/**
 * Created by obulaworld on 8/16/18.
 */
//added service worker here
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/js/sw.js').then(function(registration) {
        console.log('Service worker registration succeeded:', registration);
    }).catch(function(error) {
        console.log('Service worker registration failed:', error);
    });
} else {
    console.log('Service workers are not supported.');
}