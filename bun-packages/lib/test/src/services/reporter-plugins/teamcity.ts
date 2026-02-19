import { escapeTeamCity, flattenTests } from "./shared";
import type { TeamCityMessage } from "./types";

export function generateTeamCity(testResults: unknown): string[] {
	const messages: TeamCityMessage[] = [];
	const tests = flattenTests(testResults);

	messages.push({
		type: "testSuiteStarted",
		name: "wtest",
	});

	for (const test of tests) {
		messages.push({
			type: "testStarted",
			name: test.name,
			flowId: "wtest",
		});

		if (test.passed) {
			messages.push({
				type: "testFinished",
				name: test.name,
				flowId: "wtest",
				duration: test.duration || 0,
			});
			continue;
		}

		if (test.skipped) {
			messages.push({
				type: "testIgnored",
				name: test.name,
				flowId: "wtest",
				details: test.diagnostic?.message || "Skipped",
			});
			continue;
		}

		messages.push({
			type: "testFailed",
			name: test.name,
			flowId: "wtest",
			details: test.diagnostic?.message || "Test failed",
		});
		messages.push({
			type: "testFinished",
			name: test.name,
			flowId: "wtest",
			duration: test.duration || 0,
		});
	}

	messages.push({
		type: "testSuiteFinished",
		name: "wtest",
	});

	return messages.map((msg) => formatTeamCityMessage(msg));
}

function formatTeamCityMessage(msg: TeamCityMessage): string {
	const timestamp = new Date().toISOString().replace("T", " ").replace(/\..+/, "");

	switch (msg.type) {
		case "testSuiteStarted":
			return `##teamcity[testSuiteStarted name='${escapeTeamCity(msg.name)}' timestamp='${timestamp}']`;
		case "testSuiteFinished":
			return `##teamcity[testSuiteFinished name='${escapeTeamCity(msg.name)}' timestamp='${timestamp}']`;
		case "testStarted":
			return `##teamcity[testStarted name='${
				escapeTeamCity(msg.name)
			}' flowId='${msg.flowId}' timestamp='${timestamp}']`;
		case "testFinished":
			return `##teamcity[testFinished name='${
				escapeTeamCity(msg.name)
			}' flowId='${msg.flowId}' duration='${msg.duration}' timestamp='${timestamp}']`;
		case "testFailed":
			return `##teamcity[testFailed name='${escapeTeamCity(msg.name)}' flowId='${msg.flowId}' message='${
				escapeTeamCity(msg.details || "Failed")
			}' timestamp='${timestamp}']`;
		case "testIgnored":
			return `##teamcity[testIgnored name='${escapeTeamCity(msg.name)}' flowId='${msg.flowId}' message='${
				escapeTeamCity(msg.details || "Skipped")
			}' timestamp='${timestamp}']`;
		default:
			return "";
	}
}

export type { TeamCityMessage };
