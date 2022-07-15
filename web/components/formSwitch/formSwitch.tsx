import { useState } from "react";
import { Switch } from "@headlessui/react";
import styles from "./style.module.scss";

const FormSwitch = ({ state, onChange }: FormSwitchProps) => {
	const [enabled, setEnabled] = useState(state);

	return (
		<div style={{ padding: "0xp 64px" }}>
			<Switch
				checked={enabled}
				onChange={(v) => {
					setEnabled(v);
					onChange(v);
				}}
				style={{
					backgroundColor: enabled ? "rgb(37 99 235)" : "rgb(229 231 235)"
				}}
				className={styles.switch}
			>
				{/* <span className="sr-only">{label}</span> */}
				<span
					aria-hidden="true"
					style={enabled ? { transform: "translateX(1rem)" } : { transform: "translateX(0)" }}
					className={styles.label}
				/>
			</Switch>
		</div>
	);
};

interface FormSwitchProps {
	state: boolean;
	onChange: (state: boolean) => void;
}

export default FormSwitch;
