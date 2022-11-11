import { Transform } from 'class-transformer';

export class PagyDto {
  @Transform(({ value }) => parseInt(value, 10))
  page: number;

  @Transform(({ value }) => parseInt(value, 10))
  perPage: number;
}
