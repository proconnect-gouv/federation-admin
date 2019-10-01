module.exports.aggregations = {
  date: {
    buckets: [
      {
        key_as_string: '2018-01-01T00:00:00.000Z',
        key: 1514764800000,
        doc_count: 7,
        fs: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'assurance_retraite_intégration',
              doc_count: 7,
              fi: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [
                  {
                    key: 'ameli',
                    doc_count: 7,
                    action: {
                      doc_count_error_upper_bound: 0,
                      sum_other_doc_count: 0,
                      buckets: [
                        {
                          key: 'authentication',
                          doc_count: 3,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'deactivateduserauthenticationattempt',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'identityproviderchoice',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'initial',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'rnippcheck',
                          doc_count: 4,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'notrectifiednoecho',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'rectified',
                                doc_count: 2,
                                count: {
                                  value: 2,
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
            },
          ],
        },
      },
      {
        key_as_string: '2018-02-01T00:00:00.000Z',
        key: 1517443200000,
        doc_count: 17,
        fs: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'assurance_retraite_intégration',
              doc_count: 17,
              fi: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [
                  {
                    key: 'ameli',
                    doc_count: 17,
                    action: {
                      doc_count_error_upper_bound: 0,
                      sum_other_doc_count: 0,
                      buckets: [
                        {
                          key: 'authentication',
                          doc_count: 6,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'deactivateduserauthenticationattempt',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'identityproviderauthentication',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'identityproviderchoice',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'initial',
                                doc_count: 1,
                                count: {
                                  value: 2,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'checkedtoken',
                          doc_count: 3,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'verification',
                                doc_count: 3,
                                count: {
                                  value: 3,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'rnippcheck',
                          doc_count: 8,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'divergence',
                                doc_count: 2,
                                count: {
                                  value: 3,
                                },
                              },
                              {
                                key: 'notrectifiedwithoneecho',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'rejectedsyntaxerrors',
                                doc_count: 3,
                                count: {
                                  value: 3,
                                },
                              },
                              {
                                key: 'rnippcheck',
                                doc_count: 2,
                                count: {
                                  value: 2,
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
            },
          ],
        },
      },
      {
        key_as_string: '2018-03-01T00:00:00.000Z',
        key: 1519862400000,
        doc_count: 5,
        fs: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'assurance_retraite_intégration',
              doc_count: 5,
              fi: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [
                  {
                    key: 'ameli',
                    doc_count: 5,
                    action: {
                      doc_count_error_upper_bound: 0,
                      sum_other_doc_count: 0,
                      buckets: [
                        {
                          key: 'authentication',
                          doc_count: 1,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'identityproviderchoice',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'checkedtoken',
                          doc_count: 1,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'verification',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'rnippcheck',
                          doc_count: 3,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'divergence',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'rejectedsyntaxerrors',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'rnippcheck',
                                doc_count: 1,
                                count: {
                                  value: 1,
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
            },
          ],
        },
      },
      {
        key_as_string: '2018-04-01T00:00:00.000Z',
        key: 1522540800000,
        doc_count: 10,
        fs: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'assurance_retraite_intégration',
              doc_count: 10,
              fi: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [
                  {
                    key: 'ameli',
                    doc_count: 10,
                    action: {
                      doc_count_error_upper_bound: 0,
                      sum_other_doc_count: 0,
                      buckets: [
                        {
                          key: 'authentication',
                          doc_count: 1,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'identityproviderauthentication',
                                doc_count: 1,
                                count: {
                                  value: 2,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'rnippcheck',
                          doc_count: 9,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'divergence',
                                doc_count: 1,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'notrectifiednoecho',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'notrectifiedwithmultipleecho',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'notrectifiedwithoneecho',
                                doc_count: 2,
                                count: {
                                  value: 3,
                                },
                              },
                              {
                                key: 'rectifiedwithusenameonly',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'rnippcheck',
                                doc_count: 1,
                                count: {
                                  value: 1,
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
            },
          ],
        },
      },
      {
        key_as_string: '2018-05-01T00:00:00.000Z',
        key: 1525132800000,
        doc_count: 8,
        fs: {
          doc_count_error_upper_bound: 0,
          sum_other_doc_count: 0,
          buckets: [
            {
              key: 'assurance_retraite_intégration',
              doc_count: 8,
              fi: {
                doc_count_error_upper_bound: 0,
                sum_other_doc_count: 0,
                buckets: [
                  {
                    key: 'ameli',
                    doc_count: 8,
                    action: {
                      doc_count_error_upper_bound: 0,
                      sum_other_doc_count: 0,
                      buckets: [
                        {
                          key: 'authentication',
                          doc_count: 5,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'deactivateduserauthenticationattempt',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                              {
                                key: 'identityproviderauthentication',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'newauthenticationquery',
                                doc_count: 2,
                                count: {
                                  value: 2,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'checkedtoken',
                          doc_count: 1,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'verification',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                            ],
                          },
                        },
                        {
                          key: 'rnippcheck',
                          doc_count: 2,
                          typeAction: {
                            doc_count_error_upper_bound: 0,
                            sum_other_doc_count: 0,
                            buckets: [
                              {
                                key: 'notrectifiednoecho',
                                doc_count: 1,
                                count: {
                                  value: 1,
                                },
                              },
                              {
                                key: 'rectifiedwithusenameonly',
                                doc_count: 1,
                                count: {
                                  value: 1,
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
            },
          ],
        },
      },
    ],
  },
};
