import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import hotelService from '@/services/hotels-service';

export async function getHotels(req: AuthenticatedRequest, res: Response) {
  try {
    const hotels = await hotelService.getAllHotels();
    res.status(httpStatus.OK).send(hotels)
  } catch (e) {
    res.sendStatus(httpStatus.NOT_FOUND);
  }
}

export async function getHotelsById(req: AuthenticatedRequest, res: Response) {}
