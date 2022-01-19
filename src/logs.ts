import { Request, Response, Router } from "express";
import { readdir, readFile, stat, unlink, writeFile } from "fs/promises";
import { join } from "path";
import { ungzip } from "node-gzip";

const logsRouter = Router();

logsRouter.get("/logs", async (req: Request, res: Response) => {
	if (req.body.log != undefined) {
		if ((await stat(join(process.env.SERVER_DIR as string, "logs", req.body.log)), { throwIfNoEntry: false }) != undefined) {
			if (req.body.log.match(".gz")) {
				const log = await ungzip(await readFile(join(process.env.SERVER_DIR as string, "logs", req.body.log)));

				//Delete the gz and replace it with the uncompressed file.
				await unlink(join(process.env.SERVER_DIR as string, "logs", req.body.log));
				await writeFile(join(process.env.SERVER_DIR as string, "logs", req.body.log.replace(".gz", "")), log);

				res.status(200).json({ log: log.toString() });
			} else {
				const log = await readFile(join(process.env.SERVER_DIR as string, "logs", req.body.log), "utf8");
				res.status(200).json({ log });
			}
		} else {
			res.sendStatus(404);
		}
	} else {
		const logs = await readdir(join(process.env.SERVER_DIR as string, "logs"));
		res.json({ logs });
	}
});

logsRouter.delete("/logs", async (req: Request, res: Response) => {
	const { logs } = req.body;

	if (logs != undefined && logs.length > 0) {
		try {
			for (const log of logs) {
				await unlink(join(process.env.SERVER_DIR as string, "logs", log));
			}
		} catch (e: any) {
			if (e.code == "ENOENT") {
				return res.sendStatus(404);
			} else {
				return res.sendStatus(500);
			}
		}

		const updatedLogs = await readdir(join(process.env.SERVER_DIR as string, "logs"));
		res.status(200).json({ updatedLogs });
	} else {
		res.sendStatus(400);
	}
});

export default logsRouter;
