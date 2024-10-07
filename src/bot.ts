import {
  Client,
  GatewayIntentBits,
  Message,
  TextChannel,
  ChannelType,
} from "discord.js";
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

async function createTicket(
  guildId: string,
  channelId: string,
  creatorId: string
) {
  return prisma.ticket.create({
    data: {
      guildId,
      channelId,
      creatorId,
    },
  });
}

async function closeTicket(ticketId: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });
}

async function saveTicketMessage(
  ticketId: string,
  authorId: string,
  content: string
) {
  return prisma.ticketMessage.create({
    data: {
      ticketId,
      authorId,
      content,
    },
  });
}

client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const settings = await getServerSettings(message.guild.id);

  if (message.content.startsWith(`${settings.prefix}ticket`)) {
    const ticketChannel = await message.guild.channels.create({
      name: `ticket-${message.author.username}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: message.guild.id,
          deny: ["ViewChannel"],
        },
        {
          id: message.author.id,
          allow: ["ViewChannel", "SendMessages"],
        },
      ],
    });

    const ticket = await createTicket(
      message.guild.id,
      ticketChannel.id,
      message.author.id
    );

    await ticketChannel.send(
      `Ticket created for ${message.author}. Use \`${settings.prefix}close\` to close this ticket.`
    );
    message.reply(`Ticket created! Please check ${ticketChannel}`);
  } else if (message.content.startsWith(`${settings.prefix}close`)) {
    const ticket = await prisma.ticket.findFirst({
      where: {
        channelId: message.channel.id,
        status: "OPEN",
      },
    });

    if (ticket) {
      await closeTicket(ticket.id);
      await message.channel.send(
        "This ticket is now closed. The channel will be deleted in 5 seconds."
      );
      setTimeout(() => {
        (message.channel as TextChannel).delete();
      }, 5000);
    } else {
      message.reply("This is not an open ticket channel.");
    }
  } else if (message.channel.type == ChannelType.GuildText) {
    const ticket = await prisma.ticket.findUnique({
      where: { channelId: message.channel.id },
    });

    if (ticket && ticket.status === "OPEN") {
      await saveTicketMessage(ticket.id, message.author.id, message.content);
    }
  }

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
