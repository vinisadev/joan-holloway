import { Command } from "../types/command";
import { getServerSettings } from "../utils/database";

const prefix: Command = {
  name: "prefix",
  description: "View or change the server's command prefix",
  execute: async (message, args, prisma) => {
    if (!message.guild) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    const settings = await getServerSettings(message.guild.id);

    if (args.length === 0) {
      // If no arguments, just show the current prefix
      await message.reply(`The current prefix is \`${settings.prefix}\``);
      return;
    }

    // Check if the user has the MANAGE_GUILD permission
    if (!message.member?.permissions.has("ManageGuild")) {
      await message.reply(
        "You need the Manage Server permission to change the prefix."
      );
      return;
    }

    const newPrefix = args[0];

    // You might want to add some validation here, e.g., max length
    if (newPrefix.length > 5) {
      await message.reply("The prefix must be 5 characters or less.");
      return;
    }

    // Update the prefix in the database
    await prisma.serverSettings.update({
      where: { guildId: message.guild.id },
      data: { prefix: newPrefix },
    });

    await message.reply(`Prefix updated to \`${newPrefix}\``);
  },
};

export default prefix;
