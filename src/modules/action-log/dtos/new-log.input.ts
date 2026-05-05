import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export enum ActionLogLevels {
  debug = 'debug',
  error = 'error',
  log = 'log',
  warn = 'warn',
}

export class NewLogInput {
  @IsNumber()
  organizationId: number;

  @IsNumber()
  userId: number;

  @IsString()
  context: string;

  @IsString()
  action: string;

  @IsEnum(ActionLogLevels)
  @IsOptional()
  level: ActionLogLevels;
}
