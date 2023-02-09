import app, { init } from '@/app';
import supertest from 'supertest';
import { cleanDb, generateValidToken } from '../helpers';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import {
  createEnrollmentWithAddress,
  createTicketTypeWithHotel,
  createUser,
  createTicket,
  createHotel,
  createRoomWithHotelId,
  createTicketTypeRemote,
} from '../factories';
import jwt from 'jsonwebtoken';
import { createBooking, createManyBookings } from '../factories/booking-factory';
import { Room } from '@prisma/client';
import { Booking } from '@prisma/client';
import { number } from 'joi';

type bookingBodyParams = Partial<Booking & Room>;

beforeAll(async () => {
  await init();
});

beforeEach(async () => {
  await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });
  describe('when token is valid', () => {
    it('Should response with status 404 when user hasnt a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });

    it('Should response with status 200 and booking data if user has a booking', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeWithHotel();
      await createTicket(enrollment.id, ticketType.id, 'PAID');
      const hotel = await createHotel();
      const room = await createRoomWithHotelId(hotel.id);
      const booking = await createBooking(user.id, room.id);
      const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        id: booking.id,
        Room: {
          id: room.id,
          name: room.name,
          capacity: room.capacity,
          hotelId: room.hotelId,
          createdAt: room.createdAt.toISOString(),
          updatedAt: room.updatedAt.toISOString(),
        },
      });
    });
  });
});

describe('POST /booking', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/booking');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('Should response with status 400 when body hasnt given', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    it('Should response with status 400 when given body is invalid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const body = { [faker.lorem.word()]: faker.lorem.word() };

      const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

      expect(response.status).toEqual(httpStatus.BAD_REQUEST);
    });

    describe('when body is valid', () => {
      it('Should response with status 403 when user doesnt have an enrollment', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const body = { roomId: 1 };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should response with status 403 when ticket is remote, doesnt includes hotel or not paid ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeRemote();
        await createTicket(enrollment.id, ticketType.id, 'PAID');
        const body = { roomId: 1 };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should response with status 404 when room doesnt exist for given roomId ', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, 'PAID');
        const body = { roomId: 0 };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.NOT_FOUND);
      });

      it('Should response with status 403 when room is not available, capacity full', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, 'PAID');
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        await createManyBookings(user.id, room.id)
        const body = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.FORBIDDEN);
      });

      it('Should response with status 200 and bookingId', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketTypeWithHotel();
        await createTicket(enrollment.id, ticketType.id, 'PAID');
        const hotel = await createHotel()
        const room = await createRoomWithHotelId(hotel.id)
        const body = { roomId: room.id };
        const response = await server.post('/booking').set('Authorization', `Bearer ${token}`).send(body);

        expect(response.status).toBe(httpStatus.OK)
        expect(response.body).toEqual({
          bookingId: expect.any(Number)
        });
      });
    });
  });
});

/* describe("PUT /booking/:bookingId", () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.put('/booking/1');

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is not valid', async () => {
    const token = faker.lorem.word();

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if there is no session for given token', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

    const response = await server.put('/booking/1').set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  });

  describe("when token is valid", () => {
    
  })
}) */
