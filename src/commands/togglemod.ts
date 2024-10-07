import { Command } from "../types/command";
import { getServerSettings } from "../utils/database";

const togglemod: Command = {
  name: "togglemod",
  description: "Toggle moderation features on or off",
  execute: async (message, args, prisma) => {
    if (!message.guild) {
      await message.reply("This command can only be used in a server.");
      return;
    }

    // Check if the user has the MANAGE_GUILD permission
    if (!message.member?.permissions.has("ManageGuild")) {
      await message.reply(
        "You need the Manage Server permission to toggle moderation features."
      );
      return;
    }

    const settings = await getServerSettings(message.guild.id);

    // Toggle the moderationEnabled status
    const newStatus = !settings.moderationEnabled;

    // Update the status in the database
    await prisma.serverSettings.update({
      where: { guildId: message.guild.id },
      data: { moderationEnabled: newStatus },
    });

    // Prepare response message
    const statusMessage = newStatus ? "enabled" : "disabled";
    const responseMessage = `Moderation features are now ${statusMessage} for this server.`;

    // If moderation is enabled, you might want to add some instructions
    const additionalInfo = newStatus
      ? "\n\nThe bot will now perform moderation tasks such as filtering inappropriate content and warning users. You can customize moderation settings with the `!modsettings` command (not implemented yet)."
      : "";

    await message.reply(responseMessage + additionalInfo);

    // Log the change
    console.log(
      `Moderation ${statusMessage} in guild ${message.guild.name} (${message.guild.id}) by user ${message.author.tag} (${message.author.id})`
    );
  },
};

export default togglemod;
