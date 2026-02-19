let ctx = null;

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
    ctx = data.payload?.context ?? null;
  }
});

document.getElementById('btn')?.addEventListener('click', () => {
  const msg = ctx?.messageId ? `Message: ${ctx.messageId}` : 'Message Action';
  callHost('toast', {
    title: 'Message Action Plugin',
    description: msg,
    color: 'green',
  });
});

postReady();
