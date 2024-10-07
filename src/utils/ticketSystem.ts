import { prisma } from "./database";

export async function createTicket(
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

export async function closeTicket(ticketId: string) {
  return prisma.ticket.update({
    where: { id: ticketId },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
    },
  });
}

export async function saveTicketMessage(
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
