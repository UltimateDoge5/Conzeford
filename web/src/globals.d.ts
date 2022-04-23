declare class Terminal {
	constructor(options: TerminalOptions);

	setOption(key: string, value: any): void;
	open(element: HTMLElement): void;
	write(text: string): void;
	loadAddon(addon: any): void;
}

declare class fit {
	fit(): void;
}
