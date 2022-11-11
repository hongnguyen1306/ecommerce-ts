import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Product } from 'database/models/product.entity';

@Injectable()
export class GetProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public async exec(slug: string): Promise<Product> {
    const findProduct = await this.productRepository.findOneBy({
      slug,
    });

    if (!findProduct) {
      throw new NotFoundException(`Not found ${slug}`);
    }

    return findProduct;
  }
}
