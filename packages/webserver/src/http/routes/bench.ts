import { HttpRouter, HttpServerResponse } from "@effect/platform";
import { Effect } from "effect";

const makePayload = (payloadBytes: number): string => {
	if (!Number.isFinite(payloadBytes) || payloadBytes <= 0) return "";
	return "x".repeat(payloadBytes);
};

const payloadBytes = Number.parseInt(process.env.PAYLOAD_BYTES ?? "0", 10);
const payload = makePayload(payloadBytes);

export const benchRootRoute = HttpRouter.get(
	"/",
	Effect.succeed(HttpServerResponse.text(payload)),
);

export const benchParamRoute = HttpRouter.get(
	"/r/:id",
	Effect.succeed(HttpServerResponse.text(payload)),
);
