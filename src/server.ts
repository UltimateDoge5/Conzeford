import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import EventEmitter from "events";

class McServer extends EventEmitter {
	status: serverStatus;
	process!: ChildProcessWithoutNullStreams;

	constructor(autostart = false) {
		super();
		this.status = { enabled: false, isStarting: false, isStopping: false };

		if (autostart) {
			setTimeout(() => {
				this.start();
			}, 5000);
		}
	}

	stop = () => {
		if (this.status.enabled && !this.status.isStopping) {
			this.process.stdin.write("say Wylaczanko za 10 sekund\n");

			setTimeout(() => {
				this.process.stdin.write("stop\n");
				this.status.isStopping = true;
			}, 10 * 1000);
			return true;
		}
		return false;
	};

	start = (): boolean => {
		if (!this.status.enabled && !this.status.isStarting) {
			this.status.isStarting = true;
			this.process = spawn("java", ["-jar", process.env.SERVER_JAR as string, "--nogui"], { cwd: process.env.SERVER_DIR });
			this.process.stdout.addListener("data", (data: Buffer) => {
				this.emit("stdout", data);

				if (this.status.isStarting) {
					if (data.toString().match(/(Done \()(\d\.\d{3}s\)! For help, type "help")/)) {
						this.status.enabled = true;
						this.status.isStarting = false;
						this.emit("start");
					}
				}
			});

			this.process.stdout.addListener("close", () => {
				this.status.enabled = false;
				this.status.isStopping = false;
				this.emit("close");
			});

			return true;
		}
		return false;
	};

	executeCommand = (command: string) => {
		if (this.status.enabled && !this.status.isStopping && !this.status.isStarting) {
			this.emit("stdout", Buffer.from(`> ${command}\n`));
			this.process.stdin.write(`${command}\n`);
		}
	};
}

export default McServer;
