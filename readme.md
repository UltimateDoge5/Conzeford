# What is Conzeford?

So what exactly is Conzeford?

It's a web application that allows you to control your Minecraft server from your browser.
It starts a java process in the background and provides multiple ways of management and interaction through the web interface.

## What's the purpose?

I wanted an easy way for my friends without extensive knowledge of using VPS's and Linux to control their Minecraft servers.
After the initial setup of the application, basic things like starting/stopping the server and interaction with it can be done through the browser.

## How does it work?

The Minecraft server itself is started as a java process managed by the app. The application communicates with the browser via WebSockets and REST Apis.

The method for detection of the server events and the is's disadvantages are described [here](#Spoofing-the-detection-of-server-events).

## Features

This those are some of current and planned features:

-   [x] State management
-   [x] Console interface
-   [x] Aplication settings
-   [x] Log reader
-   [ ] [Plugin based event detection](#Spoofing-the-detection-of-server-events)
-   [x] Password protection

The exact list can be found [here](https://github.com/UltimateDoge5/Conzeford/projects/1).  
Conzeford also has its own configurable features like shutdown delay - before a shutdown a message about it is sent to the players. And a lot of smaller features.

## Setup

You can download the latest version from [here](https://github.com/UltimateDoge5/Conzeford/releases).

Conzeford **_will not_** set up a Minecraft server for you so you need to do that yourself.
After that create the config.env file in the same directory as the Conzeford binary.
Config.env will also be generated on start, if its not present but requires filling the values.
The config looks like this:

```
SERVER_JAR="server_jar_name_here" #Required
SERVER_DIR="directory_of_server_jar_here" #Required
JRE_FLAGS="your_jre_flags_here" #Here you can put you jre flags like -Xmx4G. Not required
SERVER_AUTOSTART=false #True or false
PORT=port #Not required
```

Replace the placeholders with the correct values. If you have mutliple JRE flags they must be separated by a space.
Every time you change the config.env, restart the server to apply the changes.
If you did everything correctly you should be able to start the server.

## Spoofing the detection of server events

To recognize that the server has started or stopped, to update the player list and other things that are happening on the server I use regex with the console output. And I know this is not the best solution because it can be easily spoofed. For example, the `player joined the server` message can be eaisly changed via plugins and the server won't detect that anymore.

To combat this I've come up with an easy solution - a plugin. It is not only going to solve my existing problems but it's also going to allow me more flexibility. I can easily grab the server's version and tps and display them on the dashboard for example.

It's not my priority for now, as I want to finish other features and it would involve major server code changes. But it will happen eventually. The plugin's code will be also open source and won't collect unnecessary data.

## Making changes and compiling to binary

Firts things first - install the dependencies. You can use `npm install` or `yarn`.
You also need to have Typescript installed.

To transpile the typescript files to javascript, start the Typescript watch processes on the src and web/src.
Remeber to run the node server after that, to see your changes.

If you made some changes of your own to the application and want to compile it to a binary, you have to install the [pkg](https://www.npmjs.com/package/pkg) package.
After installing pkg run `npm run build` or `yarn build`. It will start the transpilation processes and compile to the binary.

It will compile the application to a binary and put it in the dist folder.
