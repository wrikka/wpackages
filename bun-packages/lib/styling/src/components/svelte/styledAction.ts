import type { Action } from "svelte/action";
import type { StyledComponentOptions, StyledComponentProps } from "../../types/utility-props";
import { mergeClasses, styledPropsToClasses } from "../../utils/props-to-classes";

export interface StyledActionOptions<T extends StyledComponentOptions = StyledComponentOptions>
	extends StyledComponentProps<T> {
	class?: string;
	className?: string;
}

export function styled<T extends StyledComponentOptions = StyledComponentOptions>(
	options: T = {} as T,
): Action<HTMLElement, StyledActionOptions<T>> {
	const { baseClasses = [], variants = {}, defaultVariants = {} } = options;

	return function (node: HTMLElement, props: StyledActionOptions<T>) {
		const { class: svelteClass, className, variants: variantProps, ...restProps } = props;

		const updateClasses = () => {
			const classes: string[] = [];

			classes.push(...baseClasses);

			const variantClasses: string[] = [];
			const mergedVariants = { ...defaultVariants, ...variantProps };

			for (const [variantKey, variantValue] of Object.entries(mergedVariants)) {
				const variantOptions = variants[variantKey];
				if (variantOptions && variantValue && variantOptions[variantValue]) {
					variantClasses.push(variantOptions[variantValue]);
				}
			}

			classes.push(...variantClasses);

			const propClasses = styledPropsToClasses(restProps);
			classes.push(...propClasses);

			const finalClasses = mergeClasses(className, svelteClass, ...classes);
			node.className = finalClasses;
		};

		updateClasses();

		return {
			update(newProps: StyledActionOptions<T>) {
				Object.assign(props, newProps);
				updateClasses();
			},
		};
	};
}
