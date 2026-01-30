import { Effect } from "effect";
import { render } from "../src";
import { Scrollbar, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Scrollbar Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Scrollbar
				position={0}
				total={100}
				visible={20}
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Scrollbar
				position={30}
				total={100}
				visible={20}
				color="green"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
