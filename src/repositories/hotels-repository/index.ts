import { prisma } from '@/config';
import { Hotel } from '@prisma/client';

export async function getAll() {
  return await prisma.hotel.findMany();
}



export async function getHotelById(id: number) {
  return prisma.hotel.findFirst({
    where: { id },
    include: { Rooms: true },
  });
};


const hotelRepository = {
  getAll,
  getHotelById,
};

export default hotelRepository;
