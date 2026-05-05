import { ApiProperty } from '@nestjs/swagger';
import { Exclude, plainToInstance } from 'class-transformer';

export class ActionLogOutput {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  userId!: number;

  @Exclude()
  organizationId!: number;

  @ApiProperty({ type: String })
  context!: string;

  @ApiProperty({ type: String })
  action!: string;

  @ApiProperty({ type: Date })
  createdAt?: Date | string | null;

  static getInstance(data: Partial<ActionLogOutput>) {
    return plainToInstance(ActionLogOutput, data);
  }
}
