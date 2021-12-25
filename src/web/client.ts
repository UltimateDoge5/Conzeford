const socket = new WebSocket("ws://localhost:8080");
const outputElement = document.querySelector("output") as HTMLOutputElement;
const serverToggle = document.querySelector("#serverToggle") as HTMLButtonElement;
const serverStatusText = document.querySelector("#serverStatus") as HTMLSpanElement;

const serverStatus = { enabled: false };

socket.onmessage = (event) => {
	const parsedMessage = JSON.parse(event.data);

	switch (parsedMessage.event) {
		case "log":
			outputElement.innerHTML += `<span style="color:${parsedMessage.color}">${parsedMessage.log}</span><br>`;
			break;
		case "status":
			serverStatus.enabled = parsedMessage.enabled;
			serverStatusText.innerHTML = serverStatus.enabled ? "Enabled" : "Disabled";
			break;
	}
};

serverToggle.addEventListener("click", () => {
	if (!serverStatus.enabled) {
		socket.send(JSON.stringify({ event: "start" }));
		serverToggle.innerText = "Stop";
		outputElement.innerHTML = "";
	} else {
		socket.send(JSON.stringify({ event: "stop" }));
		serverToggle.innerText = "Start";
	}
});
