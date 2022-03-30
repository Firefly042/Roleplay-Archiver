const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const imgProcessor = require("../image-processing.js");


module.exports = {
	data: 	new SlashCommandBuilder().setName("compress")
				.setDescription("Compresses images."),


	async execute(interaction, guildsOnCooldown)
	{
		await interaction.reply({
			content: "Working...",
		});

		// Compress images
		await imgProcessor.compressImages(interaction.guild.id);
		console.log("Compressed images...");
	},
};