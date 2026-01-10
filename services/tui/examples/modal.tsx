import { Effect } from "effect";
import { render } from "../src";
import { Modal, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Modal Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Modal
				title="Information"
				isOpen
				width={40}
				height={10}
				borderColor="cyan"
			/>
		</Box>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Modal
				title="Warning"
				isOpen
				width={50}
				height={12}
				borderColor="yellow"
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
