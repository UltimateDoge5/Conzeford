import chalk from "chalk";
import { Request, Response, Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { type } from "os";
import { join } from "path";
import { settingsReader } from ".";

const settingsRouter = Router();

settingsRouter.get("/settings", async (_req: Request, res: Response) => {
	res.status(200).json(settingsReader.settings);
});

settingsRouter.post("/settings", async (req: Request, res: Response) => {
	const filteredSettings: Settings = Object.keys(req.body)
		.filter((key) => Object.keys(SettingsReader.defaultSettings).includes(key))
		.reduce((obj: any, key) => {
			obj[key] = req.body[key];
			return obj;
		}, {});

	settingsReader.updateSettings({ ...settingsReader.settings, ...filteredSettings });
	res.sendStatus(200);
});

export class SettingsReader {
	settings!: Settings;
	static defaultSettings: Settings = {
		shutdownDelay: {
			enabled: true,
			delay: 10,
			message: "Server will shutdown in {delay} seconds."
		}
	};

	constructor() {
		this.loadFromFile();
	}

	async loadFromFile() {
		try {
			this.settings = JSON.parse((await readFile(join(process.cwd(), "settings.json"), "utf8")) || "{}");
			return this.settings;
		} catch (error: any) {
			if (error.code === "ENOENT") {
				console.log(chalk.yellow("No settings.json found. Creating a new one."));

				this.saveToFile(SettingsReader.defaultSettings);
				this.settings = SettingsReader.defaultSettings;
				return this.settings;
			} else {
				console.log(chalk.red(new Error("Unexpected error occured when reading the settings.")));
				throw error;
			}
		}
	}

	async saveToFile(settings: Settings) {
		// const filteredSettings =  settings.filter

		await writeFile(join(process.cwd(), "settings.json"), JSON.stringify(settings, null, 4), "utf8");
	}

	async updateSettings(settings: Settings) {
		this.settings = settings;
		await this.saveToFile(settings);
	}
}

interface Settings {
	shutdownDelay: {
		enabled: boolean;
		delay: number;
		message: string;
	};
}

export default settingsRouter;
