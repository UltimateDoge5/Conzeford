import chalk from "chalk";
import { Request, Response, Router } from "express";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { settingsManager } from ".";
import { defaultsDeep } from "lodash";
import { exists, SettingsUpdate } from "./logs";
import { EventEmitter } from "stream";
import { readFileSync } from "fs";

const settingsRouter = Router();

settingsRouter.get("/settings", async (_req: Request, res: Response) => {
	res.status(200).json({
		...settingsManager.settings,
		auth: { ...settingsManager.settings.auth, hash: settingsManager.settings.auth.hash != null ? "hash" : null }
	});
});

settingsRouter.post("/settings", async (req: Request, res: Response) => {
	if (req.body.auth) {
		delete req.body.auth;
	}

	await settingsManager.updateSettings(req.body);
	res.sendStatus(200);
});

export class SettingsManager extends EventEmitter {
	settings!: Settings;
	static defaultSettings: Settings = {
		shutdownDelay: {
			enabled: true,
			delay: 10,
			message: "Server will shutdown in {delay} seconds."
		},
		autoDelete: {
			enabled: false,
			deleteAfter: 30
		},
		auth: {
			enabled: false,
			hash: null
		}
	};

	constructor() {
		super();
		this.loadFromFile();

		(async () => {
			if (!(await exists(join(process.cwd(), "logs")))) {
				await mkdir(join(process.cwd(), "logs"));
			}
		})();
	}

	//This function has to be synchronous - other fucntions need the settings
	//Global async/await functions are not allowed in the constructor
	loadFromFile() {
		try {
			this.settings = JSON.parse(readFileSync(join(process.cwd(), "settings.json"), "utf8") || "{}");
			this.settings = defaultsDeep(this.settings, SettingsManager.defaultSettings);
			this.emit("load", this.settings);
		} catch (error: any) {
			if (error.code === "ENOENT") {
				console.log(chalk.yellow("No settings.json found. Creating a new one."));
				this.saveToFile(SettingsManager.defaultSettings);
				this.settings = SettingsManager.defaultSettings;
				this.emit("load", this.settings);
			} else if (error instanceof SyntaxError) {
				console.error(chalk.red("Error parsing settings.json: " + error.message));
				console.log(chalk.yellow("Reverting to default settings."));

				this.saveToFile(SettingsManager.defaultSettings);
				this.settings = SettingsManager.defaultSettings;
				this.emit("load", this.settings);
			} else {
				console.error(chalk.red(new Error("Unexpected error occured when reading the settings.")));
				throw error;
			}
		}
	}

	async saveToFile(settings: Settings) {
		await writeFile(join(process.cwd(), "settings.json"), JSON.stringify(settings, null, 4), "utf8");
	}

	async updateSettings(settings: any) {
		const filteredSettings: Settings = filterSettings(settings, Object.keys(SettingsManager.defaultSettings)) as Settings;

		const updatedSettings = defaultsDeep(filteredSettings, settingsManager.settings, SettingsManager.defaultSettings);

		this.emit("update", { oldSettings: this.settings, newSettings: updatedSettings } as SettingsUpdate);
		this.settings = updatedSettings;
		await this.saveToFile(updatedSettings);
	}
}

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

export default settingsRouter;
