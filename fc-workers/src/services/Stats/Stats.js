import * as queries from './queries';

class Stats {
  constructor(dataApi) {
    this.dataApi = dataApi;
  }

  async getIdsToDelete(params) {
    const { from, size } = params;
    const query = queries.getIdsToDelete(params);
    const data = await this.dataApi.search(query);

    const { total, hits } = data.hits;
    // elasticsearch native variable name
    // eslint-disable-next-line no-underscore-dangle
    const ids = hits.map(document => document._id);

    return { from, size, total, ids };
  }
}

export default Stats;
