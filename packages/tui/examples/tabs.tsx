import { Effect } from "effect";
import { render } from "../src";
import { Tabs, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Tabs Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Tabs
				tabs={["Home", "About", "Settings"]}
				selectedIndex={0}
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Tabs
				tabs={["Tab 1", "Tab 2", "Tab 3", "Tab 4"]}
				selectedIndex={2}
				color="green"
				selectedColor="yellow"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
