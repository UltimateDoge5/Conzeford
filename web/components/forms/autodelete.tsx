import { useState } from "react";
import { objectDiffrence } from "../../pages/settings";
import styles from "../../styles/settings.module.scss";
import FormSwitch from "../formSwitch/formSwitch";

const Autodelete = ({ initialValues, onSubmit }: FormProps) => {
	const [autodelete, setAutodelete] = useState<Autodelete>(initialValues);

	return (
		<form onSubmit={(e) => e.preventDefault()}>
			<h2>Autodelete settings</h2>
			<hr />
			<div className={styles.formGroup}>
				<div style={{ padding: "8px" }}>
					<label htmlFor="autoDeletelogsEnabled">Enable autodelete</label>
					<FormSwitch state={autodelete.enabled} onChange={(v) => setAutodelete({ ...autodelete, enabled: v })} />
				</div>
				<hr />
				<div>
					<label htmlFor="deleteAfter">Delete after (days)</label>
					<input
						type="number"
						name="deleteAfter"
						id="deleteAfter"
						min="10"
						max="1095"
						autoComplete="off"
						disabled={!autodelete.enabled}
						value={autodelete.deleteAfter}
						onChange={(v) => setAutodelete({ ...autodelete, deleteAfter: parseInt(v.target.value) || 30 })}
					/>
				</div>
			</div>
			<hr />
			<div>
				<div className={styles.btnGroup}>
					<button
						className="button"
						type="submit"
						onClick={() => onSubmit(autodelete)}
						disabled={Object.keys(objectDiffrence(initialValues, autodelete)).length == 0}
					>
						Save
					</button>
					<button className="button secondary" type="reset" onClick={() => setAutodelete(initialValues)}>
						Reset
					</button>
				</div>
			</div>
		</form>
	);
};

interface FormProps {
	onSubmit: (values: Autodelete) => void;
	initialValues: Autodelete;
}

interface Autodelete {
	enabled: boolean;
	deleteAfter: number;
}

export default Autodelete;
