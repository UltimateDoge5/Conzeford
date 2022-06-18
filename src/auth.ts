import { NextFunction, Request, Response, Router } from "express";
import { compare, hash } from "bcrypt";
import { settingsManager } from ".";
import { randomBytes } from "crypto";

const authRouter = Router();

authRouter.post("/toggleAuth", async (req: Request, res: Response) => {
	const { enabled } = req.body;

	if (enabled) {
		if (settingsManager.settings.auth.hash == null) {
			const password = randomBytes(16).toString("hex");
			await settingsManager.updateSettings({
				auth: {
					enabled: true,
					hash: await hash(password, 10)
				}
			});

			res.json({ password });
		} else {
			await settingsManager.updateSettings({
				auth: {
					enabled: true
				}
			});

			res.sendStatus(200);
		}
	} else {
		await settingsManager.updateSettings({
			auth: {
				enabled: false
			}
		});

		res.sendStatus(200);
	}
});

authRouter.post("/password", async (req, res) => {
	let { password } = req.body;
	password = password.trim();

	if (password.length < 8) {
		res.status(400).json({ error: "Password must be at least 8 characters long." });
		return;
	} else if (password.length > 32) {
		res.status(400).json({ error: "Password must be less than 32 characters long." });
		return;
	}

	const passwordHash = await hash(password, 10);

	await settingsManager.updateSettings({
		auth: {
			hash: passwordHash
		}
	});
	res.sendStatus(200);
});

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
	if (!req.headers.authorization) {
		res.setHeader("WWW-Authenticate", 'Basic realm="Please login to access the dashboard.", charset="UTF-8"');
		res.status(401).send("Missing Authorization Header");
	} else {
		const auth = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString("ascii").split(":");
		if (auth[0] === "admin" && (await compare(auth[1], settingsManager.settings.auth.hash! || ""))) {
			next();
		} else {
			res.setHeader("WWW-Authenticate", 'Basic realm="Please login to access the dashboard.", charset="UTF-8"');
			res.status(401).send("Invalid credentials.");
		}
	}
};

export default authRouter;
