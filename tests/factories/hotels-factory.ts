import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return prisma.hotel.create({
    data: {
      id: 1,
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRooms(hotelId: number) {
  return prisma.room.create({
    data: {
      name: faker.random.numeric(4),
      hotelId,
      capacity: faker.datatype.number(),
    }
  })
}
