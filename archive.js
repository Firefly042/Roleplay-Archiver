const fs = require("fs");
const axios = require("axios");
const { Collection } = require("discord.js");
const {parser, htmlOutput, toHTML } = require("discord-markdown");

var guildStruct;
var guildMembers;
var guildChannels;
var guildRoles;

function initializeGuildDirectory(guild)
{
	var dname = `./guild_caches/${guild.id}`;
	try 
	{
		fs.mkdirSync(dname);
	}
	catch {}

	try
	{
		fs.mkdirSync(`${dname}/_attachments`);
	}
	catch {}

	try 
	{
		fs.mkdirSync(`${dname}/_avatars`);
	}
	catch {}
}


function initializeCategoryDirectory(category)
{
	var dname = `./guild_caches/${category.guild.id}/${category.id}`;
	try 
	{
		fs.mkdirSync(dname);
	}
	catch {}
}


function initializeChannelDirectory(channel, category)
{
	var dname;
	if (channel.type == "GUILD_TEXT")
	{
		dname = `./guild_caches/${channel.guild.id}/${category.id}/${channel.id}`;
	}
	else if (channel.type == "GUILD_PUBLIC_THREAD" || channel.type == "GUILD_PRIVATE_THREAD")
	{
		dname = `./guild_caches/${channel.guild.id}/${category.id}/${channel.parent.id}/threads/${channel.id}`;
	}

	try 
	{
		fs.mkdirSync(dname);
	}
	catch {}

	try 
	{
		fs.mkdirSync(`./guild_caches/${channel.guild.id}/_attachments/${channel.id}`);
	}
	catch {}

	if (channel.type == "GUILD_TEXT")
	{
		try 
		{
			fs.mkdirSync(`${dname}/threads`);
		}
		catch {}
	}
}


function writeMessageJSON(channel, category, messageJSON)
{
	console.log(`\tWriting file for ${channel.name}`);

	var fname;
	if (channel.type == "GUILD_TEXT")
	{
		fname = `./guild_caches/${channel.guild.id}/${category.id}/${channel.id}/messages.json`;
	}
	else if (channel.type == "GUILD_PUBLIC_THREAD" || channel.type == "GUILD_PRIVATE_THREAD")
	{
		fname = `./guild_caches/${channel.guild.id}/${category.id}/${channel.parent.id}/threads/${channel.id}/messages.json`;
	}

	try 
	{
		fs.writeFileSync(fname, JSON.stringify(messageJSON, null, 2));
	}
	catch (error)
	{
		// console.error(error);
	}
}


function writeGuildJSON(guild, guildJSON)
{
	// Trim guildJSON to archived entries only
	var fname = `./guild_caches/${guild.id}/info.json`;

	try 
	{
		fs.writeFileSync(fname, JSON.stringify(guildJSON, null, 2));
	}
	catch {}
}

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

		if (partialMessages.size == 100)
		{
			lastMsgId = partialMessages.last().id;
		}

		messages = messages.concat(partialMessages);

		if (partialMessages.size < 100)
		{			
			cont = false;
			return messages.reverse();
		}
	}
}

function getAuthorUser(authorID)
{
	return guildMembers.get(authorID);
}

async function downloadAttachment(attachment, message)
{
	var dname = `./guild_caches/${message.guild.id}/_attachments/${message.channel.id}/${attachment.id}`;
	var fname = `${dname}/${attachment.name}`;

	fs.exists(fname, async (exists) => {
		if (exists)
		{
			return;
		}
		else
		{
			try 
			{
				fs.mkdirSync(dname);
			}
			catch {}

			// Download
			try
			{
				var writer = fs.createWriteStream(fname);

				var res = await axios(attachment.proxyURL, {
					method: 'GET',
					responseType: 'stream'
				});

				res.data.pipe(writer);
			}
			catch (error)
			{
				// console.log(`Error downloading attachment from ${message.channel.name} - ${attachment.proxyURL}`);
				// console.error(error);
				// try 
				// {
				// 	fs.unlinkSync(fname);
				// }
				// catch {}
			}
		}
	});
}


async function downloadAvatar(user, message)
{
	var dname = `./guild_caches/${message.guild.id}/_avatars/${user.id}`;
	var fname = `${dname}/${user.avatar}.webp`;

	fs.exists(fname, async (exists) => {
		if (exists)
		{
			return;
		}
		else
		{
			try 
			{
				fs.mkdirSync(dname);
			}
			catch {}

			// Download
			try
			{
				var writer = fs.createWriteStream(fname);

				var res = await axios(user.displayAvatarURL(), {
					method: 'GET',
					responseType: 'stream'
				});

				res.data.pipe(writer);
			}
			catch (error)
			{
				// console.log(`Error downloading avatar for ${user.name}`);
				// console.error(error);
				// try 
				// {
				// 	fs.unlinkSync(fname);
				// }
				// catch {}
			}
		}
	});
}


async function archiveChannels(channels, category, guild)
{
	// Restore any archived threads
	for (channel of channels)
	{
		var archivedThreads;
		try 
		{
			archivedThreads = await channel[1].threads.fetchArchived();
		}
		catch 
		{
			archivedThreads = await channel.threads.fetchArchived();
		}

		archivedThreads.threads.forEach(async (thread) => {
			await thread.setArchived(false);
			console.log(`Restored ${channel.name} - ${thread.name}`);
		});
	}


	// Fetch all threads and treat them as channels
	for (channel of channels)
	{
		try 
		{

			threads = await channel[1].threads.fetch();
		}
		catch 
		{
			threads = await channel.threads.fetch();
		}

		if (threads)
		{
			channels = channels.concat(threads["threads"].reverse());
		}
	}


	for (channel of channels)
	{
		channel = channel[1];

		initializeChannelDirectory(channel, category);

		// Push onto guildStruct
		if (channel.type == "GUILD_TEXT")
		{
			var idx = guildStruct.categories.findIndex((cat) => cat.id == category.id);
			guildStruct.categories[idx].channels.push({
				id: channel.id, 
				name: channel.name, 
				position: channel.position, 
				threads: []
			});
		}
		else if (channel.type == "GUILD_PUBLIC_THREAD" || channel.type == "GUILD_PRIVATE_THREAD")
		{
			var catIdx = guildStruct.categories.findIndex((cat) => cat.id == category.id);
			var chIdx = guildStruct.categories[catIdx].channels.findIndex((ch) => ch.id == channel.parent.id);
			guildStruct.categories[catIdx].channels[chIdx].threads.push({
				id: channel.id, 
				name: channel.name
			});
		}
		
		// Iterate over all messages
		console.log(`Fetching ${channel.name}...`);

		// channelMessages = await channel.messages.fetch({ limit: 10 });
		var channelMessages = await fetchAllMessages(channel);

		console.log(`\tFetched ${channelMessages.size} messages from ${channel.name}`);
		
		var messagesJSON = [];
		var currentMessageJSON;
		for (message of channelMessages)
		{
			currentMessageJSON = {};
			message = message[1];

			// -------------------------------------------------
			// Handle author display name, and color
			// -------------------------------------------------
			var author;
			try 
			{
				author = getAuthorUser(message.author.id);
				message.author.displayName = author.displayName;
				message.author.displayHexColor = author.displayHexColor
			}
			// Error when user is no longer in guild
			catch
			{
				author = message.author;
				message.author.displayName = message.author.username;
				message.author.displayHexColor = "#ffffff";
			}


			// -------------------------------------------------
			// Construct message JSON
			// -------------------------------------------------
			currentMessageJSON.id = 					message.id;
			currentMessageJSON.createdTimestamp = 		message.createdTimestamp;
			currentMessageJSON.content = 				message.content;
			currentMessageJSON.html = 					toHTML(message.content, {
															discordCallback: {
																everyone: node => "@everyone",
																here: node => "@here",
																user: node => {
																	var name = guildMembers.get(node.id).displayName;
																	if (name)
																	{
																		name = guildMembers.get(node.id).username;
																	}
																	return `@${name}`;
																},
																role: node => `@${guildRoles.get(node.id).name}`,
																channel: node => `#${guildChannels.get(node.id).name}`
															}
														});

			currentMessageJSON.author = {};
			currentMessageJSON.author.id = 				message.author.id;
			currentMessageJSON.author.avatar = 			message.author.avatar;
			currentMessageJSON.author.bot = 			message.author.bot;
			currentMessageJSON.author.displayName = 	message.author.displayName;
			currentMessageJSON.author.displayHexColor =	message.author.displayHexColor;

			currentMessageJSON.attachments = [];
			message.attachments.forEach((attachment) => {
				currentMessageJSON.attachments.push({
					id: attachment.id,
					name: attachment.name, 
					type: attachment.contentType,
					proxyURL: attachment.proxyURL
				});
			});

			currentMessageJSON.hasThread = message.hasThread;
			if (message.hasThread)
			{
				currentMessageJSON.thread = message.thread.id;
				currentMessageJSON.threadName = message.thread.name;
			}

			messagesJSON.push(currentMessageJSON);


			// -------------------------------------------------
			// Download message attachments
			// -------------------------------------------------
			message.attachments.forEach(async (attachment) => {
				if ((attachment.contentType && attachment.contentType.startsWith("image")) || attachment.name.endsWith(".jpg") || attachment.name.endsWith(".png") || attachment.name.endsWith(".JPG") || attachment.name.endsWith(".PNG") || attachment.name.endsWith(".gif") || attachment.name.endsWith(".GIF"))
				{
					await downloadAttachment(attachment, message);
				}
			});


			// -------------------------------------------------
			// Download author avatar
			// -------------------------------------------------
			await downloadAvatar(message.author, message);
		}

		// Write to file
		writeMessageJSON(channel, category, messagesJSON);

		console.log(`\tArchived ${channel.name}`);
	}
}


async function generateArchive(guild, cache, client)
{
	guildStruct = {id: guild.id, name: guild.name, categories: []};

	guildMembers = await guild.members.fetch();
	console.log(`Fetched members of ${guild.name}`);

	guildChannels = await guild.channels.fetch();
	console.log(`Fetched channels of ${guild.name}`);

	guildRoles = await guild.roles.fetch();
	console.log(`Fetched roles of ${guild.name}`);

	initializeGuildDirectory(guild);

	var category;
	var channels;
	var threads;
	for (var categoryID of cache["categories"])
	{
		category = await guild.channels.fetch(categoryID);

		initializeCategoryDirectory(category);

		// Push onto guildStruct 
		guildStruct.categories.push({
			id: category.id, 
			name: category.name, 
			position: category.position, 
			channels: []
		});

		var channels = category.children;
		await archiveChannels(channels, category, guild, client);
	}


	var channel;
	for (var channelID of cache["channels"])
	{
		channel = await guild.channels.fetch(channelID);

		if (channel.parent == null)
		{
			category = {
				id: '0',
				name: '',
				position: -1,
				guild: {
					id: channel.guild.id
				}
			}
		}
		else
		{
			category = channel.parent;
		}

		initializeCategoryDirectory(category);

		var inStruct = guildStruct.categories.some((cat) => cat.id == category.id);

		// Push onto guildStruct
		if (!inStruct)
		{
			guildStruct.categories.push({
				id: category.id, 
				name: category.name, 
				position: category.position, 
				channels: []
			});
		}

		channel = [null, channel];

		// This runs a second time for each channel with an undefined for some reason. Just ignore it.
		try 
		{
			await archiveChannels([channel], category, guild, client);
		}
		catch {}
	}

	
	// Write guildStruct
	writeGuildJSON(guild, guildStruct);
}


module.exports = {
	generateArchive: generateArchive
};