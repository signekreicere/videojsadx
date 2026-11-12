// Some sites dispatch a synthetic window 'load' event; the callback must still run only once.
function onPageLoadOnce(callback, win) {
  let called = false;
  function run() {
    if (called) {
      return;
    }
    called = true;
    win.removeEventListener('load', run);
    callback();
  }

  if (win.document && win.document.readyState === 'complete') {
    run();
  } else {
    win.addEventListener('load', run);
  }
}

module.exports = {
  onPageLoadOnce,
};
