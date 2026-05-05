import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateOrganizationInput {
  @ApiProperty({ type: String })
  @MaxLength(100)
  @MinLength(2)
  name!: string;

  @ApiProperty({ type: String })
  @MaxLength(20)
  @IsNumberString()
  document!: string;

  @ApiProperty({ type: String, required: false })
  @MaxLength(100)
  @IsOptional()
  logoPath!: string;
}
