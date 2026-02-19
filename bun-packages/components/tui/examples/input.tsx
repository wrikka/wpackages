import { Effect } from "effect";
import { render } from "../src";
import { Input, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Input Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Input value="Hello World" placeholder="Type here..." />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Input value="password123" placeholder="Password" password />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Input value="" placeholder="Empty input" />
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Input value="Limited text" placeholder="Max 10 chars" maxLength={10} />
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
