import { useState } from "react";
import FormSwitch from "../formSwitch/formSwitch";

import styles from "../../styles/settings.module.scss";

const AuthenticationForm = ({ onSubmit, authEnabled }: FormProps) => {
	const [auth, setAuth] = useState({ enabled: authEnabled.enabled, oldPassword: "", newPassword: "" });
	const [error, setError] = useState({ oldPassword: "", newPassword: "", globalError: "" });

	const validatePassword = (password: string) => {
		if (password.length < 8) {
			return "Password must be at least 8 characters long";
		} else if (password.length > 32) {
			return "Password must be less than 32 characters long";
		} else {
			return "";
		}
	};

	const canChangePassword = () => {
		if (!authEnabled.hash && !validatePassword(auth.newPassword) && !error.newPassword) {
			return true;
		} else if (authEnabled.hash && authEnabled.enabled != auth.enabled && !(!!auth.oldPassword || !!auth.newPassword)) {
			return true;
		}

		return !validatePassword(auth.oldPassword) && !validatePassword(auth.newPassword);
	};

	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<h2>Authentication settings</h2>
			<hr />

			<div className={styles.formGroup}>
				<div>
					<label htmlFor="enabled">Enable auth</label>
					<FormSwitch state={auth.enabled} onChange={(v) => setAuth({ ...auth, enabled: v })} />
				</div>

				<hr></hr>

				<div>
					<label htmlFor="oldPass">Old password</label>
					<input
						id="oldPass"
						name="oldPass"
						type="password"
						placeholder={authEnabled.hash ? "" : "No previos password"}
						value={auth.oldPassword}
						onChange={(v) => setAuth({ ...auth, oldPassword: v.target.value.trim() })}
						disabled={!auth.enabled || !authEnabled.hash}
						onBlur={(e) => {
							if (auth.oldPassword.length > 0 && auth.newPassword.length > 0 && auth.newPassword == auth.oldPassword) {
								setError({
									...error,
									globalError: "New password must be different from old password",
									oldPassword: validatePassword(e.target.value)
								});
							} else {
								setError({ ...error, globalError: "", oldPassword: validatePassword(e.target.value) });
							}
						}}
					/>
				</div>
				<span className={styles.error}>{auth.enabled && error.oldPassword}</span>

				<div>
					<label htmlFor="newPass">New password</label>
					<input
						id="newPass"
						name="newPass"
						type="password"
						minLength={8}
						value={auth.newPassword}
						onChange={(v) => setAuth({ ...auth, newPassword: v.target.value.trim() })}
						onBlur={(e) => {
							if (auth.oldPassword.length > 0 && auth.newPassword.length > 0 && auth.newPassword == auth.oldPassword) {
								setError({
									...error,
									globalError: "New password must be different from old password",
									newPassword: validatePassword(e.target.value)
								});
							} else {
								setError({ ...error, globalError: "", newPassword: validatePassword(e.target.value) });
							}
						}}
						disabled={!auth.enabled}
					/>
				</div>
				<span className={styles.error}>{auth.enabled && error.newPassword}</span>
				<hr></hr>

				<div style={{ display: "flex" }}>
					<span className={styles.error} style={{ width: "50%", display: "block", textAlign: "left", position: "static" }}>
						{auth.enabled && error.globalError}
					</span>
					<div className={styles.btnGroup} style={{ width: "50%" }}>
						<button onClick={() => onSubmit(auth)} className="button danger" disabled={!canChangePassword()}>
							Update auth
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

interface FormProps {
	onSubmit: (v: Authentication) => void;
	authEnabled: {
		enabled: boolean;
		hash: string | null;
	};
}

interface Authentication {
	enabled: boolean;
	oldPassword: string;
	newPassword: string;
}

export default AuthenticationForm;
