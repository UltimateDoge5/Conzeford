import "../styles/globals.css";
import "../node_modules/xterm/css/xterm.css";

export const isBrowser = typeof window !== "undefined";
export const apiUrl = process.env.NODE_ENV == "development" ? "http://localhost:5454" : "";

function MyApp({ Component, pageProps }) {
	return <Component {...pageProps} />;
}

export default MyApp;
