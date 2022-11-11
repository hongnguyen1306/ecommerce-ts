import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';

import { Product } from 'database/models/product.entity';

@Injectable()
export class DeleteProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  public async exec(slug: string): Promise<string> {
    const product = await this.productRepository.findOne({ where: { slug } });
    if (!product) {
      throw new NotFoundException(`Not found ${slug}`);
    }

    const deleteProduct = await this.productRepository.softDelete(product.id);
    if (deleteProduct.affected) {
      return 'Deleted!';
    } else {
      return 'Fail to delete';
    }
  }
}
