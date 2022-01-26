import { Request, Response, Router } from "express";
import { readdir, readFile, rename, stat, unlink, writeFile, access } from "fs/promises";
import { join } from "path";
import { ungzip } from "node-gzip";
import { settingsManager } from ".";

const logsRouter = Router();
export let expirationInterval: NodeJS.Timer;

logsRouter.get("/logs", async (req: Request, res: Response) => {
	const logsRaw = await readdir(join(process.env.SERVER_DIR as string, "logs"));
	let logs: Log[] = [];

	for (const log of logsRaw) {
		const logsStats = await stat(join(process.env.SERVER_DIR as string, "logs", log));
		logs.push({ name: log.replace(/(\.log)|(\.gz)/g, ""), creationDate: logsStats.birthtime.getTime() });
	}

	res.json({ logs });
});

logsRouter.get("/log/:logID", async (req: Request, res: Response) => {
	const logID = req.params.logID;

	if (await exists(join(process.env.SERVER_DIR as string, "logs", logID + ".log.gz"))) {
		const log = await ungzip(await readFile(join(process.env.SERVER_DIR as string, "logs", logID + ".log.gz")));

		//Overwrite the .gz file with the uncompressed file to mantain the creation date.
		await rename(join(process.env.SERVER_DIR as string, "logs", logID + ".log.gz"), join(process.env.SERVER_DIR as string, "logs", logID + ".log"));
		await writeFile(join(process.env.SERVER_DIR as string, "logs", logID + ".log"), log, { encoding: "utf8" });

		const { birthtime } = await stat(join(process.env.SERVER_DIR as string, "logs", logID + ".log"));

		res.status(200).json({ log: log.toString(), creationDate: birthtime.getTime() });
	} else if (await exists(join(process.env.SERVER_DIR as string, "logs", logID + ".log"))) {
		const log = await readFile(join(process.env.SERVER_DIR as string, "logs", logID + ".log"), "utf8");
		const { birthtime } = await stat(join(process.env.SERVER_DIR as string, "logs", logID + ".log"));
		res.status(200).json({ log, creationDate: birthtime.getTime() });
	} else {
		res.sendStatus(404);
	}
});

logsRouter.delete("/logs", async (req: Request, res: Response) => {
	const { log } = req.body;

	if (log != undefined) {
		if (await exists(join(process.env.SERVER_DIR as string, "logs", log + ".log.gz"))) {
			await unlink(join(process.env.SERVER_DIR as string, "logs", log + ".log.gz"));
		} else if (await exists(join(process.env.SERVER_DIR as string, "logs", log + ".log"))) {
			await unlink(join(process.env.SERVER_DIR as string, "logs", log + ".log"));
		} else {
			return res.sendStatus(404);
		}

		const updatedLogs = await readdir(join(process.env.SERVER_DIR as string, "logs"));

		let logs: Log[] = [];

		for (const log of updatedLogs) {
			const logsStats = await stat(join(process.env.SERVER_DIR as string, "logs", log));
			logs.push({ name: log.replace(/(\.log)|(\.gz)/g, ""), creationDate: logsStats.birthtime.getTime() });
		}
		res.json({ logs });
	} else {
		res.sendStatus(400);
	}
});

export const exists = async (path: string) => {
	try {
		await access(path);
		return true;
	} catch (e) {
		return false;
	}
};

export const checkForLogExpirtion = async () => {
	const logsRaw = await readdir(join(process.env.SERVER_DIR as string, "logs"));

	for (const log of logsRaw) {
		const logsStats = await stat(join(process.env.SERVER_DIR as string, "logs", log));

		if (logsStats.birthtime.getTime() + 1000 * 60 * 60 * 24 * settingsManager.settings.autoDelete.deleteAfter < Date.now()) {
			await unlink(join(process.env.SERVER_DIR as string, "logs", log));
		}
	}
};

setTimeout(() => {
	settingsManager.on("load", (settings) => {
		if (settings.autoDelete.enabled) {
			checkForLogExpirtion();
			expirationInterval = setInterval(checkForLogExpirtion, 1000 * 60 * 60 * 24 * settingsManager.settings.autoDelete.deleteAfter);
		}
	});

	settingsManager.on("update", (update: SettingsUpdate) => {
		if (update.oldSettings.autoDelete.enabled != update.newSettings.autoDelete.enabled) {
			if (update.newSettings.autoDelete.enabled) {
				checkForLogExpirtion();
				expirationInterval = setInterval(checkForLogExpirtion, 1000 * 60 * 60 * 24);
			} else {
				clearInterval(expirationInterval);
			}
		}
	});
}, 2000);

export interface SettingsUpdate {
	oldSettings: Settings;
	newSettings: Settings;
}

export default logsRouter;
