*Last updated: 02 Apr, 2022*

## How to Use the Bot
* This bot is intended for use **after your game has concluded**. It does *not* log in real time.
* Archiving image-heavy channels is highly discouraged.


## Testing
This is currently in something of an 'Early Access'. It functions, but there is a lot of room for improvement and it needs to be tested on other operating systems.


## Introduction
This bot was written mainly for the roleplaying community, intended to be used for logging written content (with the occasional image) across all rp channels. It is not recommended to use it for out-of-character chats or art-heavy channels. It is also not recommended to use it more than necessary due to the number of API requests it needs to make.

The bot will generate a folder including some pre-written HTML5. Hosting this directory will recreate the logged channels with editable CSS and JS. All HTML, CSS, and JS files are written by Discord user @Firefly#7113.

This was tested in Firefox, Chrome, and Edge. Firefox has slightly better performance than Chrome, Chrome has slightly better aesthetics. Funnily enough, Edge has the best balance of performance and aesthetics.


## What You Can Do
* Clone this repository and make any changes you want to it so long as proper credit is given to original code.
* Share your instance of this bot code with friends in a private manner.


## What You Cannot Do (What I'd Prefer You Not Do)
* Profit off of this code or any bot that runs it.
* Publicly advertise your instance of this bot code as a service.


### Prerequisites
1. To run the bot, you will need Node.js version 17.4 or higher. You may download it for your operating system [here](https://nodejs.org).

2. To view the output, you will need a way to host the files. Hosting locally is straightforward with python. All users may follow the instructions [here](https://developer.mozilla.org/en-US/docs/Learn/Common_questions/set_up_a_local_testing_server#running_a_simple_local_http_server).


### Linux/Mac/Windows
1. Follow the instructions to create a bot application [here](https://discordjs.guide/preparations/setting-up-a-bot-application.html). You will need the SERVER MEMBERS INTENT and the MESSAGE CONTENT INTENT enabled. 

2. Invite your bot to your server using the link generated in OAuth2 > URL Generator. You must at least check off `bot` and `applications.commands`. Be sure to grant proper permissions to view the message history of any channels you want to log, and if you have archived threads to log, that it can manage threads.

3. Clone this github repository (or download it and unzip it somewhere).

4. Open a terminal (Command Prompt in Windows) and use `cd path/to/directory` (Windows uses `\`)

5. If you have properly installed Node.js, run `npm init` and accept the default suggestions.

6. Run `npm install`, which will install the dependencies listed in `package.json`.

7. In `config.json`, replace the token with the one on your bot's developer page. Replace the clientID with your application ID (in General Information), and replace the guildID with the server ID you want to run the bot in. If you cannot find your server's ID, enable Developer Mode in Settings > Advanced, then right click on the server icon.

8. Run `npm test` to deploy the commands to the specified server. If this does not work, you may need to adjust the scripts in `package.json` from `nodejs <>` to `node <>`. If it still does not work, make sure you checked off `bot` and `applications.commands` in step 2 and reinvite.

9. Use `npm start` to log the bot in.

10. Use `/archive` in whichever channel you'd like to work in within your server. Follow the prompts carefully. There may be multiple selection lists to check. Progress will be displayed in your computer's terminal.

11. The terminal will display 'finished' before you receive confirmation on discord. It is recommended to wait a moment or so in case any image files are still downloading.

12. If you would like to compress and downsize your images, use `/compress` in your server. If this crashes the bot, this is an error with the image processing module. I did not write this dependency and it is finicky. It usually works within 2-5 attempts, so you may restart the bot with `npm start` and use the `/compress` command until it works.

13. Use `/zip` to generate a zip file in the `output` folder. This is for convenience of distribution, and copies the necessary files to display the server log. Zipping the files will automatically clear the folder in `guild_caches` after about 30 seconds.

14. That is all. You may log the bot off with Ctrl+C. If you leave it running, your server will be on a cooldown to prevent abuse.


## How to View your Logs
For security reasons, you'll need to host the files locally (or on some other hosting service if you are savvy with that). This is most easily done with python. 

1. Virus scan the directory. It's safe, but don't take my word for it.

2. If you are on Mac or Linux, you should already have python. If you are on Windows, you may need to download it. All users can refer to instructions indicated in Prerequisites.

3. Make sure you are working in the same directory as `index.html` when running your local server.

4. Go to `localhost:8000`, or whichever port number you specified if not the default. If this doesn't work, try `localhost:8000/index.html`.

5. `style.css` may be edited as desired.


## Issues
* Clearing your browser cache should fix issues with css not updating or content that doesn't match that in its corresponding `messages.json` file.

* Minor formatting discrepancies between original and generated messages.

* Custom emojis are handled, but it is possible that their removal from the server (or a server's deletion) will render them inaccessible.

* Does not indicate a message that has been replied to.


## Future Updates
* Handle reactions maybe.
* Handle rich embeds maybe.