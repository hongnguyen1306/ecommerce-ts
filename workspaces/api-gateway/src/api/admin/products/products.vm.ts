import { AutoMap } from '@automapper/classes';

import { Product } from 'database/models/product.entity';

export class ProductVM {
  @AutoMap()
  id: string;

  @AutoMap()
  name: string;

  @AutoMap()
  categoryId: string;

  @AutoMap()
  slug: string;
}

export class ProductsCategoriesVM {
  @AutoMap()
  productId: string;

  @AutoMap()
  categoryId: string;

  @AutoMap()
  product: ProductVM;
}

export class ProductsPagyMetadataVM {
  @AutoMap(() => [Product])
  data: Product[];

  @AutoMap()
  total: number;
}

export class ProductsPagyVM {
  @AutoMap(() => [ProductVM])
  data: ProductVM[];

  @AutoMap()
  total: number;
}
