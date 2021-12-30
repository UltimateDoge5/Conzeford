const serverToggle = document.querySelector("#serverToggle") as HTMLButtonElement;

document.addEventListener("serverStart", () => {
	serverToggle.innerText = "Stop";
	serverToggle.disabled = false;
});

document.addEventListener("serverStarting", () => {
	serverToggle.disabled = true;
});

document.addEventListener("serverStopping", () => {
	serverToggle.disabled = true;
});

document.addEventListener("serverStop", () => {
	serverToggle.innerText = "Start";
	serverToggle.disabled = false;
});

serverToggle.addEventListener("click", () => {
	if (!serverStatus.enabled) {
		socket.send(JSON.stringify({ event: "start" }));
	} else {
		socket.send(JSON.stringify({ event: "stop" }));
	}
});
