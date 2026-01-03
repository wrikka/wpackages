import { stdout } from "node:process";
import { clearLine, cursorTo } from "node:readline";

export class LiveConsole {
	render(content: string) {
		clearLine(stdout, 0);
		cursorTo(stdout, 0);
		stdout.write(content);
	}

	clear() {
		clearLine(stdout, 0);
		cursorTo(stdout, 0);
	}
}
