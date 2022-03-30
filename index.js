const fs = require("fs");
const cron = require("node-cron");

const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const { Client, Collection, Intents} = require("discord.js");
const { token } = require("./config.json");

const utils = require("./utils.js");
const archiver = require("./archive.js");
const imgProcessor = require("./image-processing.js");

// --------------------------------------------------
// Initialize cache for guild categories/channels
// --------------------------------------------------
const cache = {}
var guildsOnCooldown = [];


// --------------------------------------------------
// Cron to clear guildsOnCooldown every 24 hours
// --------------------------------------------------
cron.schedule('0 3 * * *', () => {
	guildsOnCooldown = [];
});


// --------------------------------------------------
// Instantiate client
// --------------------------------------------------
const client = new Client({
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MEMBERS]
});
client.commands = new Collection();


// --------------------------------------------------
// Add command files
// --------------------------------------------------
const commandFiles = fs.readdirSync("./commands").filter((f) => f.endsWith(".js"));

for (const file of commandFiles)
{
	const command = require(`./commands/${file}`);
	client.commands.set(command.data.name, command);
}


// --------------------------------------------------
// On ready
// --------------------------------------------------
client.once("ready", () => {
	client.user.setPresence({
		activities: [{name: "/help"}]
	});

	console.log("Ready!");
});


// --------------------------------------------------
// On interaction
// --------------------------------------------------
client.on("interactionCreate", async (interaction) => {
	if (interaction.isSelectMenu() && interaction.customId.includes("category-select"))
	{
		var guildID = interaction.guild.id;
		var idx = parseInt(interaction.customId.match(/.*([0-3])$/)[1]);

		if (!cache[guildID])
		{
			cache[guildID] = {"categories": [], "channels": []};
		}

		cache[guildID]["categories"][idx] = interaction.values;

		await interaction.deferUpdate();
	}
	else if (interaction.isButton() && interaction.customId == "confirm-categories")
	{
		// Cache is undefined if no full categories are selected
		if (!cache[interaction.guild.id])
		{
			cache[interaction.guild.id] = {"categories": [], "channels": []};
		}

		// Union all arrays in cache. By design they are non-overlapping
		var union = []
		for (subarray of cache[interaction.guild.id]["categories"])
		{
			union = union.concat(subarray);
		}
		cache[interaction.guild.id]["categories"] = union;

		// Get channels that aren't in the included categories
		var channels = await interaction.guild.channels.fetch();
		channels = channels.filter((channel) => channel.type != "GUILD_CATEGORY" && (channel.parent == null || !cache[interaction.guild.id]["categories"].includes(channel.parent.id)));

		var replyRows = [];
		var replyContent;
		if (channels.size == 0)
		{
			// Skip to full confirmation
			replyRows = [utils.makeConfirmationButtonRow("final")];
			replyContent = "Make archive with the above categories? This cannot be adjusted for 24 hours."
		}
		// Too many
		else if (channels.size > 100)
		{
			replyContent = "ERROR: I cannot display more than 100 channels! You may choose more full categories to fix this.";
		}
		else
		{
			replyContent = "Choose additional channels to include.";

			replyRows = utils.makeChannelMenuRows(channels);
			replyRows.push(utils.makeConfirmationButtonRow("channels"));
		}

		await interaction.reply({
			content: replyContent, 
			components: replyRows,
			ephemeral: true
		});
	}
	else if (interaction.isButton() && interaction.customId.includes("cancel"))
	{
		// clear cache
		cache[interaction.guild.id] = [];

		await interaction.reply({
			content: "Canceled.", 
			ephemeral: true
		});
	}
	else if (interaction.isSelectMenu() && interaction.customId.includes("channel-select"))
	{
		var guildID = interaction.guild.id;
		var idx = parseInt(interaction.customId.match(/.*([0-3])$/)[1]);

		// Update cache with values
		cache[guildID]["channels"][idx] = interaction.values;

		await interaction.deferUpdate();
	}
	else if (interaction.isButton() && interaction.customId == "confirm-channels")
	{
		// Union all arrays in cache. By design they are non-overlapping
		var union = []
		for (subarray of cache[interaction.guild.id]["channels"])
		{
			union = union.concat(subarray);
		}
		cache[interaction.guild.id]["channels"] = union;

		// If there are no categories or channels:
		if (cache[interaction.guild.id]["categories"].length == 0 && cache[interaction.guild.id]["channels"].length == 0)
		{
			await interaction.update({
				content: "You have not chosen any content!",
				components: [], 
				ephemeral: true
			});
			return;
		}

		// Get final confirmation
		var finalConfirmation = utils.makeConfirmationButtonRow("final");

		await interaction.reply({
			content: "Make archive with the above categories and channels? This cannot be adjusted for 24 hours.",
			components: [finalConfirmation], 
			ephemeral: true
		});
	}
	else if (interaction.isButton() && interaction.customId == "confirm-final")
	{
		// Archive
		await interaction.update({
			content: "Beginning archival. I will notify you when finished. This can take a while.",
			components: [], 
			ephemeral: true
		});

		// Add guild to cooldown
		guildsOnCooldown.push(interaction.guild.id);

		// Log server
		await archiver.generateArchive(interaction.guild, cache[interaction.guild.id], client);
		console.log("Finished logging...");

		// Give a 30 second buffer for this
		await utils.sleep(30000);

		// Notify user
		await interaction.channel.send("Finished! Use `/compress` to compress your images, or use `/zip` to generate your logs!");

		// Clear cache
		cache[interaction.guild.id] = {"categories": [], "channels": []};
	}


	// --------------------------------------------------
	// COMMANDS
	// --------------------------------------------------
	if (!interaction.isCommand())
	{
		return;
	}

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try
	{
		// Clear the guild's cache if it exists
		if(cache[interaction.guild.id])
		{
			cache[interaction.guild.id] = null;
		}
		await command.execute(interaction, guildsOnCooldown);
	}
	catch (error)
	{
		console.error(error);
		await interaction.reply({
			content: "Error!",
			ephemeral: true
		});
	}
});


// --------------------------------------------------
// Log in
// --------------------------------------------------
console.log("Logging in...");
client.login(token);
