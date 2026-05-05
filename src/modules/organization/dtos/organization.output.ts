import { ApiProperty } from '@nestjs/swagger';
import { Exclude, plainToInstance } from 'class-transformer';

export class OrganizationOutput {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  document?: string | null;

  @ApiProperty({ type: String })
  logoPath?: string | null;

  @ApiProperty({ type: Boolean })
  isActive?: boolean | null;

  @ApiProperty({ type: Date })
  createdAt?: Date | string | null;

  @Exclude()
  updatedAt?: Date | string | null;

  static getInstance(data: Partial<OrganizationOutput>) {
    return plainToInstance(OrganizationOutput, data);
  }
}
