// Types
export type * from './types'

// Constants
export * from './constants'

// Utils
export * from './utils'

// Core libraries
export * from './lib'

// Re-export commonly used functions for convenience
export {
	add,
	subtract,
	multiply,
	divide,
	power,
	modulus,
	sqrt,
	abs,
	round,
	floor,
	ceil,
	factorial,
	gcd,
	lcm
} from './lib/arithmetic.lib'

export {
	mean,
	median,
	mode,
	range,
	variance,
	standardDeviation,
	percentile,
	correlation
} from './lib/statistics.lib'

export {
	createComplexNumber,
	addComplex,
	multiplyComplex,
	complexMagnitude,
	createVector2D,
	createVector3D,
	addVector2D,
	subtractVector2D,
	dotProduct2D,
	crossProduct2D,
	vectorMagnitude2D,
	normalizeVector2D,
	createMatrix2D,
	addMatrix2D,
	multiplyMatrix2D,
	matrixDeterminant2D,
	sin,
	cos,
	tan,
	asin,
	acos,
	atan,
	atan2
} from './lib/advanced.lib'

export {
	roundToPrecision,
	approximatelyEqual,
	formatNumber,
	clamp,
	isValidNumber,
	isNumeric,
	isSafeInteger,
	validateNumbers,
	validateNumeric,
	isPositive,
	isNegative,
	isZero,
	degreesToRadians,
	radiansToDegrees,
	polarToCartesian,
	cartesianToPolar,
	toScientificNotation,
	fromScientificNotation
} from './utils'

export {
	PI,
	E,
	TAU,
	SQRT_2,
	SQRT_1_2,
	LN_2,
	LN_10,
	LOG_2_E,
	LOG_10_E,
	GOLDEN_RATIO,
	EULER_MASCHERONI,
	DEG_TO_RAD,
	RAD_TO_DEG,
	MAX_SAFE_INTEGER,
	MIN_SAFE_INTEGER,
	EPSILON
} from './constants'
