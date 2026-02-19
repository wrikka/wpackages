import { Effect } from "effect";
import { render } from "../src";
import { Dropdown, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Dropdown Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Dropdown
				items={["Option 1", "Option 2", "Option 3"]}
				placeholder="Select an option"
				isOpen
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Dropdown
				items={["Red", "Green", "Blue"]}
				placeholder="Choose color"
				isOpen
				selectedIndex={1}
				color="green"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
