interface Payload {
	event: socketEvent;
	immediate: boolean;
	command: any;
}

interface serverStatus {
	enabled: boolean;
	isStarting: boolean;
	isStopping: boolean;
	players: string[];
	startDate: Date | null;
}

interface Settings {
	shutdownDelay: {
		enabled: boolean;
		delay: number;
		message: string;
	};
	autoDelete: {
		enabled: boolean;
		deleteAfter: number;
	};
	auth: {
		enabled: boolean;
		hash: string | null;
	};
}

interface WorldSize {
	worlds: World[];
	date: number;
}

interface World {
	name: string;
	size: number;
}

interface TreeFolder {
	files: number[];
	dirs: TreeFolder[];
	name: string;
	size: number;
}

interface Log {
	name: string;
	creationDate: number;
}

type socketEvent = "status" | "command" | "start" | "stop" | "restart";
