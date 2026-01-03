export type CancellationToken = {
	isCancelled: () => boolean;
	throwIfCancelled: () => void;
	onCancelled: (callback: () => void) => void;
};

export type CancellationTokenSource = {
	token: CancellationToken;
	cancel: () => void;
};
