# Competitor Comparison: @wpackages/diff

This document provides a detailed comparison of `@wpackages/diff` with other popular diffing libraries in the JavaScript ecosystem.

## Key Competitors

1. **[jsdiff (diff)](https://www.npmjs.com/package/diff)**: One of the most popular and foundational text diffing libraries.
2. **[json-diff-ts](https://www.npmjs.com/package/json-diff-ts)**: A modern, lightweight library specifically for comparing JSON objects, written in TypeScript.

## Feature Breakdown

| Feature / Metric         | `@wpackages/diff` | `jsdiff` | `json-diff-ts` |
| ------------------------ | ----------------- | -------- | -------------- |
| **Primary Function**     | Text & Objects    | Text     | JSON Objects   |
| **Algorithm**            | _TBD_             | Myers    | _TBD_          |
| **Output Format**        | Patch / JSON      | Patch    | JSON Patch     |
| **TypeScript Native**    | ✅ Yes            | ❌ No    | ✅ Yes         |
| **Type Definitions**     | ✅ Included       | ✅ Yes   | ✅ Included    |
| **Tree-shakeable**       | ✅ Yes            | ✅ Yes   | ✅ Yes         |
| **Dependencies**         | 0                 | 0        | 0              |
| **Bundle Size (min)**    | _TBD_             | ~6 KB    | ~2 KB          |
| **Performance**          | _TBD_             | Good     | Excellent      |
| **Key-based Array Diff** | ✅ Yes            | ❌ No    | ✅ Yes         |

_TBD: To Be Determined_
