import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getServerSettings(guildId: string) {
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

export { prisma };
