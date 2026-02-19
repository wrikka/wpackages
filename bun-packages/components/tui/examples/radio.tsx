import { Effect } from "effect";
import { render } from "../src";
import { Radio, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Radio Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Radio
				options={["Option 1", "Option 2", "Option 3"]}
				selectedIndex={0}
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Radio
				options={["Red", "Green", "Blue"]}
				selectedIndex={1}
				color="green"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
