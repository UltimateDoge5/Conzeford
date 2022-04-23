import styles from "../styles/navbar.module.scss";
import { getLedColor, getStatusText } from "../utils/status";

const Navbar = ({ title, status }: NavbarProps) => {
	return (
		<nav className={styles.navbar}>
			<h1>{title}</h1>
			<h2>Status</h2>
			<div>
				<svg className="statusLed" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="10" cy="10" r="10" fill={getLedColor(status)} />
				</svg>
				<span className="statusText">{getStatusText(status)}</span>
			</div>
		</nav>
	);
};

interface NavbarProps {
	title: string;
	status: ServerStatus;
}

export default Navbar;
