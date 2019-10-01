import Job from './Job';

class PurgeES extends Job {
  static usage() {
    return `
      Usage:
      > PurgeES
    `;
  }

  async getBulk(params) {
    const stats = this.container.get('stats');
    return stats.getIdsToDelete(params);
  }

  static createBulkDeleteQuery(ids) {
    const body = ids.map(id => ({
      delete: {
        _index: 'franceconnect',
        _type: 'log',
        _id: id,
      },
    }));

    return { body };
  }

  async sendBulkQuery(query) {
    return this.container.get('dataApi').bulk(query);
  }

  handleProgress(params, bulk) {
    const { length } = bulk.ids;
    const total = params.total || bulk.total;
    const { counter, wait } = params;

    const progress =
      Math.round(((total - (bulk.total - length)) / total) * 10000) / 100;

    this.container
      .get('logger')
      .info(
        `[${progress}%] Sent delete for ${length} docs. Remaining docs: ${bulk.total -
          length} / ${total}`
      );

    if (length < bulk.total) {
      setTimeout(
        () =>
          this.recursiveDelete({
            ...params,
            total,
            counter: counter + 1,
          }),
        wait
      );
    }
  }

  async recursiveDelete(params) {
    const bulk = await this.getBulk(params);

    const deleteQuery = PurgeES.createBulkDeleteQuery(bulk.ids);

    if (deleteQuery.body.length > 0) {
      await this.sendBulkQuery(deleteQuery);
    }

    this.handleProgress(params, bulk);
  }

  async run() {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const params = {
      from: 0,
      // Get big chunks:
      //  - we can't handle the whole dataset in one time
      //  - ES works better with big chunks than with multiple queries
      // This is an empirical setting.
      size: 500,
      // Give some time to ES to do its thing.
      //  - we don't want to overload it
      //  - we don't need a quick result
      // This is also an empirical setting.
      wait: 1000,
      // Store the initial total of documents to delete
      total: null,
      counter: 0,
    };

    this.recursiveDelete(params);
  }
}

PurgeES.description = 'Purges old elastic logs';

export default PurgeES;
