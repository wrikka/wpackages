self.onmessage = async (event: MessageEvent) => {
	const { id, fn } = event.data;

	try {
		const func = new Function("return " + fn)();
		const result = await func();
		self.postMessage({ id, result });
	} catch (error) {
		self.postMessage({ id, error: String(error) });
	}
};
