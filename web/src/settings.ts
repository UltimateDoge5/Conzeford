//Not asigning the type to settings variables to avoid non-indexable errors
let clientSettings: any = {};
let settings: any = {};

fetch("/api/settings")
	.then((settings) => settings.json())
	.then((fetchedSettings) => {
		for (const key in fetchedSettings) {
			document.querySelectorAll<HTMLInputElement>(`#${key} input`).forEach((element) => {
				if (element.type === "checkbox") {
					element.checked = fetchedSettings[key][element.name];
				} else {
					element.value = fetchedSettings[key][element.name];
				}
			});
		}

		//Copy the object without the reference
		clientSettings = JSON.parse(JSON.stringify(fetchedSettings));
		settings = fetchedSettings;

		document.querySelectorAll("form").forEach((form) => {
			if (!form.classList.contains("togglable")) return;

			form.querySelectorAll("input").forEach((input) => {
				if (input.name == "enabled") return;

				input.disabled = !settings[form.name].enabled;
			});
		});
	});

//For some reason sometimes buttons aren't disabled on reload
document.querySelectorAll<HTMLButtonElement>("#btnGroup [type='submit']").forEach((button) => {
	button.disabled = true;
});

document.querySelectorAll("form").forEach((form: HTMLFormElement) => {
	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		const data: any = { [form.name]: {} }; //Same here, not asigning the type to settings to avoid non-indexable errors

		form.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
			if (input.type === "checkbox") {
				data[form.name][input.name] = input.checked;
			} else if (input.type === "number") {
				const parse = parseFloat(input.value);
				if (isNaN(parse)) return;
				data[form.name][input.name] = parse;
			} else {
				data[form.name][input.name] = input.value;
			}
		});

		const reponse = await fetch("/api/settings", { method: "POST", body: JSON.stringify(data), headers: [["Content-Type", "application/json"]] });

		if (reponse.status === 200) {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "Settings saved!";
			(form.querySelector("#notification") as HTMLSpanElement).style.color = "var(--success)";

			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = true;
			});

			window.onbeforeunload = null;
		} else {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "Failed to save settings!";
			(form.querySelector("#notification") as HTMLSpanElement).style.color = "var(--danger)";
		}

		setTimeout(() => {
			(form.querySelector("#notification") as HTMLSpanElement).innerText = "";
		}, 5000);
	});
});

const getParentRecursive = <Element>(element: HTMLElement, selector: string): Element => {
	if (element.parentElement?.tagName.toLocaleLowerCase() == selector.toLocaleLowerCase()) {
		return element.parentElement as unknown as Element;
	} else {
		return getParentRecursive<Element>(element.parentElement!, selector);
	}
};

const objectDiffrence = (first: any, second: any): Object => {
	if (!second || Object.prototype.toString.call(second) !== "[object Object]") {
		return first;
	}

	const diffrence: any = {};
	let key;

	const arraysMatch = function (arr1: any[], arr2: any[]) {
		if (arr1.length !== arr2.length) return false;

		for (let i = 0; i < arr1.length; i++) {
			if (arr1[i] !== arr2[i]) return false;
		}

		return true;
	};

	const compareObjects = (item1: any, item2: any, key: string) => {
		const type1 = Object.prototype.toString.call(item1);
		const type2 = Object.prototype.toString.call(item2);

		if (type1 !== type2) {
			//If the types are diffrent
			diffrence[key] = item2;
		} else if (type1 === "[object Object]") {
			//If its an object
			const objDiff = objectDiffrence(item1, item2);
			if (Object.keys(objDiff).length > 0) {
				diffrence[key] = objDiff;
			}
		} else if (type1 === "[object Array]") {
			//If its an array
			if (!arraysMatch(item1, item2)) {
				diffrence[key] = item2;
			}
		} else {
			if (item1 !== item2) {
				diffrence[key] = item2;
			}
		}
	};

	for (key in first) {
		if (first.hasOwnProperty(key)) {
			compareObjects(first[key], second[key], key);
		}
	}
	for (key in second) {
		if (second.hasOwnProperty(key)) {
			if (!first[key] && first[key] !== second[key]) {
				diffrence[key] = second[key];
			}
		}
	}

	return diffrence;
};

document.querySelectorAll<HTMLInputElement>("input").forEach((input) => {
	input.addEventListener("change", async (event: Event) => {
		const form: HTMLFormElement = getParentRecursive<HTMLFormElement>(event.target as HTMLElement, "form");

		if (input.type === "checkbox") {
			clientSettings[form.name][input.name] = input.checked;
		} else if (input.type === "number") {
			clientSettings[form.name][input.name] = parseFloat(input.value);
		} else {
			clientSettings[form.name][input.name] = input.value;
		}

		if (Object.keys(objectDiffrence(clientSettings, settings)).length > 0) {
			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = false;
			});

			window.onbeforeunload = (event) => {
				event.preventDefault();
				return (event.returnValue = "Are you sure you want to leave? You have unsaved changes.");
			};
		} else {
			form.querySelectorAll<HTMLButtonElement>("#btnGroup button").forEach((button) => {
				button.disabled = true;
			});

			window.onbeforeunload = null;
		}

		document.querySelectorAll<HTMLFormElement>("form.togglable").forEach((form) => {
			form.querySelectorAll("input").forEach((input) => {
				if (input.name == "enabled") return;

				input.disabled = !clientSettings[form.name].enabled;
			});
		});
	});
});
