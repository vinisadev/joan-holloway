import { Command } from "../types/command";

const viewwelcome: Command = {
  name: "viewwelcome",
  description: "View the current welcome message for new members",
  execute: async (message, args, prisma) => {
    if (!message.guild) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    const settings = await prisma.serverSettings.findUnique({
      where: { guildId: message.guild.id },
    });

    if (!settings || !settings.welcomeMessage) {
      await message.reply("No welcome message has been set for this server.");
    } else {
      await message.reply(
        `The current welcome message is:\n\n${settings.welcomeMessage}`
      );
    }
  },
};

export default viewwelcome;
