import { renderReact } from "./compiler/react";
import { renderSvelte } from "./compiler/svelte";
import { renderVue } from "./compiler/vue";
import type { Framework } from "./types";
import type { IrNode } from "./types/ir";

export const compile = (framework: Framework, root: IrNode): string => {
	switch (framework) {
		case "react":
			return renderReact(root);
		case "vue":
			return renderVue(root);
		case "svelte":
			return renderSvelte(root);
	}
};
