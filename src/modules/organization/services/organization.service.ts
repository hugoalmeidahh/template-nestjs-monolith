import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPaginator } from 'prisma-pagination';
import { Prisma } from '../../../../prisma/generated/prisma/client';
import { PaginatedArgs } from '../../../helpers/paginated-response.helpers';
import { PrismaService } from '../../../providers/prisma/services/prisma.service';
import { ActionLogLevels } from '../../action-log/dtos/new-log.input';
import { ActionLogService } from '../../action-log/services/action-log.service';
import { OrganizationOutput } from '../dtos/organization.output';

@Injectable()
export class OrganizationService {
  private repository: PrismaService['organization'];
  constructor(
    private logger: ActionLogService,
    private config: ConfigService,
    prisma: PrismaService,
  ) {
    this.repository = prisma.organization;
  }

  getById(organizationId: number) {
    return this.repository.findUnique({ where: { id: organizationId } });
  }

  async create(data: Prisma.OrganizationCreateInput) {
    const result = await this.repository.create({
      data,
    });

    await this.logger.newLog({
      organizationId: result.id,
      userId: result.id,
      context: this.config.get('APP_NAME', 'Template Api Monolith'),
      action: 'Created new Organization',
      level: ActionLogLevels.log,
    });

    return result;
  }

  async update(id: number, data: Prisma.OrganizationUpdateInput) {
    const { name, document, logoPath, isActive } = data;

    const result = await this.repository.update({
      where: {
        id,
      },
      data: {
        ...(name && { name }),
        ...(document && { document }),
        ...(logoPath && { logoPath }),
        ...(typeof isActive === 'boolean' && { isActive }),
        updatedAt: new Date(),
      },
    });

    await this.logger.newLog({
      organizationId: result.id,
      userId: result.id,
      context: this.config.get('APP_NAME', 'Template Api Monolith'),
      action: `Updated Organization ${result.id}`,
      level: ActionLogLevels.log,
    });

    return result;
  }

  async getAllPaginated(params: PaginatedArgs) {
    const {
      page = 1,
      perPage = 10,
      orderBy = 'createdAt',
      order = 'desc',
    } = params;

    const paginate = createPaginator({
      perPage: Number(perPage),
      page: Number(page),
    });

    return paginate<OrganizationOutput, Prisma.OrganizationFindManyArgs>(
      this.repository,
      {
        orderBy: {
          [orderBy]: order,
        },
      },
    );
  }

  getAllLogsPaginated(id: number, params: PaginatedArgs) {
    return this.logger.getAllPaginated(params, {
      organizationId: id,
    });
  }
}
