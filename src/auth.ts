import { NextFunction, Request, Response, Router } from "express";
import { compare, hash } from "bcrypt";
import { settingsManager } from ".";
import { randomBytes } from "crypto";

const authRouter = Router();

authRouter.post("/toggle", async (req: Request, res: Response) => {
	const { enabled } = req.body;

	if (!enabled) {
		await settingsManager.updateSettings({
			auth: {
				enabled: false
			}
		});

		return res.sendStatus(204);
	}

	if (settingsManager.settings.auth.hash == null) {
		const password = randomBytes(16).toString("hex");
		await settingsManager.updateSettings({
			auth: {
				enabled: true,
				hash: await hash(password, 10)
			}
		});

		return res.json({ password });
	}

	await settingsManager.updateSettings({
		auth: {
			enabled: true
		}
	});

	res.sendStatus(204);
});

authRouter.post("/password", async (req, res) => {
	let { oldPassword, newPassword } = req.body;
	newPassword = newPassword.trim();

	if (newPassword.length < 8) {
		return res.status(400).json({ error: "Password must be at least 8 characters long." });
	} else if (newPassword.length > 32) {
		return res.status(400).json({ error: "Password must be less than 32 characters long." });
	}

	if (settingsManager.settings.auth.hash == null) {
		return res.status(400).json({ error: "No password set." });
	}

	if (!(await compare(oldPassword.trim(), settingsManager.settings.auth.hash))) {
		return res.status(400).json({ error: "Incorrect old password." });
	}

	const passwordHash = await hash(newPassword, 10);

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
		return res.status(401).send("Missing Authorization Header");
	}

	const auth = Buffer.from(req.headers.authorization.split(" ")[1], "base64").toString("ascii").split(":");
	if (auth[0] === "admin" && (await compare(auth[1], settingsManager.settings.auth.hash! || ""))) {
		next();
	} else {
		res.setHeader("WWW-Authenticate", 'Basic realm="Please login to access the dashboard.", charset="UTF-8"');
		res.status(401).send("Invalid credentials.");
	}
};

export default authRouter;
