import { Effect } from "effect";
import { render } from "../src";
import { Table, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Table Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Table
				headers={["Name", "Age", "City"]}
				rows={[
					["Alice", "25", "NYC"],
					["Bob", "30", "LA"],
					["Charlie", "35", "SF"],
				]}
				selectedIndex={1}
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
