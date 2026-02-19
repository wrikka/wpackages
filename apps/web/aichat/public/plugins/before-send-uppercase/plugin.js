function postReady() {
  window.parent.postMessage({ type: 'plugin:ready' }, '*');
}

function respond(requestId, ok, result, error) {
  window.parent.postMessage({
    type: 'plugin:response',
    requestId,
    ok,
    result,
    error,
  }, '*');
}

window.addEventListener('message', (event) => {
  const data = event.data;
  if (!data || typeof data !== 'object') return;

  if (data.type === 'host:invoke') {
    const { requestId, method, payload } = data;
    try {
      if (method === 'chat:beforeSend') {
        const text = typeof payload?.text === 'string' ? payload.text : '';
        respond(requestId, true, { text: text.toUpperCase() });
        return;
      }
      respond(requestId, false, null, 'Unknown method');
    } catch (e) {
      respond(requestId, false, null, String(e));
    }
  }
});

postReady();
