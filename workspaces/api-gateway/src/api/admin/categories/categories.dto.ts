import { PartialType } from '@nestjs/mapped-types';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  parentId?: string;
}

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {
  slug: string;
}
