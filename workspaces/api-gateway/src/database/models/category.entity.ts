import {
  Column,
  Entity,
  OneToMany,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';
import { AutoMap } from '@automapper/classes';

import { Product } from 'database/models/product.entity';
import { ProductsCategories } from 'database/models/productsCategories.entity';
import { BaseModel } from 'database/models/BaseModel';

@Entity({ name: 'categories' })
@Tree('closure-table')
export class Category extends BaseModel {
  @AutoMap()
  @Column()
  name: string;

  @AutoMap()
  @Column()
  parentId?: string;

  @AutoMap()
  @Column({ unique: true })
  slug: string;

  @AutoMap(() => [Category])
  @TreeChildren()
  children?: Category[];

  @AutoMap(() => Category)
  @TreeParent()
  parent?: Category;

  @AutoMap()
  @Column()
  level: number;

  @OneToMany(() => Product, (product) => product.category)
  products?: Product[];

  @OneToMany(
    () => ProductsCategories,
    (productsCategories) => productsCategories.category,
  )
  productsCategories?: ProductsCategories[];
}
