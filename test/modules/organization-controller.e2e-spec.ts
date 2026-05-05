import { faker } from '@faker-js/faker';
import * as request from 'supertest';
import { GlobalTestsInfra } from '../global-before-all';
import { AUTH } from '../helpers/prisma-test.helpers';

const GLOBAL = global as unknown as GlobalTestsInfra;

describe('OrganizationController (e2e)', () => {
  const app = GLOBAL.__app__;
  const vars = GLOBAL.__constants__;

  it('/organizations (POST)', async () => {
    const name = faker.company.name();
    const document = faker.finance.accountNumber(11);
    const logoPath = faker.company.name();

    const response = await request(app.getHttpServer())
      .post('/organizations')
      .auth(AUTH[0], AUTH[1])
      .send({
        name,
        document,
        logo_path: logoPath,
      });

    expect(response.statusCode).toBe(201);
    expect(response.body).toHaveProperty('is_active', true);
    expect(response.body).not.toHaveProperty('updated_at');
    expect(response.body).toHaveProperty('name', name);
    expect(response.body).toHaveProperty('document', document);
    expect(response.body).toHaveProperty('logo_path', logoPath);
  });

  it('/organizations (GET)', async () => {
    const perPage = 8;

    const response = await request(app.getHttpServer())
      .get(`/organizations?per_page=${perPage}`)
      .auth(AUTH[0], AUTH[1]);

    const item = response.body.data?.[0];

    expect(response.statusCode).toBe(200);
    expect(response.body.data).toBeDefined();
    expect(response.body.meta).toBeDefined();
    expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    expect(response.body.data.length).toBeLessThanOrEqual(perPage);
    expect(response.body).not.toHaveProperty('updated_at');
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('document');
    expect(item).toHaveProperty('logo_path');
    expect(item).not.toHaveProperty('updated_at');
  });
});
