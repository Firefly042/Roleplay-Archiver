const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const utils = require("../utils.js");


module.exports = {
	data: 	new SlashCommandBuilder().setName("zip")
				.setDescription("Zips file to output."),


	async execute(interaction, guildsOnCooldown)
	{
		await interaction.reply({
			content: "Working...",
		});

		// Zip
		await utils.zipArchive(interaction.guild.id, interaction.guild.name);
		console.log("Zipped file to output folder.")
		await interaction.channel.send({
			content: "Finished!"
		});

		// Clear cache
		await utils.sleep(30000);
		await utils.clearCache(interaction.guild.id);
		console.log("Cleared cache.");
	},
};
