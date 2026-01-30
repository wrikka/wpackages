import { arch, hostname, platform } from "node:os";

export const SystemInfoService = {
	getSystemInfo() {
		return {
			arch: arch(),
			hostname: hostname(),
			os: platform(),
		};
	},
};
