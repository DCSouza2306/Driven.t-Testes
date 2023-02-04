import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import hotelService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  try {
    const hotels = await hotelService.getAllHotels(userId);
    res.status(httpStatus.OK).send(hotels);
  } catch (e) {
    if(e.name == "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND)
    if(e.name == "PaymentRequired") return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const { hotelId } = req.params;
  try {
    const hotel = await hotelService.getHotelById(userId, parseInt(hotelId));
    res.status(httpStatus.OK).send(hotel)
  } catch (e) {
    if(e.name == "NotFoundError") return res.sendStatus(httpStatus.NOT_FOUND)
    if(e.name == "PaymentRequired") return res.sendStatus(httpStatus.PAYMENT_REQUIRED)
  }
}
