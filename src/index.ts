import express, { Request, Response } from "express";
import { dirname, join } from "path";
import dotenv from "dotenv";
import McServer, { serverRouter } from "./server";
import { Server } from "ws";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { readFile } from "fs/promises";
import { statSync, writeFileSync } from "fs";
import chalk from "chalk";
import settingsRouter, { SettingsManager } from "./settings";
import bodyParser from "body-parser";
import logsRouter from "./logs";
import PlayerCache, { headsRouter } from "./playerCache";

const result = dotenv.config({ path: join(process.cwd(), "config.env") });

try {
	if (result.error) {
		writeFileSync("config.env", 'SERVER_JAR="server_jar_name_here"\nSERVER_DIR="directory_of_server_jar_here"\nJRE_FLAGS=""\nSERVER_AUTOSTART=false');
		console.log(chalk.yellow("config.env file not found - creating a new one. Please fill it with the correct values."));
		throw new Error("No config.env file found.");
	} else if (process.env.SERVER_JAR == undefined) {
		throw new Error("SERVER_JAR environment variable not set.");
	} else if (process.env.SERVER_DIR == undefined) {
		throw new Error("SERVER_DIR environment variable not set.");
	}

	//Throw if the path to the jar is not valid.
	if (statSync(join(process.env.SERVER_DIR, process.env.SERVER_JAR), { throwIfNoEntry: false }) == undefined) {
		console.log(chalk.red(`Your path ${join(process.env.SERVER_DIR, process.env.SERVER_JAR)} is not valid.`));
		throw new Error("SERVER_DIR/SERVER_JAR is not a valid path.");
	}
} catch (error) {
	console.error(chalk.red(error));
	process.exit(1);
}

//Setup express and websocket server
const app = express();
const wsServer = new Server({ noServer: true });

export const settingsManager = new SettingsManager();

export const uuidCache = new PlayerCache();

app.use(bodyParser.json());

app.use("/scripts", express.static(join(dirname(__dirname), "build/client")));
app.use("/styles", express.static(join(dirname(__dirname), "web/styles")));

app.get("/", (req: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "web/pages/index.html"));
});

app.get("/console", async (_req: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "web/pages/console.html"));
});

app.get("/settings", async (_req: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "web/pages/settings.html"));
});

app.get("/logs", async (_req: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "web/pages/logs.html"));
});

app.get("/logs/:logId", async (_req: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "web/pages/logViewer.html"));
});

app.use("/api", settingsRouter, serverRouter, logsRouter, headsRouter);

app.get("*", (_req: Request, res: Response) => {
	res.sendStatus(404);
});

const server = app.listen(process.env.PORT || 5454, () => {
	console.log(chalk.black.bgGreen(`Running on http://localhost:${process.env.PORT || 5454}`));
});

server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit("connection", socket, request);
	});
});

wsServer.on("connection", async (socket) => {
	socket.send(JSON.stringify({ event: "status", status: instance.status }));

	if (instance.status.enabled && !instance.status.isStarting) {
		const log = await readFile(join(process.env.SERVER_DIR as string, "logs/latest.log"), "utf8");
		const logs = log.split("\n");

		logs.forEach((line) => {
			let color = "white";

			if (line.match(/(?<=\[)(.*?WARN)(?=\])/)) {
				color = "yellow";
			} else if (line.match(/(?<=\[)(.*?ERROR)(?=\])/)) {
				color = "red";
			}

			socket.send(JSON.stringify({ event: "log", log: line, color }));
		});
	}

	socket.on("message", (data) => {
		let dataParsed: Payload;
		try {
			dataParsed = JSON.parse(data.toString());
		} catch (error) {
			socket.send(JSON.stringify({ error: "Invalid JSON" }));
			return;
		}

		switch (dataParsed.event) {
			case "command":
				if (instance.status.enabled == false) {
					socket.send(JSON.stringify({ error: "Server is disabled" }));
					return;
				}

				if (dataParsed.command == null) {
					socket.send(JSON.stringify({ error: "No command specified" }));
					return;
				}

				instance.executeCommand(dataParsed.command);
				break;
			case "start":
				instance.start();
				break;
			case "stop":
				instance.stop(dataParsed.immediate);
				break;
			case "restart":
				instance.restart(dataParsed.immediate);
				break;
		}
	});
});

//Setup minecraft server
export const instance = new McServer(process.env.SERVER_AUTOSTART == "true");

instance.addListener("stdout", (data: Buffer) => {
	let color = "white";

	if (data.toString().match(/(?<=\[)(.*?WARN)(?=\])/)) {
		color = "yellow";
	} else if (data.toString().match(/(?<=\[)(.*?ERROR)(?=\])/)) {
		color = "red";
	}

	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify({ event: "log", log: data.toString("utf-8"), color }));
	});
});

instance.addListener("error", (error: string) => {
	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify({ event: "log", log: error, color: "red" }));
	});
});

instance.addListener("status", (status: serverStatus) => {
	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify({ event: "status", status }));
	});
});

const onExit = () => {
	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify({ event: "status", status: { enabled: false, isStarting: false, isStopping: false, players: [], startDate: null } }));
	});
};

process.on("exit", onExit);
process.on("SIGUSR1", onExit);
process.on("SIGUSR2", onExit);
