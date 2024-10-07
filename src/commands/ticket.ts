import { ChannelType } from "discord.js";
import { Command } from "../types/command";
import { createTicket } from "../utils/ticketSystem";

const ticket: Command = {
  name: "ticket",
  description: "Creates a new support ticket",
  execute: async (message, args, prisma) => {
    const ticketChannel = await message.guild?.channels.create({
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

    if (ticketChannel) {
      const ticket = await createTicket(
        message.guild!.id,
        ticketChannel.id,
        message.author.id
      );

      const settings = await prisma.serverSettings.findUnique({
        where: { guildId: message.guild!.id },
      });

      await ticketChannel.send(
        `Ticket created for ${message.author}. Use \`${
          settings?.prefix || "!"
        }close\` to close this ticket.`
      );
      await message.reply(`Ticket created! Please check ${ticketChannel}`);
    }
  },
};

export default ticket;
