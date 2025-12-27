/**
 * error - Type-safe Error Handling
 *
 * Functional error handling with Result<T, E>
 *
 * @example
 * ```ts
 * import { notFoundError, validationError } from 'error';
 * import { err, ok, type Result } from 'functional';
 *
 * function findUser(id: number): Result<User, NotFoundError> {
 *   const user = users.find(u => u.id === id);
 *   if (!user) return err(notFoundError('User', id));
 *   return ok(user);
 * }
 * ```
 */

// ============================================
// Configuration
// ============================================

export { ERROR_CONFIG } from "./config";
export type { ErrorConfig } from "./config";

// ============================================
// Constants
// ============================================

export { ERROR_CODES } from "./constant";
export type { ErrorCode } from "./constant";

// ============================================
// Types
// ============================================

export * from "./types";

// ============================================
// Error Creators (Pure Functions)
// ============================================

export {
	appError,
	conflictError,
	databaseError,
	forbiddenError,
	fromError,
	fromUnknown,
	httpError,
	networkError,
	notFoundError,
	timeoutError,
	unauthorizedError,
	validationError,
} from "./services";

// ============================================
// Components (Pure Functions)
// ============================================

export {
	createCombinedErrorMetadata,
	createChainedErrorMetadata,
	createContextMetadata,
	filterErrorsByType,
	filterErrorsByName,
	transformError,
	transformErrors,
} from "./components";

// ============================================
// Error Composition Utilities
// ============================================

export {
	addContext,
	chainError,
	combineErrors,
	errorGroup,
	filterErrors,
	mapErrors,
} from "./utils/composition";
