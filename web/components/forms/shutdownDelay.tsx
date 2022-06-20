import { Field, Form, Formik } from "formik";
import { useState } from "react";
import FormSwitch from "../formSwitch/formSwitch";

import styles from "../../styles/settings.module.scss";
import { objectDiffrence } from "../../pages/settings";

const ShutdownDelayForm = ({ onSubmit, initialValues }: FormProps) => {
	const [shutdownDelay, setShutdownDelay] = useState(initialValues);

	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<h2>Shutdown delay settings</h2>
			<hr />

			<div className={styles.formGroup}>
				<div>
					<label htmlFor="enabled">Enable shutdown delay</label>
					<FormSwitch state={shutdownDelay.enabled} onChange={(v) => setShutdownDelay({ ...shutdownDelay, enabled: v })} />
				</div>

				<hr></hr>

				<div>
					<label htmlFor="delay">Delay</label>
					<input
						id="delay"
						name="delay"
						placeholder="10"
						type="number"
						min={10}
						value={shutdownDelay.delay}
						onChange={(v) => setShutdownDelay({ ...shutdownDelay, delay: parseInt(v.target.value) || 10 })}
						disabled={!shutdownDelay.enabled}
					/>
				</div>

				<div>
					<label htmlFor="message">Message</label>
					<input
						id="message"
						name="message"
						value={shutdownDelay.message}
						onChange={(v) => setShutdownDelay({ ...shutdownDelay, message: v.target.value })}
						disabled={!shutdownDelay.enabled}
					/>
				</div>
				<hr></hr>

				<div className={styles.btnGroup}>
					<button
						onClick={() => onSubmit(shutdownDelay)}
						className="button primary"
						disabled={Object.keys(objectDiffrence(initialValues, shutdownDelay)).length == 0}
					>
						Save
					</button>
					<button type="reset" onClick={() => setShutdownDelay(initialValues)} className="button secondary">
						Reset
					</button>
				</div>
			</div>
		</form>
	);
};

interface FormProps {
	onSubmit: (values: ShutdownDelay) => void;
	initialValues: ShutdownDelay;
}

interface ShutdownDelay {
	delay: number;
	message: string;
	enabled: boolean;
}

export default ShutdownDelayForm;
