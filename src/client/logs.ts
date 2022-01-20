const table = document.querySelector("table") as HTMLTableElement;
let logs: Log[] = [];

fetch("/api/logs")
	.then((logs) => logs.json())
	.then((fetchedLogs) => {
		logs = sortDescending(fetchedLogs.logs);

		displayLogs(logs);

		document.querySelectorAll<HTMLButtonElement>(".delete").forEach(async (button) => {
			button.addEventListener("click", async (event) => {
				const response = await fetch(`/api/logs`, {
					method: "DELETE",
					body: JSON.stringify({ log: button.dataset.log }),
					headers: { "Content-Type": "application/json" }
				});

				if (response.status == 200) {
					if (document.querySelector<HTMLButtonElement>("#sort")?.style.transform == "rotate(180deg)") {
						logs = sortDescending((await response.json()).logs);
					} else {
						logs = sortAscending((await response.json()).logs);
					}

					document.querySelectorAll(".log").forEach((log) => log.remove());
					displayLogs(logs);
				}
			});
		});
	});

const displayLogs = (logs: Log[]) => {
	for (const log of logs) {
		const logElement = table.insertRow();
		logElement.className = "log";
		const index = logElement.insertCell();
		index.style.width = "5%";
		index.innerText = (table.rows.length - 1).toString();

		const nameCell = logElement.insertCell();
		const logName = document.createElement("a");
		logName.innerText = log.name.split(".")[0];
		logName.href = `/logs/${log.name}`;
		nameCell.appendChild(logName);

		const dateCell = logElement.insertCell();
		dateCell.innerText = new Date(log.creationDate).toLocaleString();

		const deleteCell = logElement.insertCell();
		deleteCell.style.width = "5%";

		const deleteButton = document.createElement("button");
		deleteButton.style.margin = "auto";
		deleteButton.className = "delete";
		deleteButton.dataset.log = log.name;
		deleteButton.title = "Delete log";
		deleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" style="width:24px; heigth:24px" fill="var(--danger)"viewBox="0 0 20 20" fill="currentColor">
 			<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
			</svg>`;
		deleteCell.append(deleteButton);
	}
};

const sortDescending = (logs: Log[]) => {
	return logs.sort((a, b) => {
		return new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime();
	});
};

const sortAscending = (logs: Log[]) => {
	return logs.sort((a, b) => {
		return new Date(a.creationDate).getTime() - new Date(b.creationDate).getTime();
	});
};

document.querySelector<HTMLButtonElement>("#sort")?.addEventListener("click", function (this) {
	if (this.style.transform == "rotate(180deg)") {
		this.style.transform = "rotate(0deg)";
		logs = sortAscending(logs);
	} else {
		this.style.transform = "rotate(180deg)";
		logs = sortDescending(logs);
	}

	document.querySelectorAll(".log").forEach((log) => log.remove());

	displayLogs(logs);
});
