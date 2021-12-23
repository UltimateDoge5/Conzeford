import { spawn } from "child_process";
import express, { Request, Response } from "express";
import { join } from "path";

const dotenv = require("dotenv");

const result = dotenv.config({ path: join(__dirname, "../config.env") });

if (result.error) {
	throw result.error;
}

const app = express();

app.use(express.static(join(__dirname, "web/build")));

app.get("*", (req_: Request, res: Response) => {
	res.sendFile(join(__dirname + "/web/build/index.html"));
});

if (process.env.SERVER_JAR == undefined) {
	throw "SERVER_JAR environment variable not set";
} else if (process.env.SERVER_DIR == undefined) {
	throw "SERVER_DIR environment variable not set";
}

console.log("Starting minecraft server...");
const server = spawn("java", ["-jar", process.env.SERVER_JAR, "--nogui"], { cwd: process.env.SERVER_DIR });

server.stdout.on("data", (data) => {
	console.log(`stdout: ${data}`);
});

app.listen(8080, () => console.log("Listening on port 8080"));
