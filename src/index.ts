import express, { Request, Response } from "express";
import { dirname, join } from "path";
import dotenv from "dotenv";
import { Server } from "ws";
import { IncomingMessage } from "http";
import { Duplex } from "stream";
import { readFile } from "fs/promises";
import { statSync, writeFileSync } from "fs";
import bodyParser from "body-parser";
import McServer, { serverRouter } from "./server";
import settingsRouter, { SettingsManager } from "./settings";
import PlayerCache, { headsRouter } from "./playerCache";
import authRouter, { authMiddleware } from "./auth";
import logsRouter from "./logs";
import chalk from "chalk";
import { compare } from "bcrypt";
import { cwd } from "process";
import cors from "cors";

const result = dotenv.config({ path: join(process.cwd(), "config.env"), override: false });

try {
	if (result.error) {
		writeFileSync(
			"config.env",
			'SERVER_JAR="server_jar_name_here"\nSERVER_DIR="directory_of_server_jar_here"\nJRE_FLAGS=""\nSERVER_AUTOSTART=false'
		);
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

app.use(bodyParser.json(), bodyParser.urlencoded({ extended: true }));

if (settingsManager.settings.auth.enabled) {
	app.use("*", authMiddleware);
	console.log(chalk.green("Authentication enabled."));
} else {
	console.log(chalk.yellow("Authentication disabled."));
}

//If in production enviroment
if ((process as any).pkg) {
	process.env.NODE_ENV = "";
	const outPath = join(dirname(__dirname), "web/out/");
	app.use("/_next", express.static(join(outPath, "_next")));

	app.get("/", (req: Request, res: Response) => {
		res.sendFile(join(outPath, "index.html"));
	});

	app.get("/console", (req: Request, res: Response) => {
		res.sendFile(join(outPath, "console.html"));
	});

	app.get("/logs", (req: Request, res: Response) => {
		res.sendFile(join(outPath, "logs.html"));
	});

	app.get("/settings", (req: Request, res: Response) => {
		res.sendFile(join(outPath, "settings.html"));
	});

	app.use("/auth", authRouter);
	app.use("/api", settingsRouter, serverRouter, logsRouter, headsRouter);

	app.get("*", (req: Request, res: Response) => {
		res.sendFile(join(outPath, "404.html"));
	});
} else {
	app.use(cors());

	app.use("/auth", authRouter);
	app.use("/api", settingsRouter, serverRouter, logsRouter, headsRouter);

	app.get("*", (req: Request, res: Response) => {
		res.redirect(`http://localhost:3000${req.url}`);
	});
}

const server = app.listen(process.env.PORT || 5454, () => {
	console.log(chalk.black.bgGreen(`Running on http://localhost:${process.env.PORT || 5454}`));
});

server.on("upgrade", (req: IncomingMessage, socket: Duplex, head: Buffer) => {
	if (settingsManager.settings.auth.enabled) {
		if (!req.headers.authorization) {
			socket.destroy();
			return;
		} else {
			const auth = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString("ascii").split(":");
			if (!(auth[0] === "admin" && compare(auth[1], settingsManager.settings.auth.hash! || ""))) {
				socket.destroy();
				return;
			}
		}
	}

	wsServer.handleUpgrade(req, socket, head, (socket) => {
		wsServer.emit("connection", socket, req);
	});
});

wsServer.on("connection", async (socket) => {
	socket.send(JSON.stringify({ event: "status", status: instance.status }));

	if (instance.status.enabled && !instance.status.isStarting) {
		const log = await readFile(join(cwd(), "cache", "console.log"), "utf8");

		setTimeout(() => socket.send(JSON.stringify({ event: "log", log })), 100);
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
	wsServer.clients.forEach((client) => client.send(JSON.stringify({ event: "log", log: data.toString("utf-8") })));
});

instance.addListener("status", (status: ServerStatus) => {
	wsServer.clients.forEach((client) => client.send(JSON.stringify({ event: "status", status })));
});

instance.addListener("crash", (error: string) => {
	wsServer.clients.forEach((client) => client.send(JSON.stringify({ event: "crash", message: error })));
});

const onExit = () => {
	wsServer.clients.forEach((client) =>
		client.send(
			JSON.stringify({ event: "status", status: { enabled: false, isStarting: false, isStopping: false, players: [], startDate: null } })
		)
	);
};

process.on("exit", onExit);
process.on("SIGUSR1", onExit);
process.on("SIGUSR2", onExit);
