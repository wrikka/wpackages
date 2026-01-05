import { Box, Text, useApp, useInput } from "ink";
import React, { useCallback, useMemo, useState } from "react";
import {
	autocomplete,
	confirm,
	date,
	filesystem,
	multiselect,
	note,
	number,
	password,
	type PromptDescriptor,
	PromptProvider,
	rating,
	select,
	slider,
	spinner,
	table,
	text,
	ThemeProvider,
	time,
	toggle,
	treeselect,
} from "./index";
import { renderer } from "./services";

type FocusArea = "sidebar" | "preview";

type ShowcaseItem = {
	key: string;
	label: string;
	descriptor: PromptDescriptor<any, any>;
};

function Preview({ item }: { item: ShowcaseItem }) {
	const [result, setResult] = useState<unknown>(undefined);
	const [runKey, setRunKey] = useState(0);

	const resultText = useMemo(() => {
		if (result === undefined) return "-";
		if (typeof result === "symbol") return result.toString();
		if (typeof result === "string") return result;
		if (typeof result === "number") return String(result);
		if (typeof result === "boolean") return String(result);
		try {
			return JSON.stringify(result);
		} catch {
			return String(result);
		}
	}, [result]);

	const onSubmit = useCallback((value: unknown) => {
		setResult(value);
		setRunKey((k) => k + 1);
	}, []);

	const onCancel = useCallback(() => {
		setResult(Symbol.for("cancel"));
		setRunKey((k) => k + 1);
	}, []);

	return (
		<Box flexDirection="column" gap={1}>
			<Box flexDirection="column" borderStyle="round" paddingX={1}>
				<Text bold>{item.label}</Text>
				<Text dimColor>Esc: กลับไปแท็บซ้าย</Text>
			</Box>

			<Box flexDirection="column" borderStyle="round" paddingX={1}>
				<ThemeProvider>
					<PromptProvider
						key={runKey}
						initialValue={item.descriptor.initialValue}
						onSubmit={onSubmit}
						onCancel={onCancel}
					>
						<item.descriptor.Component {...item.descriptor.props} />
					</PromptProvider>
				</ThemeProvider>
			</Box>

			<Box flexDirection="column" borderStyle="round" paddingX={1}>
				<Text dimColor>Result</Text>
				<Text>{resultText}</Text>
			</Box>
		</Box>
	);
}

function App() {
	const { exit } = useApp();
	const sidebarMaxVisibleItems = 12;
	const items = useMemo<ShowcaseItem[]>(() => {
		return [
			{ key: "text", label: "Text", descriptor: text({ message: "What is your name?", placeholder: "Type here..." }) },
			{ key: "password", label: "Password", descriptor: password({ message: "Enter password" }) },
			{ key: "confirm", label: "Confirm", descriptor: confirm({ message: "Do you want to continue?" }) },
			{ key: "toggle", label: "Toggle", descriptor: toggle({ message: "Enable notifications?" }) },
			{
				key: "select",
				label: "Select",
				descriptor: select({
					message: "Choose one",
					options: [
						{ value: "a", label: "Option A" },
						{ value: "b", label: "Option B" },
						{ value: "c", label: "Option C" },
					],
				}),
			},
			{
				key: "multiselect",
				label: "MultiSelect",
				descriptor: multiselect({
					message: "Pick many (Space to toggle)",
					options: [
						{ value: "x", label: "Item X" },
						{ value: "y", label: "Item Y" },
						{ value: "z", label: "Item Z" },
					],
				}),
			},
			{ key: "number", label: "Number", descriptor: number({ message: "How old are you?", min: 1, max: 120 }) },
			{ key: "slider", label: "Slider", descriptor: slider({ message: "How satisfied are you?", max: 10 }) },
			{ key: "rating", label: "Rating", descriptor: rating({ message: "Rate (out of 5)" }) },
			{ key: "date", label: "Date", descriptor: date({ message: "Pick a date" }) },
			{ key: "time", label: "Time", descriptor: time({ message: "Pick a time" }) },
			{ key: "note", label: "Note", descriptor: note({ title: "Info", message: "Press Enter to continue" }) },
			{
				key: "spinner",
				label: "Spinner",
				descriptor: spinner({
					message: "Working...",
					action: async () => {
						await new Promise((r) => setTimeout(r, 800));
						return "done";
					},
				}),
			},
			{
				key: "table",
				label: "Table",
				descriptor: table({
					message: "Pick a row",
					headers: ["name", "value"],
					rows: [
						{ value: "A", data: { name: "Row 1", value: "A" } },
						{ value: "B", data: { name: "Row 2", value: "B" } },
						{ value: "C", data: { name: "Row 3", value: "C" } },
					],
				}),
			},
			{
				key: "autocomplete",
				label: "Autocomplete",
				descriptor: autocomplete({
					message: "Search",
					options: [
						{ value: "react", label: "React" },
						{ value: "ink", label: "Ink" },
						{ value: "bun", label: "Bun" },
						{ value: "effect", label: "Effect" },
					],
				}),
			},
			{
				key: "filesystem",
				label: "Filesystem",
				descriptor: filesystem({ message: "Pick a file", root: process.cwd() }),
			},
			{
				key: "treeselect",
				label: "TreeSelect",
				descriptor: treeselect({
					message: "Pick items",
					nodes: [
						{
							label: "Group 1",
							value: "g1",
							children: [
								{ label: "Child 1", value: "g1-c1" },
								{ label: "Child 2", value: "g1-c2" },
							],
						},
						{ label: "Group 2", value: "g2" },
					],
				}),
			},
		];
	}, []);

	const [focus, setFocus] = useState<FocusArea>("sidebar");
	const [activeIndex, setActiveIndex] = useState(0);

	useInput(
		(_, key) => {
			if (_.toLowerCase() === "q") {
				exit();
			}
			if (key.ctrl && _.toLowerCase() === "c") {
				exit();
			}
		},
		{ isActive: true },
	);

	useInput(
		(_, key) => {
			if (key.escape) {
				exit();
				return;
			}
			if (key.tab) {
				setFocus((prev) => (prev === "sidebar" ? "preview" : "sidebar"));
				return;
			}
			if (key.downArrow) {
				setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
				return;
			}
			if (key.upArrow) {
				setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
				return;
			}
			if (key.return) {
				setFocus("preview");
			}
		},
		{ isActive: focus === "sidebar" },
	);

	useInput(
		(_, key) => {
			if (key.escape) {
				setFocus("sidebar");
				return;
			}
			if (key.tab) {
				setFocus("sidebar");
			}
		},
		{ isActive: focus === "preview" },
	);

	const activeItem = items[activeIndex] ?? items[0];

	const sidebarWindow = (() => {
		const max = sidebarMaxVisibleItems;
		const total = items.length;
		if (total <= max) {
			return { start: 0, end: total };
		}
		const half = Math.floor(max / 2);
		let start = activeIndex - half;
		if (start < 0) start = 0;
		let end = start + max;
		if (end > total) {
			end = total;
			start = Math.max(0, end - max);
		}
		return { start, end };
	})();

	return (
		<Box flexDirection="column">
			<Box borderStyle="round" paddingX={1}>
				<Text bold>@wpackages/prompt showcase</Text>
				<Box marginLeft={2}>
					<Text dimColor>
						Tab: switch focus | ↑/↓: navigate | Enter: preview | Esc: back (preview) / exit (tabs) | q: quit
					</Text>
				</Box>
			</Box>

			<Box marginTop={1} gap={2}>
				<Box flexDirection="column" width={30} borderStyle="round" paddingX={1}>
					<Text dimColor>{focus === "sidebar" ? "Tabs (active)" : "Tabs"}</Text>
					{sidebarWindow.start > 0 && <Text dimColor>↑ more</Text>}
					{items.slice(sidebarWindow.start, sidebarWindow.end).map((it, localIdx) => {
						const idx = sidebarWindow.start + localIdx;
						const isActive = idx === activeIndex;
						const prefix = isActive ? ">" : " ";
						return (
							<Text key={it.key} inverse={isActive}>
								{prefix} {it.label}
							</Text>
						);
					})}
					{sidebarWindow.end < items.length && <Text dimColor>↓ more</Text>}
				</Box>

				<Box flexGrow={1} flexDirection="column" borderStyle="round" paddingX={1}>
					<Text dimColor>{focus === "preview" ? "Preview (active)" : "Preview"}</Text>
					{activeItem ? <Preview key={activeItem.key} item={activeItem} /> : <Text>-</Text>}
				</Box>
			</Box>
		</Box>
	);
}

renderer.render(<App />);
