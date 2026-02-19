import { Effect } from "effect";
import { render } from "../src";
import { Canvas, Box, Text } from "../src";

const App = () => (
	<Box flexDirection="column" padding={{ top: 2, left: 2 }}>
		<Text bold color="cyan">Canvas Examples</Text>
		<Box flexDirection="row" padding={{ top: 1 }}>
			<Canvas
				width={30}
				height={10}
				onDraw={(ctx) => {
					ctx.drawRect(2, 2, 26, 6, "█");
					ctx.drawText(5, 4, "Hello Canvas!");
					ctx.drawLine(5, 6, 25, 6, "─");
				}}
			/>
		</Box>
	</Box>
);

Effect.runPromise(render(<App />));
