import chalk from "chalk";
import { Request, Response, Router } from "express";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { settingsManager } from ".";
import { defaultsDeep } from "lodash";

const settingsRouter = Router();

settingsRouter.get("/settings", async (_req: Request, res: Response) => {
	res.status(200).json(settingsManager.settings);
});

settingsRouter.post("/settings", async (req: Request, res: Response) => {
	const filteredSettings: Settings = filterSettings(req.body, Object.keys(SettingsManager.defaultSettings)) as Settings;

	settingsManager.updateSettings(defaultsDeep(filteredSettings, SettingsManager.defaultSettings));
	res.sendStatus(200);
});

export class SettingsManager {
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
				this.saveToFile(SettingsManager.defaultSettings);
				this.settings = SettingsManager.defaultSettings;
				return this.settings;
			} else if (error instanceof SyntaxError) {
				console.error(chalk.red("Error parsing settings.json: " + error.message));
				console.log(chalk.yellow("Reverting to default settings."));

				this.saveToFile(SettingsManager.defaultSettings);
				this.settings = SettingsManager.defaultSettings;
				return this.settings;
			} else {
				console.error(chalk.red(new Error("Unexpected error occured when reading the settings.")));
				throw error;
			}
		}
	}

	async saveToFile(settings: Settings) {
		await writeFile(join(process.cwd(), "settings.json"), JSON.stringify(settings, null, 4), "utf8");
	}

	async updateSettings(settings: Settings) {
		this.settings = settings;
		await this.saveToFile(settings);
	}
}

//This is a mess I know
const filterSettings = (obj: any, keys: string[]): Object => {
	return Object.keys(obj)
		.filter((key) => keys.includes(key)) //Filter the keys - only keep the ones we want
		.reduce((reducedObj: any, key) => {
			// Create the new object with the filtered keys if property is an object filter it recrusevly
			if (typeof obj[key] === "object") {
				reducedObj[key] = filterSettings(obj[key], Object.keys((SettingsManager.defaultSettings as any)[key]));
			} else {
				reducedObj[key] = obj[key];
			}
			return reducedObj;
		}, {});
};

interface Settings {
	shutdownDelay: {
		enabled: boolean;
		delay: number;
		message: string;
	};
}

export default settingsRouter;
