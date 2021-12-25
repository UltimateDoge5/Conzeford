import express, { Request, Response } from "express";
import { join } from "path";
import dotenv from "dotenv";
import McServer from "./server";
import { Server } from "ws";
import { IncomingMessage } from "http";
import { Duplex } from "stream";

const result = dotenv.config({ path: join(__dirname, "../config.env") });

if (result.error) {
	throw result.error;
} else if (process.env.SERVER_JAR == undefined) {
	throw new Error("SERVER_JAR environment variable not set");
} else if (process.env.SERVER_DIR == undefined) {
	throw new Error("SERVER_DIR environment variable not set");
}

//Setup express and websocket server
const app = express();
const wsServer = new Server({ noServer: true });

app.use(express.static(join(__dirname, "web/build")));

app.get("*", (req_: Request, res: Response) => {
	res.sendFile(join(__dirname + "/web/build/index.html"));
});

const server = app.listen(8080, () => console.log("Listening on port 8080"));

server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit("connection", socket, request);
	});
});

wsServer.on("connection", (socket) => {
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
				if (instance.enabled == false) {
					socket.send(JSON.stringify({ error: "Server is disabled" }));
					return;
				}

				if (dataParsed.data == null || dataParsed.data.command == null) {
					socket.send(JSON.stringify({ error: "No command specified" }));
					return;
				}

				instance.executeCommand(dataParsed.data.command);
				break;
			case "start":
				(() => {
					const result = instance.start();
					if (result) {
						socket.send(JSON.stringify({ event: "start", success: true }));
					} else {
						socket.send(JSON.stringify({ event: "start", success: false }));
					}
				})();
				break;
			case "stop":
				(() => {
					const result = instance.stop();
					if (result) {
						socket.send(JSON.stringify({ event: "stop", success: true }));
						instance.once("close", () => {
							socket.send(JSON.stringify({ event: "status", enabled: false }));
						});
					} else {
						socket.send(JSON.stringify({ event: "stop", success: false }));
					}
				})();
				break;
		}
	});
});

//Setup minecraft server
const instance = new McServer(process.env.SERVER_AUTOSTART == "true");

instance.addListener("stdout", (data: Buffer) => {
	let color = "white";

	if (data.toString().match(/(?<=\[)(.*?WARN)(?=\])/)) {
		color = "yellow";
	} else if (data.toString().match(/(?<=\[)(.*?ERROR)(?=\])/)) {
		color = "red";
	}

	wsServer.clients.forEach((client) => {
		client.send(JSON.stringify({ event: "log", data: data.toString("utf-8"), color }));
	});
});
