import { Effect } from "effect";
import { render } from "../src";
import { Progress, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Progress Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Progress value={50} max={100} label="Loading" showPercentage />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Progress value={75} max={100} label="Download" color="blue" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Progress value={30} max={100} label="Upload" color="red" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Progress value={90} max={100} label="Processing" color="green" />
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
