import { Option } from "data-types";
import { getAllPorts, getContainer } from "webcontainer";
import { createError, defineEventHandler, getRouterParam } from "h3";
import { useManagerState } from "../../../utils/container-manager";

export default defineEventHandler(async (event) => {
	const manager = useManagerState();
	const id = getRouterParam(event, "id");

	if (!id) {
		throw createError({
			message: "Container ID is required",
			statusCode: 400,
		});
	}

	const containerOpt = getContainer(manager, id);

	if (Option.isNone(containerOpt)) {
		throw createError({
			message: "Container not found",
			statusCode: 404,
		});
	}

	const container = containerOpt.value;
	const ports = getAllPorts(container);

	return {
		data: ports,
		success: true,
	};
});
