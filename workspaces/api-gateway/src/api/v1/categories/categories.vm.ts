import { AutoMap } from '@automapper/classes';

import { Category } from 'database/models/category.entity';

export class CategoryVM {
  @AutoMap()
  name: string;

  @AutoMap()
  slug: string;

  @AutoMap(() => [CategoryVM])
  children: CategoryVM[];
}

export class CategoryDescendantVM extends CategoryVM {}

export class CategoriesPagyMetadataVM {
  @AutoMap(() => [Category])
  data: Category[];

  @AutoMap()
  total: number;
}

export class CategoriesPagyVM {
  @AutoMap(() => [CategoryVM])
  data: CategoryVM[];

  @AutoMap()
  total: number;
}
