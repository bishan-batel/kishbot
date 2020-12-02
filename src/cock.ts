import Discord from "discord.js";
import config from "./config";
import firebase, { serverTimestamp } from "./firebase";
const firestore = firebase.firestore(),
	countRef = firestore.collection("cock").doc("count"),
	logsRef = countRef.collection("logs");

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

const getCount = async (): Promise<number> =>
	(await countRef.get())?.data()?.current;

// Called whenever cock is detected
const countTrigger = async (): Promise<number> => {
	const count = (await getCount()) + 1;
	countRef.set({ current: count }, { merge: true }); // Reassigns count to be incremenetd
	return count;
};

export const logInterval = () => {
	const createLog = async () => {
		const count = await getCount();
		logsRef.add({
			time: serverTimestamp(),
			count,
		});
		setTimeout(createLog, config.cock.log.logIntervalMillis);
	};

	createLog();
};

export const handleCock = async (
	client: Discord.Client,
	msg: Discord.Message
) => {
	// Loops through all emojis and reacts to msg
	[
		findEmoji(msg, config.cock.emoji.headerName),
		...config.cock.emoji.message,
	].forEach((emoji) => msg.react(emoji));

	const count = await countTrigger(); // Calls to rewrite log & get new count

	// Reassigns user custom status
	client.user?.setActivity(`${count} Cocks`, { type: "LISTENING" });

	console.log(`${new Date().toISOString()}::${msg.author.username}@ ${count}`);
	// If count multiple of 10 it makes a little message
	if (count % config.cock.celebration.interval == 0)
		msg.channel.send(config.cock.celebration.message.replace("$c", `${count}`));
};
