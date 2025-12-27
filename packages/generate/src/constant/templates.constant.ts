/**
 * Built-in template presets
 */
export const BUILTIN_TEMPLATES = {
	TYPESCRIPT_FILE: `/**
 * {{ description }}
 */
export const {{ camel name }} = () => {
	// Implementation here
}
`,

	REACT_COMPONENT: `import type { FC } from "react"

interface {{ pascal name }}Props {
	// Props definition
}

/**
 * {{ description }}
 */
export const {{ pascal name }}: FC<{{ pascal name }}Props> = (props) => {
	return (
		<div>
			{/* Component content */}
		</div>
	)
}
`,

	VUE_COMPONENT: `<script setup lang="ts">
interface Props {
	// Props definition
}

const props = defineProps<Props>()
</script>

<template>
	<div>
		<!-- Component content -->
	</div>
</template>

<style scoped>
/* Component styles */
</style>
`,

	TEST_FILE: `import { describe, it, expect } from "vitest"
import { {{ camel name }} } from "./{{ kebab name }}.ts"

describe("{{ camel name }}", () => {
	it("should work correctly", () => {
		expect({{ camel name }}()).toBeDefined()
	})
})
`,

	USAGE_FILE: `/**
 * Usage example for {{ name }}
 */
import { {{ camel name }} } from "./{{ kebab name }}.ts"

// Example usage
const result = {{ camel name }}()
console.log(result)
`,
} as const;
