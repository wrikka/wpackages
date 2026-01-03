import { renderer as legacyRenderer } from "@/services"; // Keep legacy for now
import { Renderer, RendererLive } from "@/services/renderer-effect";
import { Effect } from "effect";
import React, { createContext, PropsWithChildren, useContext, useState } from "react";

export type PromptState = "active" | "submitting" | "submitted" | "cancelled";

interface PromptContextValue<T> {
	value: T;
	setValue: (value: T) => void;
	state: PromptState;
	submit: (value: T) => void;
	cancel: () => void;
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
		{ initialValue: T; onSubmit: (value: T) => void; onCancel: () => void }
	>,
) {
	const [value, setValue] = useState<T>(initialValue);
	const [state, setState] = useState<PromptState>("active");

	const submit = (val: T) => {
		if (state === "active") {
			setState("submitting");
			onSubmit(val);
			// The renderer will be unmounted by the calling function
		}
	};

	const cancel = () => {
		if (state === "active") {
			setState("cancelled");
			onCancel();
		}
	};

	return (
		<PromptContext.Provider value={{ value, setValue, state, submit, cancel }}>
			{children}
		</PromptContext.Provider>
	);
}

// Legacy prompt function
export function prompt<T, P extends object>(
	Component: React.FC<P>,
	props: P,
	initialValue: T,
): Promise<T | symbol> {
	return new Promise((resolve) => {
		const onCancel = () => {
			legacyRenderer.unmount();
			resolve(Symbol.for("cancel"));
		};

		const onSubmit = (value: T) => {
			legacyRenderer.unmount();
			resolve(value);
		};

		legacyRenderer.render(
			<PromptProvider initialValue={initialValue} onSubmit={onSubmit} onCancel={onCancel}>
				<Component {...props} />
			</PromptProvider>,
		);
	});
}

// New Effect-based prompt function
export function promptEffect<T, P extends object>(
	Component: React.FC<P>,
	props: P,
	initialValue: T,
): Effect.Effect<T, "cancelled"> {
	const effectLogic = Effect.gen(function*() {
		const renderer: Renderer = yield* Renderer;

		const acquire = Effect.gen(function*() {
			const callbacks = {
				onSubmit: (_value: T) => {},
				onCancel: () => {},
			};

			const ui = (
				<PromptProvider
					initialValue={initialValue}
					onSubmit={(value) => callbacks.onSubmit(value)}
					onCancel={() => callbacks.onCancel()}
				>
					<Component {...props} />
				</PromptProvider>
			);

			const instance = yield* renderer.render(ui);
			return { callbacks, instance };
		});

		return yield* Effect.acquireUseRelease(
			acquire,
			({ callbacks }: { callbacks: { onSubmit: (value: T) => void; onCancel: () => void } }) =>
				Effect.async<T, "cancelled">(resume => {
					callbacks.onSubmit = (value: T) => resume(Effect.succeed(value));
					callbacks.onCancel = () => resume(Effect.fail("cancelled"));
				}),
			({ instance }: { instance: any }) => renderer.unmount(instance),
		);
	});

	return effectLogic.pipe(Effect.provide(RendererLive)) as unknown as Effect.Effect<T, "cancelled">;
}
