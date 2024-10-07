import { Command } from "../types/command";

const ping: Command = {
  name: "ping",
  description: "Replies with Pong!",
  execute: async (message) => {
    await message.reply("Pong!");
  },
};

export default ping;
