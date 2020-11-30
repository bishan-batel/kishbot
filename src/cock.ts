import Discord from "discord.js";
import config from "./config";
import fs from "fs";

// Used to locate emojis (ex. 'yep')
const findEmoji = (
	msg: Discord.Message,
	name: string
): Discord.GuildEmoji | string => {
	return (
		msg.guild?.emojis.cache.find((emoji) => emoji.name === name) ??
		config.cock.emoji.default
	);
};

const getCount = (): number => {
	return parseInt(fs.readFileSync(config.cock.log.mainLogDir).toString());
};

// Called whenever cock is detected
const countTrigger = (): number => {
	// Gets count, increments, then writes back
	const count = getCount() + 1;
	fs.writeFileSync(config.cock.log.mainLogDir, `${count}`);

	// Returns back updated count
	return count;
};

export const logInterval = () => {
	const onInterval = () => {
		// Converts date string into something that can be a filename
		const fileName = new Date()
			.toLocaleString()
			.replace(/\//, "_")
			.replace(/\//, "_")
			.replace(",", "");

		fs.writeFileSync(
			config.cock.log.statsDir + fileName + ".log",
			`${getCount()}`,
			{
				encoding: "utf8",
				flag: "w",
			}
		);

		setTimeout(onInterval, config.cock.log.logIntervalMillis);
	};

	onInterval();
};

export const handleCock = (client: Discord.Client, msg: Discord.Message) => {
	// Loops through all emojis and reacts to msg
	[
		findEmoji(msg, config.cock.emoji.headerName),
		...config.cock.emoji.message,
	].forEach((emoji) => msg.react(emoji));

	const count = countTrigger(); // Calls to rewrite log & get new count

	// Reassigns user custom status
	client.user?.setActivity(`${count} Cocks`, { type: "LISTENING" });

	// If count multiple of 10 it makes a little message
	if (count % config.cock.celebration.interval == 0)
		msg.channel.send(config.cock.celebration.message.replace("$c", `${count}`));
};
