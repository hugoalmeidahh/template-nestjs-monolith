import { ApiProperty } from '@nestjs/swagger';
import { Exclude, plainToInstance } from 'class-transformer';

export class UserOutput {
  @ApiProperty({ type: Number })
  id!: number;

  @ApiProperty({ type: Number })
  onboardingId!: number;

  @ApiProperty({ type: String })
  name!: string;

  @ApiProperty({ type: String })
  document!: string;

  @ApiProperty({ type: String })
  email!: string;

  @ApiProperty({ type: Date })
  createdAt!: Date | string;

  @Exclude()
  updatedAt?: Date | string | null;

  static getInstance(data: Partial<UserOutput>) {
    return plainToInstance(UserOutput, data);
  }
}
