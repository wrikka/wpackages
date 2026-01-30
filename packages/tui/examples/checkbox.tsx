import { Effect } from "effect";
import { render } from "../src";
import { Checkbox, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Checkbox Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Checkbox label="Unchecked" checked={false} />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Checkbox label="Checked" checked={true} />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Checkbox label="Remember me" checked={true} color="green" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Checkbox label="Accept terms" checked={false} color="red" />
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
