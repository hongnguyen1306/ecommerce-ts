import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Product } from 'database/models/product.entity';

@Injectable()
export class CheckProductExistedService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public async exec(name: string, column: string): Promise<boolean> {
    const findProduct = await this.productRepository.findOne({
      where: {
        [column]: name,
      },
    });

    return !!findProduct;
  }
}
