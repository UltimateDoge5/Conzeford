const socket = new WebSocket("ws://localhost:8080");

const serverStatusText = document.querySelector("#status span") as HTMLSpanElement;
const serverStatusLed = document.querySelector("#status svg circle") as SVGAElement;
const sidebar = document.querySelector("#sidebar") as HTMLDivElement;

let serverStatus = { enabled: false, isStarting: false, isStopping: false };

socket.addEventListener("message", (event) => {
	const parsedMessage = JSON.parse(event.data);

	switch (parsedMessage.event) {
		case "status":
			serverStatus = parsedMessage.status;

			if (serverStatus.enabled) {
				document.dispatchEvent(new Event("serverStart"));
				serverStatusText.innerHTML = "Running";
				serverStatusLed.style.fill = "#64BD3A";
			} else if (serverStatus.isStarting) {
				document.dispatchEvent(new Event("serverStarting"));
				serverStatusText.innerHTML = "Starting";
				serverStatusLed.style.fill = "#ffdd00";
			} else if (serverStatus.isStopping) {
				document.dispatchEvent(new Event("serverStopping"));
				serverStatusText.innerHTML = "Stopping";
				serverStatusLed.style.fill = "#ffdd00";
			} else {
				document.dispatchEvent(new Event("serverStop"));
				serverStatusText.innerHTML = "Stopped";
				serverStatusLed.style.fill = "#FB4747";
			}
			break;
	}
});

document.querySelector(".navLink")?.addEventListener("click", (e) => {
	const toggle = sidebar.style.width == "6rem";
	sidebar.style.width = toggle ? "12rem" : "6rem";

	document.querySelectorAll<HTMLSpanElement>(".linkText").forEach((link) => {
		link.style.opacity = toggle ? "1" : "0";
	});
});

document.querySelectorAll<HTMLAnchorElement>(".navLink").forEach((link) => {
	if (document.location.pathname == (link.getAttribute("href") as string)) {
		link.classList.add("active");

		//The console svg icon does not like fill to be changed, so we remove it
		if ((link.getAttribute("href") as string) == "/console") {
			link.querySelector("path")?.classList.add("noFill");
		}
	}
});
