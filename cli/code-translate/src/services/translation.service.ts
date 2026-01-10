import { Effect } from "effect";
import { MockTranslationProvider } from "../types";
import type { TranslationRequest, TranslationResult, TranslationError } from "../types";

export const translateCode = (request: TranslationRequest): Effect.Effect<TranslationResult, TranslationError> => {
	const provider = new MockTranslationProvider();
	return provider.translate(request);
};
