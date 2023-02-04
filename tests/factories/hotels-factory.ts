import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
  return await prisma.hotel.create({
    data: {
      id: 1,
      name: faker.company.companyName(),
      image: faker.image.imageUrl(),
    },
  });
}

export async function createRooms(hotelId: number) {}
