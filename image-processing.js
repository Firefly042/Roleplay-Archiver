const Jimp = require("jimp");
const fs = require("fs");
const path = require("path");
const maxImgDim = 512;


async function compressImage(imgFile)
{
	var img = await Jimp.read(imgFile);
	if (img.bitmap.width > maxImgDim || img.bitmap.height > maxImgDim)
	{	
		await img.scaleToFit(maxImgDim, maxImgDim);
		await img.quality(75);
		await img.writeAsync(imgFile);
	}
}


function getFiles(fpath, fileArray)
{
	files = fs.readdirSync(fpath);
	fileArray = fileArray || [];

	files.forEach((file) => {
		if (fs.statSync(`${fpath}/${file}`).isDirectory())
		{
			fileArray = getFiles(`${fpath}/${file}`, fileArray);
		}
		else
		{
			fileArray.push(path.join(__dirname, fpath, "/", file));
		}
	});

	return fileArray;
}

async function compressImages(guildID)
{
	var files = getFiles(`guild_caches/${guildID}/_attachments`, []);

	for (file of files)
	{
		try 
		{
			await compressImage(file);
		}	
		catch (error)
		{
			// console.error(error);
		}
	}
}


module.exports = {
	compressImages: compressImages
};