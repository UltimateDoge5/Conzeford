import chalk from "chalk";
import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import EventEmitter from "events";
import { Router, Request, Response } from "express";
import { readdir, stat } from "fs/promises";
import { join } from "path";
import { instance, settingsManager } from ".";

class McServer extends EventEmitter {
	status: serverStatus;
	process!: ChildProcessWithoutNullStreams;
	version?: string;
	worldSize!: WorldSize;

	constructor(autostart = false) {
		super();
		this.status = { enabled: false, isStarting: false, isStopping: false, players: [], startDate: null };

		if (autostart) {
			setTimeout(() => {
				this.start();
			}, 5000);
		}
	}

	stop = (immediate = false) => {
		const shutdownDelay = settingsManager.settings.shutdownDelay;
		if (this.status.enabled && !this.status.isStopping) {
			if (shutdownDelay.enabled && !immediate) {
				this.process.stdin.write(`say ${shutdownDelay.message.replace("{delay}", shutdownDelay.delay.toString())}\n`);

				setTimeout(() => {
					this.process.stdin.write("stop\n");
					this.status.isStopping = true;
					this.status.startDate = null;
					this.emit("status", this.status);
				}, shutdownDelay.delay * 1000);
			} else {
				this.process.stdin.write("stop\n");
				this.status.isStopping = true;
				this.status.startDate = null;
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
			this.status.startDate = new Date();

			this.process.stdout.setEncoding("utf8");
			this.process.stdout.addListener("data", (data: Buffer) => {
				this.emit("stdout", data);
				const string = data.toString();

				if (this.status.isStarting) {
					if (string.match(/(Done \(\d*\.\d{3}s\)! For help, type "help")/)) {
						this.status.enabled = true;
						this.status.isStarting = false;
						this.emit("status", this.status);
					}
				}

				if (this.status.enabled) {
					if (string.match(/\[INFO\] Stopping server/)) {
						this.status.isStopping = true;
						this.emit("status", this.status);
					}

					//I know this can be easly spoofed for example with modified chat messages
					//and I will probably use a plugin to do this
					//but it's enough for now
					if (string.match(/(?:(\w*) joined the game)/) && !string.match(/<\w*>/)) {
						const player = string.match(/(?:(\w*) joined the game)/) as RegExpMatchArray;
						this.status.players.push(player[1]);
						this.emit("status", this.status);
					} else if (string.match(/(?:(\w*) left the game)/) && !string.match(/<\w*>/)) {
						const player = string.match(/((?<player>\w*) left the game)/) as RegExpMatchArray;
						this.status.players.splice(this.status.players.indexOf(player[1]), 1);
						this.emit("status", this.status);
					}
				}
			});

			this.process.stdout.addListener("close", () => {
				this.status.enabled = false;
				this.status.isStopping = false;
				this.status.startDate = null;
				this.emit("status", this.status);
			});

			return true;
		}

		return false;
	};

	restart = (immediate = false) => {
		if (this.status.enabled && !this.status.isStarting && !this.status.isStopping) {
			this.stop(immediate);

			const onIdle = async () => {
				if (!this.status.enabled && !this.status.isStarting && !this.status.isStopping) {
					await this.start();
					instance.off("status", onIdle);
				}
			};

			instance.on("status", onIdle);
		}
	};

	executeCommand = (command: string) => {
		if (this.status.enabled && !this.status.isStopping && !this.status.isStarting) {
			this.emit("stdout", Buffer.from(`> ${command}\n`));
			this.process.stdin.write(`${command}\n`);
		}
	};

	getWorldSize = async (refresh = false) => {
		if (this.worldSize != undefined && this.worldSize.worlds.length > 0 && !refresh) return this.worldSize;

		const worldSize: WorldSize = { worlds: [], date: new Date().getTime() };

		const readSizeRecursive = (path: string, exlude: string[] = []): Promise<TreeFolder> => {
			return new Promise((resolve, reject) => {
				const name = path.split("\\");
				const tree: TreeFolder = { dirs: [], files: [], name: name[name.length - 1], size: 0 };

				readdir(path)
					.then(async (dirs) => {
						for (const dir of dirs) {
							if (exlude.includes(dir)) continue;

							const fullDir = join(path, dir);
							const dirStat = await stat(fullDir);

							if (dirStat.isDirectory()) {
								//If is a folder scan it recursively
								tree.dirs.push(await readSizeRecursive(fullDir));
							} else if (dirStat.isFile()) {
								tree.files.push(dirStat.size);
							}
						}

						tree.size = sumBytes(tree);

						resolve(tree);
					})
					.catch((e) => reject(e));
			});
		};

		const sumBytes = (tree: TreeFolder) => {
			//Sum up all the Bytes in folders and files
			let bytesSum = 0;

			for (const dir of tree.dirs) {
				bytesSum += dir.size;
			}

			bytesSum += tree.files.reduce((a, b) => a + b, 0);

			return bytesSum;
		};

		try {
			const worldProbe = await readdir(join(process.env.SERVER_DIR as string, "world"));

			if (worldProbe.includes("DIM1")) {
				const world = await readSizeRecursive(join(process.env.SERVER_DIR as string, "world"));
				worldSize.worlds.push({ name: "world", size: world.size });

				const nether = await readSizeRecursive(join(process.env.SERVER_DIR as string, "world", "DIM-1"));
				worldSize.worlds.push({ name: "world_nether", size: nether.size });

				const end = await readSizeRecursive(join(process.env.SERVER_DIR as string, "world", "DIM1"));
				worldSize.worlds.push({ name: "world_the_end", size: end.size });
			} else {
				const dir = await readdir(join(process.env.SERVER_DIR as string));

				for (const folder of dir) {
					if (["world", "world_nether", "world_the_end"].includes(folder)) {
						const world = await readSizeRecursive(join(process.env.SERVER_DIR as string, folder));
						worldSize.worlds.push({ name: world.name, size: world.size });
					}
				}
			}
		} catch (error) {
			console.log(chalk.red(new Error("Unexpected error occured when getting the world size.")));
			return undefined;
		}

		this.worldSize = worldSize;
		return worldSize;
	};
}

export const serverRouter = Router();

serverRouter.get("/worldSize", async (req: Request, res: Response) => {
	const worldSize = await instance.getWorldSize(req.query.refresh == "true");
	res.status(200).json(worldSize);
});

export default McServer;
