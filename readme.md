# What is Conzeford?

So what exactly is Conzeford?

It's a web application that allows you to control your Minecraft server from your browser.
It starts a java process in the background and provides multiple ways of management and interaction through the web interface.

## What's the purpose?

I wanted an easy way for my friends without extensive knowledge of using VPS's and Linux to control their Minecraft servers.
After the initial setup of the application, basic things like starting/stopping the server and interaction with it can be done through the browser.

## How does it work?

The Minecraft server itself is started as a java process managed by the app. The application communicates with the browser via WebSockets and REST Apis.

The method of detection of the server events and their disadvantages are described [here](#spoofing-the-detecion-of-server-events)

## Features

This is the list of current and planned features:

-   [x] State management
-   [x] Console
-   [x] Aplication settings
-   [ ] Log reader
-   [ ] [Plugin based event detection](#spoofing-the-detecion-of-server-events)
-   [ ] Password protection

Conzeford also has its own configurable features like shutdown delay - before a shutdown a message about it is sent to the players. And a lot of smaller features.

## Setup

You can download the latest version from [here](https://github.com/UltimateDoge5/Conzeford/releases).

Conzeford **_will not_** set up a Minecraft server for you so you need to do that yourself.
After that create the config.env file in the same directory as the Conzeford binary.
The config looks like this:

```
SERVER_JAR="server_jar_name_here"
SERVER_DIR="directory_of_server_jar_here"
SERVER_AUTOSTART=false
```

Replace the placeholders with the correct values.
If you did everything correctly you should be able to start the server.

## Spoofing the detection of server events

To recognize that the server has started or stopped, to update the player list and other things that are happening on the server I use regex with the console output. And I know this is not the best solution because it can be easily spoofed. For example, the `player joined the server` message can be eaisly changed via plugins and the server won't detect that anymore.

To combat this I've come up with an easy solution - a plugin. It is not only going to solve my existing problems but it's also going to allow me more flexibility. I can easily grab the server's version and tps and display them on the dashboard for example.

It's not my priority for now, as I want to finish other features and it would involve major server code changes. But it will happen eventually. The plugin's code will be also open source and won't collect unnecessary data.

## Compiling to binary

If you made some changes of your own to the application and wanted to compile it to a binary you can do so by running:

Using npm `npm run build` or using yarn `yarn build`

It will compile the application to a binary and put it in the dist folder.