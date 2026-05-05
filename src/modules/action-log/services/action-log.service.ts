import { Injectable, Logger } from '@nestjs/common';
import { createPaginator } from 'prisma-pagination';
import { Prisma } from '../../../../prisma/generated/prisma/client';
import { PaginatedArgs } from '../../../helpers/paginated-response.helpers';
import { ValidatorHelper } from '../../../helpers/validator.helper';
import { PrismaService } from '../../../providers/prisma/services/prisma.service';
import { ActionLogOutput } from '../dtos/action-log.output';
import { ActionLogLevels, NewLogInput } from '../dtos/new-log.input';

@Injectable()
export class ActionLogService {
  private readonly logger = new Logger(ActionLogService.name);

  private repository: PrismaService['actionLog'];

  constructor(prisma: PrismaService) {
    this.repository = prisma.actionLog;
  }

  private showLog(params: NewLogInput) {
    const { level, context, action, organizationId, userId } = params;

    return this.logger[level ?? ActionLogLevels.log](
      `${context}(${organizationId}:${userId}) - ${action}`,
    );
  }

  pinoRequestIntercept(req: Record<string, any>): string | Record<string, any> {
    return req;
  }

  pinoRequestResponseIntercept(
    res: Record<string, any>,
  ): string | Record<string, any> {
    return res;
  }

  async newLog(payload: NewLogInput) {
    const params = await ValidatorHelper(NewLogInput, payload);
    const { context, action } = params;

    this.showLog(params);

    return this.repository.create({
      data: {
        action,
        context,
        userId: params.userId,
        organization: { connect: { id: params.organizationId } },
      },
    });
  }

  async getAllPaginated(
    params: PaginatedArgs,
    where?: Prisma.ActionLogWhereInput,
  ) {
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

    return paginate<ActionLogOutput, Prisma.ActionLogFindManyArgs>(
      this.repository,
      {
        where,
        orderBy: {
          [orderBy]: order,
        },
      },
    );
  }
}
