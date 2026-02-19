export const formatBytes = (bytes: number): string => {
	if (bytes === 0) return "0 B";
	const k = 1024;
	const sizes = ["B", "KB", "MB", "GB", "TB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
};

export const formatDuration = (ms: number): string => {
	const seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	const hours = Math.floor(minutes / 60);

	if (hours > 0) {
		return `${hours}h ${minutes % 60}m`;
	} else if (minutes > 0) {
		return `${minutes}m ${seconds % 60}s`;
	} else {
		return `${seconds}s`;
	}
};

export const formatTimestamp = (timestamp: number): string => {
	return new Date(timestamp).toLocaleTimeString();
};

export const formatDate = (timestamp: number): string => {
	return new Date(timestamp).toLocaleDateString();
};

export const formatDateTime = (timestamp: number): string => {
	return new Date(timestamp).toLocaleString();
};

export const formatNumber = (num: number): string => {
	return new Intl.NumberFormat().format(num);
};
