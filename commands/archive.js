const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const utils = require("../utils.js");


module.exports = {
	data: 	new SlashCommandBuilder().setName("archive")
				.setDescription("Instructions"),


	async execute(interaction, guildsOnCooldown)
	{
		// Check if guild is on cooldown
		if (guildsOnCooldown.includes(interaction.guild.id))
		{
			await interaction.reply({
				content: "ERROR: You must wait until 9:00 UTC to archive again!",
				ephemeral: true
			});
			return;
		}

		// Check for admin permissions
		if (!interaction.memberPermissions.any("ADMINISTRATOR"))
		{
			await interaction.reply({
				content: "ERROR: You must have admin permission to use this!",
				ephemeral: true
			});
			return;
		}

		var channels = await interaction.guild.channels.fetch();

		const categories = channels.filter((c) => c.type == 'GUILD_CATEGORY').map(c => c);


		// Can do up to 100 categories
		if (categories.length > 100)
		{
			await interaction.reply({
				content: "ERROR: I cannot display more than 100 categories!"
			});
			return;
		}


		// Select menus for categories (up to 4 rows)
		var replyRows = utils.makeCategoryMenuRows(categories);

		// Append a confirmation button row
		replyRows.push(utils.makeConfirmationButtonRow("categories"));


		await interaction.reply({
			content: "Choose categories. If adjusting any selections, be sure to click outside menu for reply to update!", 
			components: replyRows, 
			ephemeral: true
		});
	},
};