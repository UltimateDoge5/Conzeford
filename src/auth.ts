import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Router } from "express";
import { compare, hash } from "bcrypt";
import { settingsManager } from ".";
import { dirname, join } from "path";

const authRouter = Router();

authRouter.get("/login", function (_req, res, next) {
	res.sendFile(join(dirname(__dirname), "web/pages/login.html"));
});

authRouter.post("/password", async (req, res) => {
	const passwordHash = await hash(req.body.password.trim(), 10);

	await settingsManager.updateSettings({
		auth: {
			hash: passwordHash
		}
	});
	res.sendStatus(200);
});

//For tesin'
authRouter.get("/auth", (req, res) => {
	if (req.user) {
		res.send("auth");
	} else {
		res.send("authn't");
	}
});

passport.use(
	new LocalStrategy(async (username, password, cb) => {
		const comparision = await compare(password, settingsManager.settings.auth.hash as string);

		if (comparision) {
			//User contains nothing for now
			return cb(null, {});
		}

		return cb(null, false);
	})
);

passport.serializeUser(function (user, cb) {
	process.nextTick(function () {
		cb(null, { ...user });
	});
});

passport.deserializeUser(function (user: any, cb) {
	process.nextTick(function () {
		return cb(null, user);
	});
});

authRouter.post(
	"/login",
	passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/login"
	})
);

export default authRouter;
