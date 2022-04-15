const messagePanel = document.getElementById("message-panel");
const categoryPanel = document.getElementById("category-panel");
const channelNameDisplay = document.getElementById("channel-name-text");


var guildInfo;

function sortByPosition(array)
{
	array.sort((a, b) => a.position - b.position);
}


function setServerName(name)
{
	document.getElementById("server-name-text").innerHTML = name;
}


function replaceLineBreaks(htmlStr)
{
	// Replace single but not double line breaks
	// Not perfect, but pretty decent
	var testStr = "*Uuuhmmmmm<br>mmmmmmmmmmm<*\n*West Tenne\n\nssee.*";
	var regex = /[^\n(p>)](\n)[^\n(<p)]/;

	var match;
	var cont = true;
	var subStr;
	while (cont)
	{
		match = htmlStr.match(regex);
		if (match)
		{
			subStr = match[0];
			htmlStr = htmlStr.replace(subStr, `${subStr[0]}<br>${subStr[2]}`);
		}
		else
		{
			cont = false;
		}
	}

	return htmlStr;
}

// TODO - handle attachments
// For posts with avatars and timestamps
function constructPost(message, channelID, append)
{
	if (!append)
	{
		var date = new Date(message.createdTimestamp);
	}

	var postContainer = document.createElement("div");
	postContainer.className = "post-container";
	if (append)
	{
		postContainer.style.paddingTop = "0";
	}

	var avatarDisplay = document.createElement("div");
	avatarDisplay.className = "avatar-display";

	if (!append)
	{
		var avatarImg = document.createElement("img");
		avatarImg.className = "avatar-img";
		avatarImg.src = `./_avatars/${message.author.id}/${message.author.avatar}.webp` 
		avatarImg.alt= `${message.author.displayName}`;

		avatarDisplay.appendChild(avatarImg);
	}

	postContainer.append(avatarDisplay);	

	var postRightContainer = document.createElement("div");
	postRightContainer.className = "post-right-container";

	var postRightTopContainer = document.createElement("div")
	postRightTopContainer.className = "post-right-top-container";

	var postAuthor = document.createElement("div");
	postAuthor.className = "author";

	if (!append)
	{
		postAuthor.style.color = message.author.displayHexColor;
		postAuthor.innerHTML = message.author.displayName;
	}

	var postTime = document.createElement("div");
	postTime.className = "time";

	if (!append)
	{
		postTime.innerHTML = date.toLocaleString();
	}

	postRightTopContainer.appendChild(postAuthor);
	postRightTopContainer.appendChild(postTime);
	postRightContainer.appendChild(postRightTopContainer);

	var messageContent = document.createElement("div");
	messageContent.className = "message-content";
	messageContent.id = message.id;
	messageContent.innerHTML = message.html;

	postRightContainer.appendChild(messageContent);
	postContainer.appendChild(postRightContainer);	


	// Handle attachments
	if (message.attachments.length > 0)
	{
		for (var attachment of message.attachments)
		{
			var attachmentFile = `./_attachments/${channelID}/${attachment.id}/${attachment.name}`;
			
			var attachmentContainer = document.createElement("div");
			attachmentContainer.className = "attachment-container";
			attachmentContainer.id = attachment.id;

			 // Might be a thing with very old posts, but sometimes the contentType is null
			if (attachment.type == null || attachment.type.startsWith("image"))
			{
				var attachmentImg = document.createElement("img");
				attachmentImg.src = attachmentFile;
				attachmentImg.alt = attachment.name;
				attachmentImg.className = "attachment-img";
				attachmentContainer.appendChild(attachmentImg);
			}
			else
			{
				var attachmentLink = document.createElement("a");
				attachmentLink.className = "attachment-link";
				attachmentLink.href = attachment.proxyURL;
				attachmentLink.innerHTML = attachment.name;

				attachmentContainer.style.marginBottom = "24px";
				attachmentContainer.style.marginTop = "16px";
				attachmentContainer.appendChild(attachmentLink);
			}

			postRightContainer.appendChild(attachmentContainer);
		}
	}


	// Handle thread
	if (message.hasThread)
	{
		var threadButton = document.createElement("button");
		threadButton.className = "thread-jump-button";
		threadButton.innerHTML = message.threadName;
		threadButton.onclick = function () {setDisplayedThread(message.thread)};
		postRightContainer.appendChild(threadButton);
	}

	return postContainer;
}


function setDisplayedChannel(channelID)
{
	var categoryID = document.getElementById(channelID).parentNode.parentNode.id;

	channel = guildInfo.categories.filter((cat) => cat.id == categoryID)[0].channels.filter((ch) => ch.id == channelID)[0];

	// Set display
	channelNameDisplay.innerHTML = channel.name;

	// Generate messages
	var messageFile = `./${categoryID}/${channelID}/messages.json`;

	displayMessages(messageFile, channelID);
}


function setDisplayedThread(threadID)
{
	// Same as setDisplayedChannel but with different directory path for messages.json
	var channelID = document.getElementById(threadID).parentNode.parentNode.id;
	var categoryID = document.getElementById(channelID).parentNode.parentNode.id;

	var thread = guildInfo.categories.filter((cat) => cat.id == categoryID)[0].channels.filter((ch) => ch.id == channelID)[0].threads.filter((th) => th.id == threadID)[0];

	channelNameDisplay.innerHTML = thread.name;

	// Generate messages
	var messageFile = `./${categoryID}/${channelID}/threads/${threadID}/messages.json`;

	displayMessages(messageFile, channelID);
}


function displayMessages(messageFileName, channelID)
{
	messagePanel.innerHTML = "";

	fetch(messageFileName)
		.then((res) => res.json())
		.then((messages) => {
			var lastPostTime = 0;
			var lastPostAuthor;
			for (var message of messages)
			{
				// Append if webhook, different author, it's been a while since the last post, or if it has a thread
				if (message.isWebhook || message.author.id != lastPostAuthor || (message.createdTimestamp - lastPostTime)/1000/60 >= 7 || message.hasThread)
				{
					messagePanel.appendChild(constructPost(message, channelID, false));
				}
				else
				{
					messagePanel.appendChild(constructPost(message, channelID, true));
				}

				lastPostTime = message.createdTimestamp;
				lastPostAuthor = message.author.id;
			}
		})
		.then(() => {
			messagePanel.scrollTop = messagePanel.scrollHeight + 999999;
		});
}


function categoryArchived(category)
{
	var dname = `./${category.id}`;
}
function channelArchived(category, channel)
{

}

function constructCategory(category)
{
	var categoryContainer = document.createElement("div");
	categoryContainer.className = "category-container";
	categoryContainer.id = category.id;

	var categoryButton = document.createElement("button");
	categoryButton.className = "category-button";

	var categoryLabel = document.createElement("span");
	categoryLabel.className = "category-label";
	categoryLabel.innerHTML = category.name.toUpperCase();

	categoryButton.appendChild(categoryLabel);
	categoryContainer.appendChild(categoryButton);

	var channelList = document.createElement("div");
	channelList.className = "channel-list";

	for (var channel of category.channels)
	{
		var channelContainer = document.createElement("div");
		channelContainer.className = "channel-container";
		channelContainer.id = channel.id;

		var channelButton = document.createElement("button");
		channelButton.className = "channel-button";
		channelButton.onclick = function() {setDisplayedChannel(this.parentNode.id)};

		var channelLabel = document.createElement("span");
		channelLabel.className = "channel-label";
		channelLabel.innerHTML = channel.name;

		channelButton.appendChild(channelLabel);
		channelContainer.append(channelButton);

		if (channel.threads.length > 0)
		{
			var threadList = document.createElement("div");
			threadList.className = "thread-list";

			for (var thread of channel.threads)
			{
				var threadButton = document.createElement("button");
				threadButton.className = "thread-button";
				threadButton.id = thread.id;
				threadButton.onclick = function() {setDisplayedThread(this.id)};

				var threadLabel = document.createElement("span");
				threadLabel.className = "thread-label";
				threadLabel.innerHTML = thread.name;

				threadButton.appendChild(threadLabel);
				threadList.appendChild(threadButton);
			}
			channelContainer.appendChild(threadList);
		}

		channelList.appendChild(channelContainer);
	}

	categoryContainer.appendChild(channelList);

	// Add category container to category-panel
	categoryPanel.appendChild(categoryContainer);
}


// Build the category/channel/thread list
fetch("info.json")
	.then((res) => res = res.json())
	.then((res) => {

		guildInfo = res;
		setServerName(guildInfo.name);


		// Sort the categories and channels by position
		sortByPosition(guildInfo.categories);

		for (var category of guildInfo.categories)
		{
			sortByPosition(category.channels);
		}


		// Make the buttons in channel list
		for (var category of guildInfo.categories)
		{
			constructCategory(category);
		}

	});
