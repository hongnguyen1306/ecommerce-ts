import slugify from 'slugify';

import type { IPagyParams } from 'interface';

export interface ISlugParams {
  name: string;
  columnName: string;
}

export const createSlug = async (
  { name, columnName }: ISlugParams,
  checkExisted,
): Promise<string> => {
  const slug = slugify(`${name.trim().slice(0, 50)}`, '-');
  const isExisted = await checkExisted(slug, columnName);
  if (isExisted) {
    return `${slug}-${new Date().getTime()}`;
  }

  return slug;
};

export const checkPageNumber = ({ page, perPage }: IPagyParams) => {
  return (page - 1) * perPage > 0 ? (page - 1) * perPage : 0;
};
