import hotelRepository from "@/repositories/hotels-repository";

export async function getAllHotels(){
    const hotels = await hotelRepository.getAll();
    return hotels;
}

const hotelService = {
    getAllHotels
};

export default hotelService