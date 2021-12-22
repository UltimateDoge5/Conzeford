import express, { Request, Response } from "express";
import { join } from "path";

const app = express();

app.use(express.static(join(__dirname, "web/build")));

app.get("*", (req_: Request, res: Response) => {
	res.sendFile(join(__dirname + "/web/build/index.html"));
});

app.listen(8080, () => console.log("Listening on port 8080"));
