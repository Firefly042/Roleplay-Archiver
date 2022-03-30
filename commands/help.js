const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: 	new SlashCommandBuilder().setName("help")
				.setDescription("Instructions"),


	async execute(interaction, guildsOnCooldown)
	{
		await interaction.reply("Use `/archive` and follow the prompts to choose categories to archive, and then individual channels.\n\nIf you are having issues, try reinviting the bot with this link:\nhttps://discord.com/api/oauth2/authorize?client_id=947560451221381230&permissions=66560&scope=applications.commands%20bot\n\n**NOTICE 1**: Once you have confirmed all prompts, you may not use `/archive` again until 09:00 UTC.\n\n**NOTICE 2**: For security reasons, you will have to host the resulting files on your own machine. Instructions for this are in the attached README.\n\n**LIMITATIONS**:\n-The bot can only display 100 categories maximum.\n-The bot can only display 100 channels *outside of selected categories*.\n-Images will be downsized and compressed. **It is highly recommended to log media-heavy channels separately due to Discord's upload limit**.\n-Audio and video attachments will be included as links, but not downloaded. If the original post is deleted, they will become inaccessible.\n-Custom emojis are handled, but if one is deleted from its server (or the server is deleted), they may be rendered inaccessible.\n-Reactions are not currently handled.\n-Embeds are not currently handled.\n-Potential minor formatting descrepancies.");
	},
};