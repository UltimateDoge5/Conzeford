import "../styles/globals.css";
import "../node_modules/xterm/css/xterm.css";
import { Portal } from "@headlessui/react";

export const isBrowser = typeof window !== "undefined";
export const apiUrl = process.env.NODE_ENV == "development" ? "http://localhost:5454" : "";

// export const port = await (async (): Promise<string> => {
// 	if (!isBrowser) return "";

// 	let port = localStorage.getItem("port");
// 	if (port) return port;

// 	port = await (await fetch(`${apiUrl}/socketPort`)).json();
// 	localStorage.setItem("port", port);

// 	return port;
// })();

const App = ({ Component, pageProps }) => {
	return <Component {...pageProps} />;
};

export default App;
