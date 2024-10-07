import { Client, GatewayIntentBits, Message, Collection } from "discord.js";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Command } from "./types/command";
import { prisma, getServerSettings } from "./utils/database";
import { saveTicketMessage } from "./utils/ticketSystem";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<string, Command>();
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
  const commandModule = require(`./commands/${file}`);
  const command: Command = commandModule.default;
  commands.set(command.name, command);
}

client.once("ready", () => {
  console.log("Bot is ready!");
});

client.on("messageCreate", async (message: Message) => {
  if (message.author.bot || !message.guild) return;

  const settings = await getServerSettings(message.guild.id);

  if (!message.content.startsWith(settings.prefix)) {
    const ticket = await prisma.ticket.findUnique({
      where: { channelId: message.channel.id },
    });

    if (ticket && ticket.status === "OPEN") {
      await saveTicketMessage(ticket.id, message.author.id, message.content);
    }
    return;
  }

  const args = message.content.slice(settings.prefix.length).trim().split(/ +/);
  const commandName = args.shift()?.toLowerCase();

  if (!commandName) return;

  const command = commands.get(commandName);

  if (!command) return;

  try {
    await command.execute(message, args, prisma);
  } catch (error) {
    console.error(error);
    await message.reply("There was an error executing that command.");
  }
});

client.login(process.env.DISCORD_TOKEN);
