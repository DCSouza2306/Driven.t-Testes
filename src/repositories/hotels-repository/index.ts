import { prisma } from "@/config";

export async function getAll(){
    return await prisma.hotel.findMany();
}


const hotelRepository = {
    getAll
};

export default hotelRepository;