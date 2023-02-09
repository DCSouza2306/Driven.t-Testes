import { AuthenticatedRequest } from '@/middlewares';
import { Response } from 'express';
import httpStatus from 'http-status';
import bookingService from '@/services/booking-service';
import { bookingInputParams } from '@/services/booking-service';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const booking = await bookingService.findBooking(userId);
    res.status(httpStatus.OK).send(booking);
  } catch (e) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const { roomId } = req.body as bookingInputParams;
  const userId = req.userId;
  try {
    const booking = await bookingService.createBooking(roomId, userId);
    res.status(httpStatus.OK).send(booking);
  } catch (e) {
    if (e.name == 'ForbidenError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (e.name == 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}

export async function updateBooking(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const { bookingId } = req.params;
  const { roomId } = req.body as bookingInputParams;
  try {
    const booking = await bookingService.updateBooking(roomId, parseInt(bookingId), userId);
    res.status(httpStatus.OK).send(booking);
  } catch (e) {
    if (e.name == 'ForbidenError') {
      return res.sendStatus(httpStatus.FORBIDDEN);
    }
    if (e.name == 'NotFoundError') {
      return res.sendStatus(httpStatus.NOT_FOUND);
    }
  }
}
