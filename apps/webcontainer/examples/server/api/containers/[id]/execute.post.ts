import { Option, Result } from "data-types";
import { execute, getContainer } from "webcontainer";
import { createError, defineEventHandler, getRouterParam, readBody } from "h3";
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
	const body = await readBody(event);
	const { command } = body;

	const result = await execute(container, command);

	if (Result.isErr(result)) {
		throw createError({
			message: result.error.message,
			statusCode: 500,
		});
	}

	return {
		data: result.value,
		success: true,
	};
});
