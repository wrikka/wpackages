import { Effect } from "effect";
import { render } from "../src";
import { List, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">List Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<List
				items={["Item 1", "Item 2", "Item 3", "Item 4", "Item 5"]}
				selectedIndex={0}
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<List
				items={["Option A", "Option B", "Option C"]}
				selectedIndex={1}
				color="green"
				selectedColor="yellow"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
