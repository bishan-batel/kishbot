import config from "./config";
import token from "./token";
import Discord, { Client, SystemChannelFlags } from "discord.js";
import { handleCock, logInterval } from "./cock";

const client = new Client();

// Boots when file first serves
client.on("ready", () => {
  client.user?.setActivity("Rofl", { type: "LISTENING" });
  logInterval();
  console.log(`Logged in as ${client.user?.username}`);
});

client.on("message", (msg) => {
	if (msg.author.bot) return;
	// 'cock' parsing
	if (msg.content.match(config.cock.dickRegex)) handleCock(client, msg);
});

client.login(token);
