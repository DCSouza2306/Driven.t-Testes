import { notFoundError } from '@/errors';
import forbiddenError from '@/errors/forbidden-error';
import bookingRepository from '@/repositories/booking-repository';
import hotelRepository from '@/repositories/hotel-repository';
import enrollmentRepository from '@/repositories/enrollment-repository';
import ticketRepository from '@/repositories/ticket-repository';

async function findBooking(userId: number) {
  const booking = await bookingRepository.findByUserId(userId);
  if (!booking) {
    throw notFoundError();
  }
  return booking;
}

async function createBooking(roomId: number, userId: number) {
  await validateEnrollmentAndTicket(userId);
  await validateRoom(roomId);

  const booking = await bookingRepository.create(roomId, userId);
  return { bookingId: booking.id };
}

async function updateBooking(roomId: number, bookingId: number, userId: number) {
  await validateEnrollmentAndTicket(userId);
  await validateRoom(roomId);
  const bookingExist = await bookingRepository.findById(bookingId);
  if (!bookingExist) {
    throw forbiddenError();
  }
  if (bookingExist.userId != userId) {
    throw forbiddenError();
  }

  const booking = await bookingRepository.update(bookingId, roomId);
  return {bookingId: booking.id}
}

async function validateEnrollmentAndTicket(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) {
    throw forbiddenError();
  }
  const ticket = await ticketRepository.findTicketByEnrollmentId(enrollment.id);

  if (ticket.status === 'RESERVED' || ticket.TicketType.isRemote || !ticket.TicketType.includesHotel) {
    throw forbiddenError();
  }
}

async function validateRoom(roomId: number) {
  const roomExist = await hotelRepository.findRoomById(roomId);
  if (!roomExist) {
    throw notFoundError();
  }

  const bookingCount = await bookingRepository.countBookings(roomId);
  if (bookingCount == roomExist.capacity) {
    throw forbiddenError();
  }
}

const bookingService = {
  findBooking,
  createBooking,
  updateBooking,
};

export type bookingInputParams = {
  roomId: number;
};

export default bookingService;
