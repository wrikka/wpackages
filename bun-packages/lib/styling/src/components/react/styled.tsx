import type { ReactElement, ReactNode } from "react";
import { useMemo } from "react";
import type { StyledComponentOptions, StyledComponentProps } from "../../types/utility-props";
import { mergeClasses, styledPropsToClasses } from "../../utils/props-to-classes";

export interface StyledComponentPropsWithChildren<T extends StyledComponentOptions = StyledComponentOptions>
	extends StyledComponentProps<T> {
	children?: ReactNode;
	as?: React.ElementType;
}

export function styled<T extends StyledComponentOptions = StyledComponentOptions>(
	options: T = {} as T,
) {
	const { baseClasses = [], variants = {}, defaultVariants = {} } = options;

	return function StyledComponent<P extends StyledComponentPropsWithChildren<T> = StyledComponentPropsWithChildren<T>>(
		props: P,
		ref: React.ForwardedRef<HTMLElement>,
	): ReactElement {
		const { as: Component = "div", children, className, class: vueClass, variants: variantProps, ...restProps } = props;

		const utilityClasses = useMemo(() => {
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
		}, [className, vueClass, restProps, variantProps]);

		return (
			<Component ref={ref} className={utilityClasses}>
				{children}
			</Component>
		);
	};
}

export const Box = styled()();
Box.displayName = "Box";

export const Flex = styled({ baseClasses: ["flex"] })();
Flex.displayName = "Flex";

export const Grid = styled({ baseClasses: ["grid"] })();
Grid.displayName = "Grid";

export const Center = styled({ baseClasses: ["flex", "items-center", "justify-center"] })();
Center.displayName = "Center";

export const Stack = styled({ baseClasses: ["flex", "flex-col"] })();
Stack.displayName = "Stack";

export const HStack = styled({ baseClasses: ["flex", "flex-row"] })();
HStack.displayName = "HStack";

export const VStack = styled({ baseClasses: ["flex", "flex-col"] })();
VStack.displayName = "VStack";

export const Text = styled({ baseClasses: [] })();
Text.displayName = "Text";

export const Button = styled({
	baseClasses: ["px-4", "py-2", "rounded", "bg-blue-500", "text-white", "hover:bg-blue-600"],
})();
Button.displayName = "Button";

export const Input = styled({
	baseClasses: ["px-3", "py-2", "border", "rounded", "focus:outline-none", "focus:ring-2"],
})();
Input.displayName = "Input";

export const Card = styled({
	baseClasses: ["p-4", "border", "rounded", "shadow"],
})();
Card.displayName = "Card";
