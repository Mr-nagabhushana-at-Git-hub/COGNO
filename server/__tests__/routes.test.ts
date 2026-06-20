import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('API Routes', () => {
  let app: express.Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
  });

  describe('POST /api/journals', () => {
    it('should create a new journal entry', async () => {
      const mockJournal = {
        userId: 1,
        content: 'Today was a good day. I felt happy and productive.',
      };

      const response = await request(app)
        .post('/api/journals')
        .send(mockJournal)
        .expect('Content-Type', /json/);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('emotions');
    });

    it('should detect crisis keywords and set flag', async () => {
      const mockCrisisJournal = {
        userId: 1,
        content: 'I feel hopeless and want to harm myself.',
      };

      const response = await request(app)
        .post('/api/journals')
        .send(mockCrisisJournal);

      expect(response.body.crisisFlag).toBe(true);
      expect(response.body).toHaveProperty('helplineNumbers');
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/journals')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/journals/:userId', () => {
    it('should retrieve user journals', async () => {
      const response = await request(app)
        .get('/api/journals/1')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app)
        .get('/api/journals/99999')
        .expect(404);
    });
  });

  describe('POST /api/companion/chat', () => {
    it('should stream AI responses', async () => {
      const mockMessage = {
        userId: 1,
        message: 'I am feeling anxious today.',
      };

      const response = await request(app)
        .post('/api/companion/chat')
        .send(mockMessage);

      expect(response.headers['content-type']).toContain('text/event-stream');
    });

    it('should inject user trigger context', async () => {
      const mockMessage = {
        userId: 1,
        message: 'What should I do?',
      };

      const response = await request(app)
        .post('/api/companion/chat')
        .send(mockMessage);

      // Response should be personalized based on user's stress triggers
      expect(response.status).toBe(200);
    });
  });
});
