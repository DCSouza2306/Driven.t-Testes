import { AuthenticatedRequest } from "@/middlewares";
import { Response } from "express";
import httpStatus from "http-status";
import bookingService from "@/services/booking-service";

export async function getBooking(req: AuthenticatedRequest, res: Response){
    const userId = req.userId
    try{
        const booking = await bookingService.findBooking(userId)
        res.status(httpStatus.OK).send(booking)
    } catch(e){
        res.sendStatus(httpStatus.NOT_FOUND)
    }
}

export async function postBooking(req: AuthenticatedRequest, res: Response){

}

export async function updateBooking(req: AuthenticatedRequest, res: Response){

}