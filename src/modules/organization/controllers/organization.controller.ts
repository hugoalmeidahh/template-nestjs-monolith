import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBasicAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import {
  PaginatedArgs,
  PaginatedResponse,
} from '../../../helpers/paginated-response.helpers';
import { ActionLogOutput } from '../../action-log/dtos/action-log.output';
import { CreateOrganizationInput } from '../dtos/create-organization.input';
import { OrganizationOutput } from '../dtos/organization.output';
import { UpdateOrganizationInput } from '../dtos/update-organization.input';
import { OrganizationService } from '../services/organization.service';

@ApiBasicAuth()
@UseGuards(AuthGuard('basic'))
@Controller('organizations')
export class OrganizationController {
  constructor(private service: OrganizationService) {}

  @Post()
  @ApiCreatedResponse({ type: OrganizationOutput })
  async createOne(@Body() data: CreateOrganizationInput) {
    const result = await this.service.create(data);

    return OrganizationOutput.getInstance(result);
  }

  @Patch(':id')
  @ApiOkResponse({ type: OrganizationOutput })
  async updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateOrganizationInput,
  ) {
    const result = await this.service.update(id, data);

    return OrganizationOutput.getInstance(result);
  }

  @Patch(':id/is-active/:value')
  @ApiNoContentResponse({
    description: 'success to update organization is active status',
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateIsActiveStatus(
    @Param('id', ParseIntPipe) id: number,
    @Param('value', ParseBoolPipe) value: boolean,
  ) {
    await this.service.update(id, { isActive: value });
  }

  @Get()
  @PaginatedResponse(OrganizationOutput)
  async getAllPaginated(@Query() params: PaginatedArgs) {
    const result = await this.service.getAllPaginated(params);

    return {
      ...result,
      data: result.data.map((item) => OrganizationOutput.getInstance(item)),
    };
  }

  @Get(':id/action-logs')
  @PaginatedResponse(ActionLogOutput)
  async getAllLogsPaginated(
    @Param('id', ParseIntPipe) id: number,
    @Query() params: PaginatedArgs,
  ) {
    const result = await this.service.getAllLogsPaginated(id, params);

    return {
      ...result,
      data: result.data.map((item) => ActionLogOutput.getInstance(item)),
    };
  }
}
