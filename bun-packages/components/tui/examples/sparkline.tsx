import { Effect } from "effect";
import { render } from "../src";
import { Sparkline, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Sparkline Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Sparkline
				data={[10, 25, 40, 30, 55, 45, 60, 35, 50, 70]}
				showLine
				showDots
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Sparkline
				data={[5, 15, 25, 20, 30, 40, 35, 45]}
				color="green"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
