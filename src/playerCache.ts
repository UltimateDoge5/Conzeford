import { Router, Request, Response } from "express";
import { createWriteStream, existsSync, mkdirSync } from "fs";
import { readFile, writeFile } from "fs/promises";
import { uuidCache } from ".";
import { exists } from "./logs";
import axios from "axios";
import { Stream } from "stream";

export const headsRouter = Router();

class PlayerCache {
	private cache = new Map<string, string>();

	constructor() {
		if (!existsSync("cache")) {
			mkdirSync("cache");
		}

		if (!existsSync("cache/playerCache.json")) {
			this.saveCache();
		}

		if (!existsSync("cache/heads")) {
			mkdirSync("cache/heads");
		}

		this.loadCache();
	}

	async loadCache() {
		const playerCache: PlayerCacheObj = JSON.parse((await readFile("cache/playerCache.json")).toString());

		for (const [key, value] of Object.entries(playerCache)) {
			this.cache.set(key, value);
		}
	}

	async getPlayerUUID(player: string) {
		if (this.cache.has(player)) {
			return this.cache.get(player);
		}

		const response = await axios.get<UuidResponse>(`https://api.mojang.com/users/profiles/minecraft/${player}`, { responseType: "json" });
		if (response.status !== 200) return;

		const uuid = response.data.id;
		this.cache.set(player, uuid);

		await this.saveCache();

		return uuid;
	}

	async getPlayerHead(player: string, refresh = false) {
		const uuid = await this.getPlayerUUID(player);

		if (uuid == undefined) return undefined;

		if ((await exists(`cache/heads/${uuid}.png`)) && !refresh) {
			return await readFile(`cache/heads/${uuid}.png`);
		}

		const response = await axios.get<ArrayBuffer>(`https://crafatar.com/avatars/${uuid}`, { responseType: "arraybuffer" });

		if (response.status !== 200) return undefined;
		const buffer = Buffer.from(response.data);

		await writeFile(`cache/heads/${uuid}.png`, buffer);

		return buffer;
	}

	async saveCache() {
		await writeFile("cache/playerCache.json", JSON.stringify(Object.fromEntries(this.cache)));
	}
}

headsRouter.get("/playerHead/:nickname", async (req: Request, res: Response) => {
	if (req.params.nickname == undefined) {
		return res.sendStatus(400);
	}

	const nickname = req.params.nickname as string;
	const playerHead = await uuidCache.getPlayerHead(nickname, req.query.refresh === "true");

	if (playerHead != undefined) {
		res.setHeader("Content-Type", "image/png").send(playerHead);
	} else {
		res.sendStatus(404);
	}
});

interface UuidResponse {
	name: string;
	id: string;
}

interface PlayerCacheObj {
	[key: string]: string;
}

export default PlayerCache;
