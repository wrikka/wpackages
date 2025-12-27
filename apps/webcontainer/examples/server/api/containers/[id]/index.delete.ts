import { Option, Result } from "data-types";
import { getContainer, removeContainer, stopContainerInManager } from "webcontainer";
import { createError, defineEventHandler, getRouterParam } from "h3";
import { setManagerState, useManagerState } from "../../../utils/container-manager";

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

	// Stop container first
	let newManager = manager;
	const container = containerOpt.value;

	if (container.status === "running") {
		const stopResult = stopContainerInManager(newManager, id);
		if (Result.isErr(stopResult)) {
			throw createError({
				message: stopResult.error.message,
				statusCode: 500,
			});
		}
		newManager = stopResult.value;
	}

	// Remove container
	const removeResult = removeContainer(newManager, id);
	if (Result.isErr(removeResult)) {
		throw createError({
			message: removeResult.error.message,
			statusCode: 500,
		});
	}

	setManagerState(removeResult.value);

	return {
		success: true,
	};
});
