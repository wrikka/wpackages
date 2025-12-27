import { getAllContainerInfos } from "webcontainer";
import { defineEventHandler } from "h3";
import { useManagerState } from "../../utils/container-manager";

export default defineEventHandler(async () => {
	const manager = useManagerState();
	const containerInfos = getAllContainerInfos(manager);

	return {
		data: containerInfos,
		success: true,
	};
});
