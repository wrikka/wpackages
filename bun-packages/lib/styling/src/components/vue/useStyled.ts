import { computed } from "vue";
import type { StyledComponentOptions, StyledComponentProps } from "../../types/utility-props";
import { mergeClasses, styledPropsToClasses } from "../../utils/props-to-classes";

export interface UseStyledOptions<T extends StyledComponentOptions = StyledComponentOptions>
	extends StyledComponentProps<T> {
	class?: string;
	className?: string;
}

export function useStyled<T extends StyledComponentOptions = StyledComponentOptions>(
	options: T = {} as T,
) {
	const { baseClasses = [], variants = {}, defaultVariants = {} } = options;

	return function (props: UseStyledOptions<T>) {
		const { class: vueClass, className, variants: variantProps, ...restProps } = props;

		const styledClasses = computed(() => {
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

			return mergeClasses(className, vueClass, ...classes);
		});

		return {
			class: styledClasses,
		};
	};
}
