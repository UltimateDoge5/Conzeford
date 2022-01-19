import { Request, Response, Router } from "express";
import { readdir, readFile, rename, stat, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { ungzip } from "node-gzip";

const logsRouter = Router();

logsRouter.get("/logs", async (req: Request, res: Response) => {
	if (req.body.log != undefined) {
		if ((await stat(join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log.gz")), { throwIfNoEntry: false }) != undefined) {
			const log = await ungzip(await readFile(join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log.gz")));

			//Overwrite the .gz file with the uncompressed file to mantain the creation date.
			await rename(
				join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log.gz"),
				join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log")
			);
			await writeFile(join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log"), log, { encoding: "utf8" });

			res.status(200).json({ log: log.toString() });
		} else if ((await stat(join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log")), { throwIfNoEntry: false }) != undefined) {
			const log = await readFile(join(process.env.SERVER_DIR as string, "logs", req.body.log + ".log"), "utf8");
			res.status(200).json({ log });
		} else {
			res.sendStatus(404);
		}
	} else {
		const logsRaw = await readdir(join(process.env.SERVER_DIR as string, "logs"));

		let logs: Log[] = [];

		for (const log of logsRaw) {
			const logsStats = await stat(join(process.env.SERVER_DIR as string, "logs", log));
			logs.push({ name: log.replace(/(\.log)|(\.gz)/g, ""), creationDate: logsStats.birthtime.getTime() });
		}

		res.json({ logs });
	}
});

logsRouter.delete("/logs", async (req: Request, res: Response) => {
	const { log } = req.body;

	console.log(join(process.env.SERVER_DIR as string, "logs", log + ".log.gz"));
	if (logs != undefined && logs.length > 0) {
		if ((await stat(join(process.env.SERVER_DIR as string, "logs", log + ".log.gz")), { throwIfNoEntry: false }) != undefined) {
			await unlink(join(process.env.SERVER_DIR as string, "logs", log + ".log.gz"));
		} else if ((await stat(join(process.env.SERVER_DIR as string, "logs", log + ".log")), { throwIfNoEntry: false }) != undefined) {
			await unlink(join(process.env.SERVER_DIR as string, "logs", log + ".log"));
		} else {
			return res.sendStatus(404);
		}

		const updatedLogs = await readdir(join(process.env.SERVER_DIR as string, "logs"));
		res.status(200).json({ updatedLogs });
	} else {
		res.sendStatus(400);
	}
});

export default logsRouter;
