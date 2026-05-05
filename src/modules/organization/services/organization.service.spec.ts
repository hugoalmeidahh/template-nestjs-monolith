import { faker } from '@faker-js/faker';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { createOrganizationItems } from '../../../../test/seeds/organization.seeds-test';
import { PrismaModule } from '../../../providers/prisma/prisma.module';
import { PrismaService } from '../../../providers/prisma/services/prisma.service';
import { ActionLogModule } from '../../action-log/action-log.module';
import { ActionLogService } from '../../action-log/services/action-log.service';
import { OrganizationService } from './organization.service';

describe('OrganizationService', () => {
  const prismaMock = {
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
    },
  };

  const loggerMock = {
    newLog: jest.fn(),
    getAllPaginated: jest.fn(),
  };

  let service: OrganizationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        ActionLogModule,
      ],
      providers: [
        OrganizationService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: ActionLogService,
          useValue: loggerMock,
        },
      ],
    }).compile();

    service = module.get<OrganizationService>(OrganizationService);

    loggerMock.newLog.mockClear();
    loggerMock.getAllPaginated.mockClear();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create an organization', async () => {
    const name = faker.company.name();
    const document = faker.finance.accountNumber(11);
    const logoPath = faker.company.name();

    prismaMock.organization.create.mockImplementationOnce(({ data }) => ({
      ...data,
      id: faker.number.int(),
      createdAt: new Date(),
      isActive: true,
    }));

    const result = await service.create({
      name,
      document,
      logoPath,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('id');
    expect(result).toHaveProperty('name', name);
    expect(result).toHaveProperty('document', document);
    expect(result).toHaveProperty('logoPath', logoPath);
    expect(result).toHaveProperty('createdAt');
    expect(result).toHaveProperty('isActive', true);
    expect(loggerMock.newLog).toHaveBeenCalledTimes(1);
  });

  it('should update an organization', async () => {
    const id = faker.number.int();
    const name = faker.company.name();
    const document = faker.finance.accountNumber(11);
    const logoPath = faker.company.name();
    const createdAt = faker.date.past();
    const isActive = true;

    prismaMock.organization.update.mockImplementationOnce(
      ({ data, where }) => ({
        id,
        name,
        document,
        logoPath,
        createdAt,
        isActive,
        ...where,
        ...data,
      }),
    );

    const result = await service.update(id, {
      name,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('id', id);
    expect(result).toHaveProperty('name', name);
    expect(result).toHaveProperty('document', document);
    expect(result).toHaveProperty('logoPath', logoPath);
    expect(result).toHaveProperty('createdAt');
    expect(result.updatedAt).toBeDefined();
    expect(loggerMock.newLog).toHaveBeenCalledTimes(1);
  });

  it('should list all organizations paginated', async () => {
    const items = createOrganizationItems(25);
    const perPage = faker.number.int({ max: 12 });

    prismaMock.organization.findMany.mockImplementationOnce(({ take, skip }) =>
      items.slice(skip, skip + take),
    );
    prismaMock.organization.count.mockResolvedValueOnce(items.length);

    const result = await service.getAllPaginated({
      page: 1,
      perPage,
      order: 'asc',
      orderBy: 'name',
    });

    const item = result?.data?.[0];

    expect(result).toBeDefined();
    expect(result).toHaveProperty('data');
    expect(result).toHaveProperty('meta');
    expect(result.data.length).toBeGreaterThanOrEqual(1);
    expect(result.data.length).toBeLessThanOrEqual(perPage);
    expect(item).toHaveProperty('name');
    expect(item).toHaveProperty('document');
    expect(item).toHaveProperty('logoPath');
  });
});
