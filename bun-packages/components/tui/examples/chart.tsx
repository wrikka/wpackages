import { Effect } from "effect";
import { render } from "../src";
import { Chart, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Chart Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Chart
				data={[[10, 25, 40, 30, 55, 45, 60]]}
				labels={["M", "T", "W", "T", "F", "S", "S"]}
				type="line"
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Chart
				data={[[20, 35, 50, 40, 65]]}
				labels={["A", "B", "C", "D", "E"]}
				type="bar"
				color="green"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
