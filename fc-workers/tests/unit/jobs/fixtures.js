const bucketSample = JSON.stringify({
  key: 'initial',
  doc_count: 89,
  fs: {
    buckets: [
      {
        key: 'fsp1.dev.dev-franceconnect.fr',
        doc_count: 63,
        fi: {
          buckets: [
            {
              key: 'dgfip',
              doc_count: 56,
            },
            {
              key: 'ameli',
              doc_count: 7,
            },
          ],
        },
      },
      {
        key: 'fsp2.dev.dev-franceconnect.fr',
        doc_count: 16,
        fi: {
          buckets: [],
        },
      },
      {
        key: 'fsp3.dev.dev-franceconnect.fr',
        doc_count: 5,
        fi: {
          buckets: [
            {
              key: 'dgfip',
              doc_count: 5,
            },
          ],
        },
      },
      {
        key: 'fsp4.dev.dev-franceconnect.fr',
        doc_count: 5,
        fi: {
          buckets: [
            {
              key: 'dgfip',
              doc_count: 5,
            },
          ],
        },
      },
    ],
  },
});

const dataSample = JSON.stringify({
  date: {
    buckets: [
      {
        key_as_string: '2016-03-28T00:00:00.000Z',
        key: 1459123200000,
        doc_count: 500,
        action: {
          buckets: [
            {
              key: 'authentication',
              doc_count: 3,
              typeAction: {
                buckets: [JSON.parse(bucketSample)],
              },
            },
          ],
        },
      },
    ],
  },
});

const nofsDataSample = JSON.stringify({
  date: {
    buckets: [
      {
        key_as_string: '2018-01-01T00:00:00.000Z',
        key: 1514764800000,
        doc_count: 3,
        action: {
          buckets: [
            {
              key: 'authentication',
              doc_count: 3,
              typeAction: {
                buckets: [
                  {
                    key: 'identityproviderauthentication',
                    doc_count: 2,
                    nofs: {
                      doc_count: 2,
                      fi: {
                        buckets: [
                          {
                            key: 'dgfip',
                            doc_count: 2,
                          },
                        ],
                      },
                    },
                    fs: {
                      buckets: [],
                    },
                  },
                  {
                    key: 'identityproviderchoice',
                    doc_count: 1,
                    nofs: {
                      doc_count: 1,
                      fi: {
                        buckets: [
                          {
                            key: 'dgfip',
                            doc_count: 1,
                          },
                        ],
                      },
                    },
                    fs: {
                      buckets: [],
                    },
                  },
                ],
              },
            },
          ],
        },
      },
    ],
  },
});

module.exports = {
  bucketSample,
  dataSample,
  nofsDataSample,
};
