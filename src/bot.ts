import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const prisma = new PrismaClient();

client.once("ready", () => {
  console.log("Bot is ready!");
});

async function getServerSettings(guildId: string) {
  let settings = await prisma.serverSettings.findUnique({
    where: { guildId },
  });

  if (!settings) {
    settings = await prisma.serverSettings.create({
      data: { guildId },
    });
  }

  return settings;
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const settings = await getServerSettings(message.guild.id);

  if (message.content.startsWith(`${settings.prefix}ping`)) {
    message.reply("Pong!");
  } else if (message.content.startsWith(`${settings.prefix}prefix`)) {
    const args = message.content.split(" ");
    if (args.length > 1) {
      const newPrefix = args[1];
      await prisma.serverSettings.update({
        where: { guildId: message.guild.id },
        data: { prefix: newPrefix },
      });
      message.reply(`Prefix updated to ${newPrefix}`);
    } else {
      message.reply(`Current prefix is ${settings.prefix}`);
    }
  } else if (message.content.startsWith(`${settings.prefix}togglemod`)) {
    const newStatus = !settings.moderationEnabled;
    await prisma.serverSettings.update({
      where: { guildId: message.guild.id },
      data: { moderationEnabled: newStatus },
    });
    message.reply(`Moderation ${newStatus ? "enabled" : "disabled"}`);
  }
});

client.login(process.env.DISCORD_TOKEN);
