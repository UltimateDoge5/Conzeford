interface Payload {
	event: socketEvent;
	command: any;
}

interface serverStatus {
	enabled: boolean;
	isStarting: boolean;
	isStopping: boolean;
}

interface Settings {
	shutdownDelay: {
		enabled: boolean;
		delay: number;
		message: string;
	};
}

type socketEvent = "status" | "command" | "start" | "stop";
