self.onmessage = (event: MessageEvent<number>) => {
	const input = event.data;
	const result = input * 2;
	self.postMessage(result);
};
