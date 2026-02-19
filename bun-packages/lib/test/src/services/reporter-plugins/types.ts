export interface JUnitTestSuite {
	name: string;
	tests: JUnitTestCase[];
	failures: number;
	errors: number;
	skipped: number;
	time: number;
}

export interface JUnitTestCase {
	name: string;
	classname: string;
	time: number;
	failure?: JUnitFailure;
	error?: JUnitError;
	skipped?: JUnitSkipped;
}

export interface JUnitFailure {
	message: string;
	type: string;
	text: string;
}

export interface JUnitError {
	message: string;
	type: string;
	text: string;
}

export interface JUnitSkipped {
	message: string;
}

export interface TAPTest {
	name: string;
	ok: boolean;
	passed?: boolean;
	failed?: boolean;
	skipped?: boolean;
	diagnostic?: {
		severity: string;
		message: string;
		stack?: string;
	};
}

export interface TeamCityMessage {
	type: string;
	name: string;
	flowId?: string;
	duration?: number;
	details?: string;
}

export interface FlatTestResult {
	name: string;
	suite?: string;
	duration?: number;
	passed?: boolean;
	skipped?: boolean;
	error?: {
		name?: string;
		message?: string;
		stack?: string;
	};
	diagnostic?: {
		severity: string;
		message: string;
		stack?: string;
	};
}
