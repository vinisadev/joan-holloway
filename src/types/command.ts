import { Message } from "discord.js";
import { PrismaClient } from "@prisma/client";

export interface Command {
  name: string;
  description: string;
  execute: (
    message: Message,
    args: string[],
    prisma: PrismaClient
  ) => Promise<void>;
}
