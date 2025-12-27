import { createManager, type ManagerState } from "webcontainer";

let managerState: ManagerState = createManager();

export const useManagerState = (): ManagerState => {
	return managerState;
};

export const setManagerState = (newState: ManagerState): void => {
	managerState = newState;
	console.log(
		"✨ Manager state updated. Containers:",
		newState.containers.size,
	);
};

export const resetManager = (): void => {
	managerState = createManager();
	console.log("✨ Manager reset");
};
