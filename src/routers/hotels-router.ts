import { authenticateToken } from '@/middlewares';
import { Router } from 'express';
import { getHotels, getHotelsById } from '@/controllers';

const hotelsRouter = Router();

hotelsRouter.all('/*', authenticateToken).get('', getHotels).get('/:hotelId', getHotelsById);

export { hotelsRouter };
