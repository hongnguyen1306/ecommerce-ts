import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { checkPageNumber } from 'utils';
import { Product } from 'database/models/product.entity';
import type { PagyDto } from 'dto';

@Injectable()
export class GetListProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public async exec({ page, perPage }: PagyDto): Promise<[Product[], number]> {
    return this.productRepository.findAndCount({
      order: { createdAt: 'DESC' },
      take: perPage,
      skip: checkPageNumber({ page, perPage }),
    });
  }
}
