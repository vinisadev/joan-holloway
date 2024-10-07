import { Command } from "../types/command";

const setwelcome: Command = {
  name: "setwelcome",
  description: "Set the welcome message for new members",
  execute: async (message, args, prisma) => {
    if (!message.guild) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    if (!message.member?.permissions.has("ManageGuild")) {
      await message.reply(
        "You need the Manage Server permission to set the welcome message."
      );
      return;
    }

    const welcomeMessage = args.join(" ");
    if (!welcomeMessage) {
      await message.reply("Please provide a welcome message.");
      return;
    }

    await prisma.serverSettings.update({
      where: { guildId: message.guild.id },
      data: { welcomeMessage },
    });

    await message.reply("Welcome message has been set successfully!");
  },
};

export default setwelcome;
