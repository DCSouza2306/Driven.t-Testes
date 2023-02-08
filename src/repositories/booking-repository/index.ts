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

async function findById(bookingId: number) {
  return prisma.booking.findFirst({
    where: { id: bookingId },
  });
}

async function countBookings(roomId: number) {
  return prisma.booking.count({
    where: { roomId },
  });
}

async function create(roomId: number, userId: number) {
  return prisma.booking.create({
    data: {
      roomId,
      userId,
    },
  });
}

async function update(bookingId: number, roomId: number){
  return prisma.booking.update({
    where: {id: bookingId},
    data:{
      roomId
    }
  })
}

const bookingRepository = {
  findByUserId,
  findById,
  countBookings,
  create,
  update
};

export default bookingRepository;
