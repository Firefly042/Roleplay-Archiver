const { MessageActionRow, MessageButton, MessageSelectMenu } = require("discord.js");
const fs = require("fs");
const archiver = require("archiver");


module.exports = {
	makeConfirmationButtonRow: function (type)
	{
		var row = new MessageActionRow();
		row.addComponents(
			new MessageButton()
				.setCustomId(`confirm-${type}`)
				.setLabel("Confirm")
				.setStyle("SUCCESS"), 

			new MessageButton()
				.setCustomId(`cancel-${type}`)
				.setLabel("Cancel")
				.setStyle("DANGER")
		);

		return row;
	},


	makeCategoryMenuRows: function (categories)
	{
		var rows = []

		var currentOptions = []
		var currentRow;
		var i = 0;
		for (var category of categories)
		{
			currentOptions.push({
				label: category.name,
				value: category.id
			});

			if (currentOptions.length == 25)
			{
				currentRow = new MessageActionRow();
				currentRow.addComponents(
					new MessageSelectMenu()
						.setCustomId(`category-select-${i}`)
						.addOptions(currentOptions)
						.setPlaceholder('No categories selected')
						.setMinValues(0)
						.setMaxValues(25)
				);

				rows.push(currentRow);
				currentOptions = [];
				i++;
			}
		}

		// Handle final row
		if (currentOptions.length > 0)
		{
			currentRow = new MessageActionRow();
			currentRow.addComponents(
				new MessageSelectMenu()
					.setCustomId(`category-select-${i}`)
					.setPlaceholder('No Categories selected')
					.addOptions(currentOptions)
					.setMinValues(0)
					.setMaxValues(currentOptions.length)
			);

			rows.push(currentRow);
		}

		return rows;
	},


	makeChannelMenuRows: function (channels)
	{
		var rows = []

		var currentOptions = []
		var currentRow;
		var i = 0;
		var channel;
		for (var ch of channels)
		{
			channel = ch[1];

			var desc;
			if (channel.parent != null)
			{
				desc = channel.parent.name.toUpperCase();
			}
			else
			{
				desc = "UNCATEGORISED";
			}
			
			currentOptions.push({
				label: channel.name,
				description: desc, 
				value: channel.id
			});

			if (currentOptions.length == 25)
			{
				currentRow = new MessageActionRow();
				currentRow.addComponents(
					new MessageSelectMenu()
						.setCustomId(`channel-select-${i}`)
						.addOptions(currentOptions)
						.setPlaceholder('No channels selected')
						.setMinValues(0)
						.setMaxValues(25)
				);

				rows.push(currentRow);
				currentOptions = [];
				i++;
			}
		}

		// Handle final row
		if (currentOptions.length > 0)
		{
			currentRow = new MessageActionRow();
			currentRow.addComponents(
				new MessageSelectMenu()
					.setCustomId(`channel-select-${i}`)
					.setPlaceholder('No channels selected')
					.addOptions(currentOptions)
					.setMinValues(0)
					.setMaxValues(currentOptions.length)
			);

			rows.push(currentRow);
		}

		return rows;
	}, 


	sleep: async function (t)
	{
		return new Promise((resolve) => setTimeout(resolve, t));
	},


	zipArchive: async function (guildID, guildName)
	{
		var output = fs.createWriteStream(`./output/${guildName}.zip`);
		var archive = archiver('zip');

		output.on('error', (error) => {
			console.error(error);
		});

		archive.pipe(output);

		archive.directory(`./guild_caches/${guildID}`, false);

		for (file of fs.readdirSync("./distributed"))
		{
			archive.append(fs.createReadStream(`./distributed/${file}`), {name: file});

		}
		archive.finalize();
	},


	clearCache: async function (guildID)
	{
		fs.rm(`./guild_caches/${guildID}`, {recursive: true}, (error) => {
			if (error)
			{
				console.error(error);
			}
		});
	}
};