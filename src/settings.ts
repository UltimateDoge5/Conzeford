import chalk from "chalk";
import { Request, Response, Router } from "express";
import { appendFile, readFile, writeFile } from "fs/promises";
import { join } from "path";
import { settingsManager } from ".";
import { clone, defaultsDeep } from "lodash";
import { SettingsUpdate } from "./logs";
import { EventEmitter } from "stream";
import { randomBytes } from "crypto";

const settingsRouter = Router();

settingsRouter.get("/settings", async (_req: Request, res: Response) => {
	const settingsClone = clone(settingsManager.settings);
	settingsClone.auth.hash = null;

	res.status(200).json(settingsClone);
});

settingsRouter.post("/settings", async (req: Request, res: Response) => {
	await settingsManager.updateSettings(req.body);
	res.sendStatus(200);
});

export class SettingsManager extends EventEmitter {
	settings!: Settings;
	secret!: string;
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

		if (!process.env.SECRET || process.env.SECRET.length < 16) {
			this.secret = randomBytes(16).toString("hex");
			appendFile(join(process.cwd(), "config.env"), `\nSECRET="${this.secret}" #Do not modify`, "utf8");
		} else {
			this.secret = process.env.SECRET;
		}

		this.loadFromFile();
	}

	async loadFromFile() {
		try {
			this.settings = JSON.parse((await readFile(join(process.cwd(), "settings.json"), "utf8")) || "{}");
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

export default settingsRouter;
