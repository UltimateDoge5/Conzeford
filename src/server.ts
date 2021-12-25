import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import EventEmitter from "events";

class McServer extends EventEmitter {
	enabled!: boolean;
	process!: ChildProcessWithoutNullStreams;

	constructor(autostart = false) {
		super();
		if (autostart) {
			this.start();
		}
	}

	stop = () => {
		if (this.enabled) {
			console.log("Stopping minecraft server...");
			this.process.stdin.write("say Wylaczanko za 10 sekund\n");

			setTimeout(() => {
				this.process.stdin.write("stop\n");
			}, 10 * 1000);
		}
	};

	start = () => {
		if (!this.enabled) {
			this.process = spawn("java", ["-jar", process.env.SERVER_JAR as string, "--nogui"], { cwd: process.env.SERVER_DIR });
			this.process.stdout.addListener("data", (data: string) => {
				this.emit("stdout", data);
			});

			this.process.stdout.addListener("close", () => {
				this.enabled = false;
				this.emit("close");
			});

			this.enabled = true;
		}
	};
}

export default McServer;
