import { TextChannel } from "discord.js";
import { Command } from "../types/command";
import { closeTicket } from "../utils/ticketSystem";

const close: Command = {
  name: "close",
  description: "Closes the current ticket",
  execute: async (message, args, prisma) => {
    if (!(message.channel instanceof TextChannel)) {
      await message.reply("This command can only be used in text channels.");
      return;
    }

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
        message.channel
          .delete()
          .catch((error) => console.error("Failed to delete channel: ", error));
      }, 5000);
    } else {
      await message.reply("This is not an open ticket channel.");
    }
  },
};

export default close;
