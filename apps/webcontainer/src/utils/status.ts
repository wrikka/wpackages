import type { ContainerStatus } from "../types/container-simple";

export const isContainerIdle = (status: ContainerStatus): boolean => status === "idle";

export const isContainerRunning = (status: ContainerStatus): boolean => status === "running";

export const isContainerStopped = (status: ContainerStatus): boolean => status === "stopped";

export const isContainerError = (status: ContainerStatus): boolean => status === "error";

export const canStart = (status: ContainerStatus): boolean => status === "idle" || status === "stopped";

export const canStop = (status: ContainerStatus): boolean => status === "running";

export const transitionToRunning = (
	status: ContainerStatus,
): ContainerStatus => {
	if (canStart(status)) return "running";
	return status;
};

export const transitionToStopped = (
	status: ContainerStatus,
): ContainerStatus => {
	if (canStop(status)) return "stopped";
	return status;
};

export const transitionToError = (): ContainerStatus => "error";
