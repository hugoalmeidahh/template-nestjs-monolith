import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumberString,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateOrganizationInput {
  @ApiProperty({ type: String, required: false })
  @MaxLength(100)
  @MinLength(2)
  @IsOptional()
  name?: string;

  @ApiProperty({ type: String, required: false })
  @MaxLength(20)
  @IsNumberString()
  @IsOptional()
  document?: string;

  @ApiProperty({ type: String, required: false })
  @MaxLength(100)
  @IsOptional()
  logoPath?: string;
}
