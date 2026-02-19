function postReady() {
  window.parent.postMessage({ type: 'plugin:ready' }, '*');
}

function callHost(method, params) {
  window.parent.postMessage({ type: 'plugin:call', method, params }, '*');
}

document.getElementById('btn')?.addEventListener('click', () => {
  callHost('toast', {
    title: 'Sidebar Plugin',
    description: 'Hello from sidebar section plugin',
    color: 'green',
  });
});

postReady();
