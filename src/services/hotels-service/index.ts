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
};

export default hotelService;
