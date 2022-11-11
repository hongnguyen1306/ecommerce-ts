import type { Category } from 'database/models/category.entity';

export const getlistCategoryIds = (category: Category): string[] => {
  return [category].reduce((acc, value) => {
    acc.push(value.id);
    if (value.parent) {
      acc = acc.concat(getlistCategoryIds(value.parent));
    }
    return acc;
  }, []);
};
