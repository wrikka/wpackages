---
description: "Make the @wpackages/release-pkg production-ready."
---

1.  **Fix Broken Links**: Identify and fix all broken links in `d:\wpackages\packages\release-pkg\README.md`.
2.  **Create Missing Documentation**: Create the essential documentation files mentioned in the README, such as:
    *   `docs/api.md`
    *   `docs/preview-releases.md`
    *   `docs/pkgprnew-comparison.md`
3.  **Verify Examples**: Run all typescript files in the `examples/` directory to ensure they work as expected.
4.  **Run Quality Checks**: Execute the `review` script from `package.json` (`bun lint && bun test`) to check for code quality and test coverage.
5.  **Update Dependencies**: Check for and update any outdated dependencies in `package.json`.
