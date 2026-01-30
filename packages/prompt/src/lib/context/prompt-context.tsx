import React, { createContext, PropsWithChildren, useContext, useState } from "react";
import { type PromptTheme } from "../../constants/theme";
import { renderer as legacyRenderer } from "../../services"; // Keep legacy for now
import { cancelResult, okResult, PromptDescriptor, type PromptResult } from "../../types";
import { ThemeProvider } from "./theme-context";

export type PromptContextState = "active" | "submitting" | "submitted" | "cancelled";

interface PromptContextValue<T> {
	value: T;
	setValue: (value: T) => unknown;
	state: PromptContextState;
	submit: (value: T) => unknown;
	cancel: () => unknown;
}

const PromptContext = createContext<PromptContextValue<any> | null>(null);

export function usePrompt<T>() {
	const context = useContext(PromptContext as React.Context<PromptContextValue<T>>);
	if (!context) {
		throw new Error("usePrompt must be used within a PromptProvider");
	}
	return context;
}

export function PromptProvider<T>(
	{ children, initialValue, onCancel, onSubmit }: PropsWithChildren<
		{ initialValue: T; onSubmit: (value: T) => unknown; onCancel: () => unknown }
	>,
) {
	const [value, setValue] = useState<T>(initialValue);
	const [state, setState] = useState<PromptContextState>("active");

	const submit = (val: T): unknown => {
		if (state === "active") {
			setState("submitting");
			onSubmit(val);
			// The renderer will be unmounted by the calling function
		}
		return undefined;
	};

	const cancel = (): unknown => {
		if (state === "active") {
			setState("cancelled");
			onCancel();
		}
		return undefined;
	};

	return (
		<PromptContext.Provider value={{ value, setValue, state, submit, cancel }}>
			{children}
		</PromptContext.Provider>
	);
}

interface PromptOptions {
	theme?: Partial<PromptTheme>;
}

export function prompt<T>(
	descriptor: PromptDescriptor<T, any>,
	options: PromptOptions = {},
): Promise<PromptResult<T>> {
	if (!process.stdin.isTTY) {
		// Ink requires a TTY to operate in raw mode.
		// Gracefully cancel if not in a TTY environment.
		return Promise.resolve(cancelResult);
	}

	return new Promise((resolve) => {
		const onCancel = () => {
			legacyRenderer.unmount();
			resolve(cancelResult);
		};

		const onSubmit = (value: T) => {
			legacyRenderer.unmount();
			resolve(okResult(value));
		};

		legacyRenderer.render(
			<ThemeProvider theme={options.theme}>
				<PromptProvider
					initialValue={descriptor.initialValue}
					onSubmit={onSubmit}
					onCancel={onCancel}
				>
					<descriptor.Component {...descriptor.props} />
				</PromptProvider>
			</ThemeProvider>,
		);
	});
}
