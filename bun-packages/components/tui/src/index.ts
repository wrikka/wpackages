import { Effect, Layer } from "effect";
import { Renderer, RendererLive } from "./services/renderer.service";
import type { Terminal } from "./services/terminal.service";
import { TerminalLive } from "./services/terminal.service";
import type { VNode } from "./types/vnode";

// Re-export components for users
export { Box } from "./components/Box";
export { Text } from "./components/Text";
export { Button } from "./components/Button";
export { Input } from "./components/Input";
export { List } from "./components/List";
export { Table } from "./components/Table";
export { Tabs } from "./components/Tabs";
export { Progress } from "./components/Progress";
export { Chart } from "./components/Chart";
export { Sparkline } from "./components/Sparkline";
export { Scrollbar } from "./components/Scrollbar";
export { Modal } from "./components/Modal";
export { Dropdown } from "./components/Dropdown";
export { Checkbox } from "./components/Checkbox";
export { Radio } from "./components/Radio";
export { Spinner } from "./components/Spinner";
export { Canvas } from "./components/Canvas";

// Re-export types
export type {
	ButtonProps,
	InputProps,
	ListProps,
	TableProps,
	TabsProps,
	ProgressProps,
	ChartProps,
	SparklineProps,
	ScrollbarProps,
	ModalProps,
	DropdownProps,
	CheckboxProps,
	RadioProps,
	SpinnerProps,
	CanvasProps,
	CanvasContext,
} from "./types/schema";

// Re-export utils
export * from "./utils";

// The main render function for users
export const render = (node: VNode): Effect.Effect<void, never, Terminal> => {
	const program = Effect.gen(function* (_) {
		const renderer = yield* _(Renderer);
		yield* _(renderer.render(node));
	});

	const MainLayer = Layer.provide(RendererLive, TerminalLive);
	return Effect.provide(program, MainLayer);
};
