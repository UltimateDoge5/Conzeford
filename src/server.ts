import chalk from "chalk";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import EventEmitter from "events";
import { truncate } from "fs/promises";
import { join } from "path";
import { settingsManager } from ".";

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
		const shutdownDelay = settingsManager.settings.shutdownDelay;
		if (this.status.enabled && !this.status.isStopping) {
			if (shutdownDelay.enabled) {
				this.process.stdin.write(`say ${shutdownDelay.message.replace("{delay}", shutdownDelay.delay.toString())}\n`);

				setTimeout(() => {
					this.process.stdin.write("stop\n");
					this.status.isStopping = true;
					this.emit("status", this.status);
				}, shutdownDelay.delay * 1000);
			} else {
				this.process.stdin.write("stop\n");
				this.status.isStopping = true;
				this.emit("status", this.status);
			}
			return true;
		}
		return false;
	};

	start = async () => {
		if (!this.status.enabled && !this.status.isStarting) {
			this.status.isStarting = true;

			this.process = spawn("java", ["-jar", join(process.env.SERVER_DIR as string, process.env.SERVER_JAR as string), "--nogui"], {
				cwd: process.env.SERVER_DIR
			});

			this.process.on("error", (error: any) => {
				if (error.code == "ENOENT") {
					console.log(chalk.red(new Error("SERVER_DIR/SERVER_JAR is not a valid path.")));
				} else {
					console.log(chalk.red(new Error("Unexpected error occured when starting the server.")));
					throw error;
				}
				process.exit(1);
			});

			this.emit("status", this.status);

			await truncate(join(process.env.SERVER_DIR as string, "logs/latest.log"), 0);

			this.process.stdout.setEncoding("utf8");
			this.process.stdout.addListener("data", (data: Buffer) => {
				this.emit("stdout", data);

				if (this.status.isStarting) {
					if (data.toString().match(/(Done \()(\d\.\d{3}s\)! For help, type "help")/)) {
						this.status.enabled = true;
						this.status.isStarting = false;
						this.emit("status", this.status);
					}
				}

				if (this.status.enabled) {
					if (data.toString().match(/\[INFO\] Stopping server/)) {
						this.status.isStopping = true;
						this.emit("status", this.status);
					}
				}
			});

			this.process.stdout.addListener("close", () => {
				this.status.enabled = false;
				this.status.isStopping = false;
				this.emit("status", this.status);
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
