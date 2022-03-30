const { SlashCommandBuilder } = require("@discordjs/builders");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { token, clientID, guildID } = require("./config.json");

const rest = new REST({version: '9'});
rest.setToken(token);


// This bot only has a few commands so this is fine
const commands = [
	// Help
	new SlashCommandBuilder().setName("help")
		.setDescription("Instructions"), 

	// Archive
	new SlashCommandBuilder().setName("archive")
		.setDescription("Choose categories and individual channels to log"), 

	// Get
	new SlashCommandBuilder().setName("compress")
		.setDescription("Compresses images."), 

	// Test
	new SlashCommandBuilder().setName("zip")
		.setDescription("Zips files")
];

commands.map((c) => c.toJSON());


rest.put(
	Routes.applicationGuildCommands(clientID, guildID), 
	{body: commands}
	)
	.then(() => console.log("Registered commands"))
	.catch(console.error);

