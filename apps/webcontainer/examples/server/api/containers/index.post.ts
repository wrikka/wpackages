import { Result } from "data-types";
import { createAndAddContainer, getContainerInfo, startContainerInManager } from "webcontainer";
import { createError, defineEventHandler, readBody } from "h3";
import { setManagerState, useManagerState } from "../../utils/container-manager";

export default defineEventHandler(async (event) => {
	const manager = useManagerState();
	const body = await readBody(event);
	const { name, workdir, shell, packageManager, env } = body;

	// Create and add container
	const createResult = createAndAddContainer(manager, {
		env,
		name,
		packageManager,
		shell,
		workdir,
	});

	if (Result.isErr(createResult)) {
		throw createError({
			message: createResult.error.message,
			statusCode: 400,
		});
	}

	let newManager = createResult.value.manager;
	const container = createResult.value.container;

	// Start container
	const startResult = startContainerInManager(newManager, container.id);

	if (Result.isErr(startResult)) {
		throw createError({
			message: startResult.error.message,
			statusCode: 500,
		});
	}

	newManager = startResult.value;
	setManagerState(newManager);

	// Get updated container info
	const containerOpt = newManager.containers.get(container.id);
	if (!containerOpt) {
		throw createError({
			message: "Container not found after creation",
			statusCode: 500,
		});
	}

	return {
		data: getContainerInfo(containerOpt),
		success: true,
	};
});
