import { Box, Text } from "ink";
import React, { useState } from "react";
import { usePrompt, useTheme } from "../context";
import { useInput } from "../hooks";
import { PromptDescriptor, TreeNode, TreeSelectPromptOptions } from "../types";

const flattenTree = (
	nodes: TreeNode<any>[],
	level = 0,
	parent: TreeNode<any> | null = null,
): (TreeNode<any> & { level: number; parent: TreeNode<any> | null; expanded: boolean })[] => {
	let flat: (TreeNode<any> & { level: number; parent: TreeNode<any> | null; expanded: boolean })[] = [];
	nodes.forEach(node => {
		const expanded = node.expanded ?? true;
		flat.push({ ...node, level, parent, expanded });
		if (expanded && node.children) {
			flat = flat.concat(flattenTree(node.children, level + 1, node));
		}
	});
	return flat;
};

export const TreeSelectPromptComponent = <T,>({ message, nodes }: TreeSelectPromptOptions<T>) => {
	const { submit } = usePrompt<T>();
	const [flatNodes, setFlatNodes] = useState(flattenTree(nodes));
	const [activeIndex, setActiveIndex] = useState(0);
	const theme = useTheme();

	useInput((_input, key) => {
		if (key.return) {
			if (flatNodes[activeIndex]) {
				submit(flatNodes[activeIndex].value);
			}
		} else if (key.upArrow) {
			setActiveIndex(prev => (prev > 0 ? prev - 1 : flatNodes.length - 1));
		} else if (key.downArrow) {
			setActiveIndex(prev => (prev < flatNodes.length - 1 ? prev + 1 : 0));
		} else if (key.rightArrow) {
			const newNodes = [...flatNodes];
			if (newNodes[activeIndex] && newNodes[activeIndex].children) {
				newNodes[activeIndex].expanded = true;
				setFlatNodes(flattenTree(nodes)); // Need to re-flatten the original tree
			}
		} else if (key.leftArrow) {
			const newNodes = [...flatNodes];
			if (newNodes[activeIndex] && newNodes[activeIndex].children) {
				newNodes[activeIndex].expanded = false;
				setFlatNodes(flattenTree(nodes)); // Need to re-flatten the original tree
			}
		}
	});

	return (
		<Box flexDirection="column">
			<Text>{theme.colors.message(message)}</Text>
			<Box flexDirection="column" marginTop={1}>
				{flatNodes.map((node, index) => {
					const isSelected = activeIndex === index;
					const prefix = " ".repeat(node.level * 2);
					const pointer = isSelected ? theme.symbols.pointer : " ";
					const indicator = node.children ? (node.expanded ? "▾" : "▸") : " ";
					return (
						<Text key={`${node.value}-${index}`} color={isSelected ? "cyan" : "white"}>
							{pointer} {prefix}
							{indicator} {node.label}
						</Text>
					);
				})}
			</Box>
		</Box>
	);
};

export const treeselect = <T,>(
	options: TreeSelectPromptOptions<T>,
): PromptDescriptor<T, TreeSelectPromptOptions<T>> => {
	return {
		Component: TreeSelectPromptComponent as React.FC<TreeSelectPromptOptions<T>>,
		props: options,
		initialValue: (options.initialValue ?? options.nodes[0]?.value ?? null) as T,
	};
};
