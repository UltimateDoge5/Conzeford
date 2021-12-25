import express, { Request, Response } from "express";
import { join } from "path";
import dotenv from "dotenv";
import McServer from "./server";

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
	throw new Error("SERVER_JAR environment variable not set");
} else if (process.env.SERVER_DIR == undefined) {
	throw new Error("SERVER_DIR environment variable not set");
}

const instance = new McServer(process.env.SERVER_AUTOSTART == "true");

instance.addListener("stdout", (data: Buffer) => {
	console.log(data.toString("utf-8"));
});

app.listen(8080, () => console.log("Listening on port 8080"));
