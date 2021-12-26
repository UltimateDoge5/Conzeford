import express, { Request, Response } from "express";
import { dirname, join } from "path";
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

app.use("/scripts", express.static(join(dirname(__dirname), "build/web")));
app.use("/styles", express.static(join(dirname(__dirname), "web/styles")));

app.get("*", (req_: Request, res: Response) => {
	res.sendFile(join(dirname(__dirname), "/web/index.html"));
});

const server = app.listen(8080, () => console.log("Listening on port 8080"));

server.on("upgrade", (request: IncomingMessage, socket: Duplex, head: Buffer) => {
	wsServer.handleUpgrade(request, socket, head, (socket) => {
		wsServer.emit("connection", socket, request);
	});
});

wsServer.on("connection", (socket) => {
	console.log("Client connected");
	socket.send(JSON.stringify({ event: "status", status: instance.status }));

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
				(() => {
					instance.start();
					socket.send(JSON.stringify({ event: "status", status: instance.status }));

					instance.once("start", () => {
						socket.send(JSON.stringify({ event: "status", status: instance.status }));
					});
				})();
				break;
			case "stop":
				(() => {
					instance.stop();
					socket.send(JSON.stringify({ event: "status", status: { ...instance.status, isStopping: true } }));

					instance.once("close", () => {
						socket.send(JSON.stringify({ event: "status", status: instance.status }));
					});
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
		client.send(JSON.stringify({ event: "log", log: data.toString("utf-8"), color }));
	});
});
