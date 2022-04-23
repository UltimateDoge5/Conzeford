import styles from "../styles/navbar.module.scss";

const Navbar = ({ title }: NavbarProps) => {
	return (
		<nav className={styles.navbar}>
			<h1>{title}</h1>
			<h2>Status</h2>
			<div>
				<svg className="statusLed" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="10" cy="10" r="10" fill="#FB4747" />
				</svg>
				<span className="statusText">Stopped</span>
			</div>
		</nav>
	);
};

interface NavbarProps {
	title: string;
}

export default Navbar;
