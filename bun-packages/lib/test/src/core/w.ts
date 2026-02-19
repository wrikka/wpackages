import { createMock } from "../utils/mock";
import { spyOn } from "../utils/spy";
import { addMockedModule } from "./mockRegistry";

export const w = {
	fn: createMock,
	spyOn: spyOn,
	mock: (modulePath: string, factory?: () => any): void => {
		addMockedModule(modulePath, factory);
	},
};
