import { authenticateToken, validateBody } from '@/middlewares';
import { Router } from 'express';
import { bookingSchema } from '@/schemas/booking-schema';
import { getBooking, postBooking, updateBooking } from '@/controllers';

const bookingRouter = Router();

bookingRouter.all("/*", authenticateToken)
.get("/",getBooking)
.post("/", validateBody(bookingSchema), postBooking)
.put("/:bookingId", validateBody(bookingSchema), updateBooking)

export { bookingRouter };
