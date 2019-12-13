import crypto from 'crypto';
import _ from 'lodash';
import Job from './Job';

class IndexElasticLogs extends Job {
  static usage() {
    return `
      Usage:
      > IndexElasticLogs --start=<YYYY-MM-DD> --stop=<YYYY-MM-DD>
    `;
  }

  /**
   Handling data source
  */
  async fetchData(start, stop) {
    const statsService = this.container.get('stats');
    return statsService.getByIntervalByFIFS(start, stop, 'day');
  }

  /**
   Format inital input
  */
  static moveNofsToFs(action) {
    if (action.nofs.doc_count > 0) {
      // This is an elastic native fieldName
      // eslint-disable-next-line camelcase
      const { doc_count, fi } = action.nofs;
      const key = 'N/A';
      action.fs.buckets.push({ key, doc_count, fi });
    }
    // Already working on a copy of input
    // eslint-disable-next-line no-param-reassign
    delete action.nofs;

    return action;
  }

  static fixMissingFields(input) {
    const tree = JSON.parse(JSON.stringify(input));

    tree.date.buckets = tree.date.buckets.map(date => {
      // Already working on a copy of input
      // eslint-disable-next-line no-param-reassign
      date.action.buckets = date.action.buckets.map(action => {
        // Already working on a copy of input
        // eslint-disable-next-line no-param-reassign
        action.typeAction.buckets = action.typeAction.buckets.map(
          IndexElasticLogs.moveNofsToFs
        );
        return action;
      });
      return date;
    });

    return tree;
  }

  /**
    Analyse and transform data to new structure
  */
  static hasChildren(property) {
    return (
      typeof property !== 'undefined' &&
      typeof property.buckets !== 'undefined' &&
      Array.isArray(property.buckets)
    );
  }

  static getChildren(node) {
    return Object.keys(node)
      .filter(key => IndexElasticLogs.hasChildren(node[key]))
      .map(key => ({
        key,
        children: node[key].buckets,
      }));
  }

  static computeResult(context, key, node) {
    return Object.assign({}, context, {
      [key]: node.key,
      count: node.doc_count,
    });
  }

  static getKey(entry) {
    const { date, action, typeAction, fs, fi } = entry;

    return crypto
      .createHash('sha256')
      .update([date, action, typeAction, fs, fi].join('.'))
      .digest('hex');
  }

  static storeNode(node, results, context) {
    if (node.children.length === 0 && context.count > 0) {
      // results is an accumulator
      // eslint-disable-next-line no-param-reassign
      results[IndexElasticLogs.getKey(context)] = context;
    }
  }

  static storeChildren(node, results, context) {
    node.children.forEach(child => {
      const entry = IndexElasticLogs.computeResult(context, node.key, child);
      const childNodes = IndexElasticLogs.getChildren(child);

      if (childNodes.length > 0) {
        // This is a recursive call
        // eslint-disable-next-line no-use-before-define
        IndexElasticLogs.walk(childNodes, results, entry);
      } else {
        // results is an accumulator
        // eslint-disable-next-line no-param-reassign
        results[IndexElasticLogs.getKey(entry)] = entry;
      }
    });
  }

  static walk(nodes, results = {}, context = {}) {
    nodes.forEach(node => {
      IndexElasticLogs.storeNode(node, results, context);
      IndexElasticLogs.storeChildren(node, results, context);
    });

    return results;
  }

  static getDocuments(tree) {
    return IndexElasticLogs.walk(IndexElasticLogs.getChildren(tree));
  }

  /**
    Refine produced data
  */
  static mapToArrayWithIds(map) {
    return Object.keys(map).map(id => Object.assign({ id }, map[id]));
  }

  static removeId(doc) {
    return _.omit(doc, 'id');
  }

  static addNAFI(doc) {
    return Object.assign({ fi: 'N/A' }, doc);
  }

  static formatDocument(doc) {
    return IndexElasticLogs.addNAFI(IndexElasticLogs.removeId(doc));
  }

  async createDocuments(docList, chunkLength, timePerRequest) {
    const statsService = this.container.get('stats');
    const chunks = _.chunk(docList, chunkLength);

    const queries = chunks.map(chunk =>
      statsService.createBulkQuery(
        chunk,
        'index',
        'stats',
        'entry',
        doc => doc.id,
        IndexElasticLogs.formatDocument
      )
    );

    const promises = queries.map((query, index) => {
      const timeout = timePerRequest * index;
      return new Promise(res => {
        setTimeout(() => {
          res(statsService.executeBulkQuery(query));
        }, timeout);
      });
    });

    return Promise.all(promises);
  }

  static getIndexationStats(indexationResults) {
    const reducer = (acc, result) => acc + result.items.length;

    return indexationResults.reduce(reducer, 0);
  }

  /**
     Compute control stats
    */
  static getEventCountFromAggregates(documents) {
    const reducer = (acc, doc) => acc + doc.count;

    return documents.reduce(reducer, 0);
  }

  async run(params) {
    this.log.info('Input control');
    const input = this.container.get('input');
    const schema = {
      start: { type: 'date', mandatory: true },
      stop: { type: 'date', mandatory: true },
    };

    const { start, stop } = input.get(schema, params);

    this.log.info('Fetch the value we want from ES');
    const data = await this.fetchData(start, stop);

    this.log.info('Workarround our old eslasticsearch limitations');
    const tree = IndexElasticLogs.fixMissingFields(data.aggregations);

    this.log.info('Creating documents from data');
    const documents = IndexElasticLogs.getDocuments(tree);

    this.log.info('Build an array of documents');
    const docList = IndexElasticLogs.mapToArrayWithIds(documents);
    const eventCount = IndexElasticLogs.getEventCountFromAggregates(docList);
    this.log.info(`   > Created ${docList.length} documents
     with ${eventCount} events
     from ${data.hits.total} original events`);

    this.log.info('Post new entries to stats index');

    const chunkSize = 1000;
    const timePerRequest = 100;
    const delay = Math.floor(
      ((docList.length / chunkSize) * timePerRequest) / 1000
    );
    this.log.info(
      `   > This will take at least ${delay} seconds, please hold on...`
    );
    const results = await this.createDocuments(
      docList,
      chunkSize,
      timePerRequest
    );

    this.log.info(
      `   > created ${IndexElasticLogs.getIndexationStats(results)} documents`
    );

    this.log.info('All done');
  }
}

IndexElasticLogs.description =
  'Aggregate events from logs and index them in stats elastic';

export default IndexElasticLogs;
