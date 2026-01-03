import { Effect } from "effect";
import { Box, render, Text } from "../src";

// Define the UI using TSX, similar to React
const App = () => (
	<Box>
		<Text>Hello from effect-tui, powered by Effect-TS!</Text>
	</Box>
);

// The render function returns an Effect, which we can run
const program = render(<App />);

Effect.runPromise(program);
