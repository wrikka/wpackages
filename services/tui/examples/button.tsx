import { Effect } from "effect";
import { render } from "../src";
import { Button, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Button Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Button label="Default" variant="default" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Button label="Primary" variant="primary" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Button label="Danger" variant="danger" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Button label="Success" variant="success" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Button label="Disabled" disabled />
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
