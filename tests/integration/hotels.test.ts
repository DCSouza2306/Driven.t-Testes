import app, { init } from '@/app';
import { cleanDb, generateValidToken } from '../helpers';
import supertest from 'supertest';
import { createHotel } from '../factories/hotels-factory';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import { createEnrollmentWithAddress, createTicket, createTicketTypeRemoteAndHotel, createUser } from '../factories';
import jwt from 'jsonwebtoken';

beforeAll(async () => {
  await init();
  await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
  it('should respond with status 401 if no token is given', async () => {
    const response = await server.get('/hotels');

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token is invalid', async () => {
    const token = faker.lorem.word();
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  it('should respond with status 401 if given token has no session', async () => {
    const userWithoutSession = await createUser();
    const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
    const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);

    expect(response.statusCode).toBe(httpStatus.UNAUTHORIZED);
  });

  describe('when token is valid', () => {
    it('should response with status code 404 if user doesnt have enrollment', async () => {
      const token = await generateValidToken();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should response with status code 404 if user doesnt have a ticket', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      await createEnrollmentWithAddress(user);

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.NOT_FOUND);
    });

    it('should response with status code 402 if event is remote', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemoteAndHotel(true, false);
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should response with status code 402 if ticket doesnt include hotel', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemoteAndHotel(false, false);
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should response with status code 402 if ticket is not paid', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemoteAndHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, 'RESERVED');

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.PAYMENT_REQUIRED);
    });

    it('should response with status code 200 and with hotels data', async () => {
      const user = await createUser();
      const token = await generateValidToken(user);
      const enrollment = await createEnrollmentWithAddress(user);
      const ticketType = await createTicketTypeRemoteAndHotel(false, true);
      await createTicket(enrollment.id, ticketType.id, 'PAID');
      const hotel = await createHotel();

      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(httpStatus.OK);
      expect(response.body).toEqual([{
        id: hotel.id,
        name: hotel.name,
        image: hotel.image,
        createdAt: hotel.createdAt.toISOString(),
        updatedAt: hotel.updatedAt.toISOString()
      }])
    });
  });
});
