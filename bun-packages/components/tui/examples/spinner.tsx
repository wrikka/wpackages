import { Effect } from "effect";
import { render } from "../src";
import { Spinner, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Spinner Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Spinner type="dots" label="Loading" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Spinner type="line" label="Processing" color="green" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Spinner type="bar" label="Uploading" color="blue" />
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
