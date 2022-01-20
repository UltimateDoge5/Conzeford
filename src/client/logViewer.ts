fetch(`/api/log/${window.location.pathname.split("/")[2]}`).then(async (fetchedLog) => {
	if (fetchedLog.status == 200) {
		const log = await fetchedLog.json();

		document.title = `Log - ${window.location.pathname.split("/")[2]}`;
		(document.querySelector("nav h1") as HTMLHeadingElement).innerText = `Log - ${window.location.pathname.split("/")[2]}`;

		(document.querySelector("#name") as HTMLSpanElement).innerText = `Name: ${window.location.pathname.split("/")[2]}`;
		(document.querySelector("#date") as HTMLSpanElement).innerText = `Creation date: ${new Date(log.creationDate).toLocaleString()}`;

		(document.querySelector("#logViewer section") as HTMLDivElement).innerText = log.log;
	} else {
		(document.querySelector("main") as HTMLDivElement).className = "notFound";
		(document.querySelector("main") as HTMLDivElement).innerHTML = "<h1>It seems that this log does not exits. </h1> <a href='/logs'>Take me back!</a>";
	}
});

document.querySelector("#delete")?.addEventListener("click", async () => {
	const response = await fetch(`/api/logs`, {
		method: "DELETE",
		body: JSON.stringify({ log: window.location.pathname.split("/")[2] }),
		headers: { "Content-Type": "application/json" }
	});

	(document.querySelector("main") as HTMLDivElement).className = "notFound";
	if (response.status === 200) {
		(document.querySelector("main") as HTMLDivElement).innerHTML = "<h1>Your log has been deleted. </h1> <a href='/logs'>Take me back!</a>";
	} else if (response.status === 404) {
		(document.querySelector("main") as HTMLDivElement).innerHTML =
			"<h1>This log does not exits. Someone was faster thatn you...</h1> <a href='/logs'>Take me back!</a>";
	}
});
