import Head from "next/head";
import { useState, useEffect, useRef } from "react";
import Navbar from "../components/navbar";
import Sidebar from "../components/sidebar";
import { apiUrl, isBrowser } from "./_app";

import styles from "../styles/settings.module.scss";
import ShutdownDelayForm from "../components/forms/shutdownDelay";
import Autodelete from "../components/forms/autodelete";
import AuthenticationForm from "../components/forms/auth";

const Settings = () => {
	const [wsInstance] = useState(() => (isBrowser ? new WebSocket("ws://localhost:5454") : null));
	const [status, setStatus] = useState<ServerStatus>({ enabled: false, isStarting: false, isStopping: false, players: null, startDate: null });

	const [settings, setSettings] = useState<Settings>({} as Settings);
	const updateRef = useRef<boolean>(false);

	useEffect(() => {
		if (isBrowser) {
			wsInstance.onmessage = (event) => {
				const data = JSON.parse(event.data);
				if (data.event === "status") {
					setStatus(data.status);
				}
			};

			wsInstance.onclose = () => {
				setStatus({ enabled: false, isStarting: false, isStopping: false, players: [], startDate: null, disconnected: true });
			};
		}
	}, [wsInstance]);

	useEffect(() => {
		fetch(`${apiUrl}/api/settings`)
			.then((res) => res.json())
			.then((res) => setSettings(res));
	}, []);

	useEffect(() => {
		if (updateRef.current) {
			(async () => {
				const res = await fetch(`${apiUrl}/api/settings`, {
					method: "POST",
					body: JSON.stringify(settings),
					headers: {
						"Content-Type": "application/json"
					}
				});

				updateRef.current = false;
				console.log(res.status);
			})();
		}
	}, [settings]);

	return (
		<>
			<Head>
				<title>Settings</title>
			</Head>
			<Sidebar />
			<Navbar title="Settings" status={status} />

			<main className={styles.settings}>
				<section>
					<div className={styles.description}>
						<h1>Shutdown delay</h1>
						<p>
							A delay that will befor shutting down the server. After initiating the shutdown players will be messaged that the shutdown
							will take place in X amount of time.
							<br />
							<br />
							The delay and the message are configurable.
						</p>
					</div>

					{settings?.shutdownDelay ? (
						<ShutdownDelayForm
							onSubmit={(v) => {
								updateRef.current = true;
								setSettings({ ...settings, shutdownDelay: v });
							}}
							initialValues={settings?.shutdownDelay}
						/>
					) : (
						<form>
							<div className="spinner dark"></div>
						</form>
					)}
				</section>
				<hr />
				<section>
					<div className={styles.description}>
						<h1>Autodelete logs</h1>
						<p>Automaticly delete logs after a certain amount of days have passed from their creation.</p>
					</div>

					{settings?.autoDelete ? (
						<Autodelete onSubmit={() => {}} initialValues={settings?.autoDelete} />
					) : (
						<form>
							<div className="spinner dark"></div>
						</form>
					)}
				</section>
				<hr />

				<section>
					<div className={styles.description}>
						<h1>Authentication</h1>
						<p>
							To access the dashboard or any other page, you will need to be authenticated with a username and a password.
							<br />
							<br />
							The username is always <b>admin</b>! <br />
							The password is configurable, however the <b>username is not</b>.
						</p>
					</div>

					{/* <form id="auth" className="togglable skip">
						<h2>Authentication settings</h2>
						<hr />
						<div id="formGroup">
							<div style={{ padding: "8px" }}>
								<label htmlFor="authEnabled">Enable auth</label>
								<label className="checkbox">
									<input type="checkbox" name="enabled" id="authEnabled" autoComplete="off" disabled={true} />
									<span className="check" style={{ paddingLeft: "0px" }}></span>
									<span className="label">Enabled</span>
								</label>
							</div>
						</div>
						<hr />
						<div>
							<span id="notification"></span>
							<div id="btnGroup">
								<button className="button danger" type="button">
									Manage auth
								</button>
							</div>
						</div>
					</form> */}

					{settings?.autoDelete ? (
						<AuthenticationForm
							authEnabled={settings.auth}
							onSubmit={async (auth) => {
								let oldPassword = auth.oldPassword;
								if (auth.enabled != settings.auth.enabled) {
									const res = await fetch(`${apiUrl}/auth/toggle`, {
										method: "POST",
										body: JSON.stringify({ enabled: auth }),
										headers: {
											"Content-Type": "application/json"
										}
									});

									if (res.status == 200) {
										const { password } = await res.json();
										if (password != undefined) {
											oldPassword = password;
										}
									}
								}

								await fetch(`${apiUrl}/auth/password`, {
									method: "POST",
									body: JSON.stringify({ oldPassword, newPassword: auth.newPassword }),
									headers: {
										"Content-Type": "application/json"
									}
								});
							}}
						/>
					) : (
						<form>
							<div className="spinner dark"></div>
						</form>
					)}
				</section>
			</main>
		</>
	);
};

export const objectDiffrence = (first: any, second: any): Object => {
	if (!second || Object.prototype.toString.call(second) !== "[object Object]") {
		return first;
	}

	const diffrence: any = {};
	let key;

	const arraysMatch = function (arr1: any[], arr2: any[]) {
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}

		return true;
	};

	const compareObjects = (item1: any, item2: any, key: string) => {
		const type1 = Object.prototype.toString.call(item1);
		const type2 = Object.prototype.toString.call(item2);

		if (type1 !== type2) {
			//If the types are diffrent
			diffrence[key] = item2;
		} else if (type1 === "[object Object]") {
			//If its an object
			const objDiff = objectDiffrence(item1, item2);
			if (Object.keys(objDiff).length > 0) {
				diffrence[key] = objDiff;
			}
		} else if (type1 === "[object Array]") {
			//If its an array
			if (!arraysMatch(item1, item2)) {
				diffrence[key] = item2;
			}
		} else {
			if (item1 !== item2) {
				diffrence[key] = item2;
			}
		}
	};

	for (key in first) {
		if (first.hasOwnProperty(key)) {
			compareObjects(first[key], second[key], key);
		}
	}
	for (key in second) {
		if (second.hasOwnProperty(key)) {
			if (!first[key] && first[key] !== second[key]) {
				diffrence[key] = second[key];
			}
		}
	}

	return diffrence;
};

export default Settings;
