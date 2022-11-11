import { Column, Entity, ManyToOne } from 'typeorm';
import { AutoMap } from '@automapper/classes';

import { Product } from 'database/models/product.entity';
import { Category } from 'database/models/category.entity';
import { BaseModel } from 'database/models/BaseModel';

@Entity({ name: 'products_categories' })
export class ProductsCategories extends BaseModel {
  @AutoMap()
  @Column()
  productId: string;

  @AutoMap()
  @Column()
  categoryId: string;

  @AutoMap(() => Product)
  @ManyToOne(() => Product, (product) => product.productsCategories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  product: Product;

  @AutoMap(() => Category)
  @ManyToOne(() => Category, (category) => category.productsCategories, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  category: Category;
}
