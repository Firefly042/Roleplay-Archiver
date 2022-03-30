const { SlashCommandBuilder } = require("@discordjs/builders");
const { Collection, MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const utils = require("../utils.js");

module.exports = {
	data: 	new SlashCommandBuilder().setName("test")
				.setDescription("Dev test"),


	async execute(interaction, guildsOnCooldown)
	{
		async function fetchAllMessages(channel)
		{
			var messages = new Collection();
			var cont = true;
			var lastMsgId = null;

			var partialMessages;
			while (cont)
			{
				partialMessages = await channel.messages.fetch({ 
					limit: 100,
					before: lastMsgId 
				});

				lastMsgId = partialMessages.last().id;

				messages = messages.concat(partialMessages);

				if (partialMessages.size < 100)
				{			
					cont = false;
					return messages.reverse();
				}
			}
		}

		var channel = await interaction.guild.channels.fetch("626059034210074626");
		console.log(`Fetching messages in ${channel.name}`);

		const messages = await fetchAllMessages(channel);
		console.log(`Fetched ${messages.size} messages.`);
		console.log(messages.last().content);
		console.log(messages.first().content);	

		// var messages = await fetchAll.messages(channel, {
		// 	reverseArray: true
		// });

		// console.log(messages.length);

		// await interaction.reply({
		// 	content: "-",  
		// 	ephemeral: true
		// });
	},
};