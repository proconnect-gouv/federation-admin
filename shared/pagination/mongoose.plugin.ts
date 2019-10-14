import { sortBy } from './pagination-sort.enum';
import { IQuery } from './interface/query-mongodb.interface';
import { IOptions } from './interface/options-query-mongodb.interface';

async function paginate(query, route, options: IOptions = {}) {
  const total = await this.countDocuments(query);
  const queryBuilder = this.find(query);

  if (options.sort === 'name-asc' || options.sort === 'name-desc') {
    queryBuilder.collation({ locale: 'fr' });
  }

  if (options.sort) {
    queryBuilder.sort(createSortQuery(options.sort));
  }

  queryBuilder.skip(((options.page || 1) - 1) * (options.limit || 10));
  queryBuilder.limit(options.limit || 10);

  const items = await queryBuilder.exec();

  const pageCount = Math.ceil(total / (options.limit || 10));
  const nextPage = options.page + 1 > pageCount ? pageCount : options.page + 1;
  const previousPage = options.page - 1 < 1 ? 1 : options.page - 1;

  return {
    items,
    itemCount: items.length,
    total,
    pageCount,
    next: options.page === pageCount ? '' : `${route}?page=${nextPage}`,
    previous: options.page === 1 ? '' : `${route}?page=${previousPage}`,
  };
}

function createSortQuery(cursor: string) {
  const query: IQuery = {};

  switch (true) {
    case cursor === sortBy.NameAsc:
      query.name = 'asc';
      break;
    case cursor === sortBy.NameDesc:
      query.name = 'desc';
      break;
    case cursor === sortBy.ActiveDesc:
      query.active = 1;
      break;
    case cursor === sortBy.ActiveAsc:
      query.active = -1;
      break;
    case cursor === sortBy.KeyDateAsc:
      query.createdAt = 'ascending';
      break;
    case cursor === sortBy.KeyDateDesc:
      query.createdAt = 'descending';
      break;
    case cursor === sortBy.SecretDateAsc:
      query.secretUpdatedAt = 'descending';
      break;
    case cursor === sortBy.SecretDateDesc:
      query.secretUpdatedAt = 'ascending';
      break;
    case cursor === sortBy.OrderAsc:
      query.order = 1;
      break;
    case cursor === sortBy.OrderDesc:
      query.order = -1;
      break;
  }

  return query;
}

export const paginatePlugin = schema => {
  schema.statics.paginate = paginate;
};
