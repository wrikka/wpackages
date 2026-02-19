const mockedModules = new Map<string, (() => any) | undefined>();

export function addMockedModule(modulePath: string, factory?: () => any) {
	mockedModules.set(modulePath, factory);
}

export function getMockedModules(): Map<string, (() => any) | undefined> {
	return mockedModules;
}

export function clearMockedModules() {
	mockedModules.clear();
}
