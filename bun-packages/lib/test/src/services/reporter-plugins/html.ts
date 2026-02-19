import { flattenTests } from "./shared";

export function generateHTML(testResults: unknown, coverageData?: any): string {
	const tests = flattenTests(testResults);
	const passed = tests.filter((t) => t.passed).length;
	const failed = tests.filter((t) => !t.passed && !t.skipped).length;
	const skipped = tests.filter((t) => t.skipped).length;
	const total = tests.length;

	return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>WTest Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { padding: 30px; border-bottom: 1px solid #e0e0e0; }
        .summary { display: flex; gap: 20px; margin-top: 20px; }
        .summary-item { flex: 1; text-align: center; padding: 20px; border-radius: 8px; }
        .summary-item.total { background: #f0f0f0; }
        .summary-item.passed { background: #d4edda; color: #155724; }
        .summary-item.failed { background: #f8d7da; color: #721c24; }
        .summary-item.skipped { background: #fff3cd; color: #856404; }
        .summary-number { font-size: 2em; font-weight: bold; }
        .summary-label { margin-top: 5px; opacity: 0.8; }
        .content { padding: 30px; }
        .test-list { list-style: none; padding: 0; }
        .test-item { padding: 15px; border-bottom: 1px solid #e0e0e0; display: flex; align-items: center; }
        .test-item:last-child { border-bottom: none; }
        .test-status { width: 80px; font-weight: bold; }
        .test-status.passed { color: #28a745; }
        .test-status.failed { color: #dc3545; }
        .test-status.skipped { color: #ffc107; }
        .test-name { flex: 1; margin-left: 15px; }
        .test-duration { color: #666; font-size: 0.9em; }
        .error-details { margin-top: 10px; padding: 10px; background: #f8d7da; border-radius: 4px; font-family: monospace; font-size: 0.9em; }
        .coverage { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .coverage-bar { height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden; margin: 10px 0; }
        .coverage-fill { height: 100%; background: #28a745; transition: width 0.3s ease; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>WTest Report</h1>
            <div class="summary">
                <div class="summary-item total">
                    <div class="summary-number">${total}</div>
                    <div class="summary-label">Total</div>
                </div>
                <div class="summary-item passed">
                    <div class="summary-number">${passed}</div>
                    <div class="summary-label">Passed</div>
                </div>
                <div class="summary-item failed">
                    <div class="summary-number">${failed}</div>
                    <div class="summary-label">Failed</div>
                </div>
                <div class="summary-item skipped">
                    <div class="summary-number">${skipped}</div>
                    <div class="summary-label">Skipped</div>
                </div>
            </div>
        </div>
        <div class="content">
            <h2>Test Results</h2>
            <ul class="test-list">
                ${
		tests
			.map(
				(test) => `
                    <li class="test-item">
                        <div class="test-status ${test.passed ? "passed" : test.skipped ? "skipped" : "failed"}">
                            ${test.passed ? "✓" : test.skipped ? "⊘" : "✗"}
                        </div>
                        <div class="test-name">${test.name}</div>
                        <div class="test-duration">${test.duration || 0}ms</div>
                    </li>
                    ${
					test.diagnostic && !test.passed
						? `
                        <li class="test-item">
                            <div class="error-details">
                                <strong>${test.diagnostic.message}</strong>
                                ${test.diagnostic.stack ? `<pre>${test.diagnostic.stack}</pre>` : ""}
                            </div>
                        </li>
                    `
						: ""
				}
                `,
			)
			.join("")
	}
            </ul>
            
            ${
		coverageData
			? `
                <div class="coverage">
                    <h2>Coverage</h2>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${coverageData.total?.lines?.percentage || 0}%"></div>
                    </div>
                    <p>Lines: ${coverageData.total?.lines?.percentage || 0}% (${
				coverageData.total?.lines?.covered || 0
			}/${coverageData.total?.lines?.total || 0})</p>
                </div>
            `
			: ""
	}
        </div>
    </div>
</body>
</html>`;
}
