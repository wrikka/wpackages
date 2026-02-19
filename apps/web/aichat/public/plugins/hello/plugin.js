let pluginId = null;

function postReady() {
  window.parent.postMessage({ type: 'plugin:ready' }, '*');
}

function callHost(method, params) {
  window.parent.postMessage({ type: 'plugin:call', method, params }, '*');
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'host:init') {
    pluginId = data.payload?.pluginId ?? null;
  }
});

document.getElementById('btn')?.addEventListener('click', () => {
  callHost('setDraft', { text: 'Hello from plugin! Write something here...' });
  callHost('toast', {
    title: 'Hello Plugin',
    description: 'Inserted a draft into the chat input',
    color: 'green',
  });
});

postReady();
