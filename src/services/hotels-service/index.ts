import enrollmentRepository from '@/repositories/enrollment-repository';
import hotelRepository from '@/repositories/hotels-repository';
import { notFoundError } from '@/errors';
import ticketRepository from '@/repositories/ticket-repository';
import { paymentRequired } from './errors';

export async function getAllHotels(userId: number) {
  await userAndTicketValidation(userId);
  const hotels = await hotelRepository.getAll();
  return hotels;
}

export async function getHotelById(userId: number, hotelId: number) {
  await userAndTicketValidation(userId);

  const hotel = await hotelRepository.getHotelById(hotelId);
  if (!hotel) throw notFoundError();

  return hotel;
}

async function userAndTicketValidation(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw notFoundError();

  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw notFoundError();
  const ticketType = ticket.TicketType;

  if (ticketType.includesHotel == false || ticketType.isRemote == true || ticket.status == 'RESERVED')
    throw paymentRequired();
}
const hotelService = {
  getAllHotels,
  getHotelById,
};

export default hotelService;
