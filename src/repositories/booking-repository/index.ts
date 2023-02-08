import { prisma } from '@/config';

async function findByUserId(userId: number) {
  return prisma.booking.findFirst({
    where: { userId },
    select: {
      id: true,
      Room: true,
    },
  });
}

async function countBookings(roomId: number) {
  return prisma.booking.count({
    where: { roomId },
  });
}

async function create(roomId: number, userId: number){
  return prisma.booking.create({
    data: {
      roomId,
      userId
    }
  })
}

const bookingRepository = {
  findByUserId,
  countBookings,
  create
};

export default bookingRepository;
