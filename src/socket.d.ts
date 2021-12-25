interface Payload {
	event: socketEvent;
}

type socketEvent = "fetch" | "command" | "start" | "stop";
