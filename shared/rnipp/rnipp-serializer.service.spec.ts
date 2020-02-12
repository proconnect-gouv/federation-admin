import { Test } from '@nestjs/testing';
import { RnippSerializer } from './rnipp-serializer.service';
import { rawXml } from '../fixtures/xmlMockedString';
import { LoggerService } from '@fc/shared/logger/logger.service';

describe('RnippSerializer (e2e)', () => {
  let rnippSerializer: RnippSerializer;

  const mockedXmlService = {
    parseString: jest.fn(),
    processors: {
      stripPrefix: jest.fn(),
    },
  };

  const loggerProvider = {
    info: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RnippSerializer,
        { provide: 'Xml2js', useValue: mockedXmlService },
        LoggerService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerProvider)
      .compile();

    rnippSerializer = module.get<RnippSerializer>(RnippSerializer);
    jest.resetAllMocks();
  });

  describe('serializeXmlFromRnipp', () => {
    it('should return a json with xml as template (person who is born in France)', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              IdentificationIndividuCitoyen: [
                {
                  SituationActuelle: [
                    {
                      Individu: [
                        {
                          Noms: [{ NomFamille: ['rrr'] }],
                          Prenoms: [{ Prenom: ['trete'] }],
                          Naissance: [
                            {
                              DateNaissance: ['2019-07-02'],
                              LieuNaissance: [
                                {
                                  Localite: [
                                    { _: '55555', $: { code: '55555' } },
                                  ],
                                },
                              ],
                              NumeroActeNaissance: ['55555'],
                            },
                          ],
                          Sexe: ['M'],
                        },
                      ],
                    },
                  ],
                },
              ],
              TypeReponseIdentification: ['3'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const result = await rnippSerializer.serializeXmlFromRnipp(
        rawXml.xmlString,
      );
      expect(result).toMatchObject({
        identity: {
          gender: 'male',
          familyName: 'rrr',
          givenName: 'trete',
          birthdate: '2019-07-02',
          birthCountry: '99100',
          birthPlace: '55555',
        },
        rnippCode: '3',
        dead: false,
      });
    });

    describe('serializeXmlFromRnipp', () => {
      it('should return a json with xml as template (person who in not born in France)', async () => {
        mockedXmlService.parseString.mockImplementation(
          (input, options, callback) =>
            callback(null, {
              IdentificationsIndividusCitoyens: {
                IdentificationIndividuCitoyen: [
                  {
                    SituationActuelle: [
                      {
                        Individu: [
                          {
                            Noms: [{ NomFamille: ['rrr'] }],
                            Prenoms: [{ Prenom: ['trete'] }],
                            Naissance: [
                              {
                                DateNaissance: ['2019-07-02'],
                                LieuNaissance: [
                                  {
                                    Pays: [
                                      { _: '99350', $: { code: '99350' } },
                                    ],
                                  },
                                ],
                                NumeroActeNaissance: ['55555'],
                              },
                            ],
                            Sexe: ['M'],
                          },
                        ],
                      },
                    ],
                  },
                ],
                TypeReponseIdentification: ['2'],
              },
            }),
        );

        mockedXmlService.processors.stripPrefix.mockImplementation(() => {
          return '';
        });

        const result = await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
        );
        expect(result).toMatchObject({
          identity: {
            gender: 'male',
            familyName: 'rrr',
            givenName: 'trete',
            birthdate: '2019-07-02',
            birthCountry: '99350',
            birthPlace: '',
          },
          rnippCode: '2',
          dead: false,
        });
      });
      it('should return a json with xml as template (person who died)', async () => {
        mockedXmlService.parseString.mockImplementation(
          (input, options, callback) =>
            callback(null, {
              IdentificationsIndividusCitoyens: {
                IdentificationIndividuCitoyen: [
                  {
                    SituationActuelle: [
                      {
                        Individu: [
                          {
                            Noms: [
                              {
                                NomFamille: ['Jedusor'],
                              },
                            ],
                            Prenoms: [
                              {
                                Prenom: ['Thomas'],
                              },
                            ],
                            Naissance: [
                              {
                                DateNaissance: ['1925-12-23'],
                                LieuNaissance: [
                                  {
                                    Localite: [
                                      {
                                        _: 'Déville-lès-Rouen',
                                        $: {
                                          code: '76216',
                                        },
                                      },
                                    ],
                                  },
                                ],
                                NumeroActeNaissance: ['333'],
                              },
                            ],
                            Sexe: ['M'],
                            Deces: [
                              {
                                DateDeces: ['1993-05-01'],
                                LieuDeces: [
                                  {
                                    Localite: [
                                      {
                                        _: 'Paris 5e  Arrondissement',
                                        $: {
                                          code: '75105',
                                        },
                                      },
                                    ],
                                  },
                                ],
                                NumeroActeDeces: ['299'],
                              },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
                TypeReponseIdentification: ['2'],
              },
            }),
        );

        mockedXmlService.processors.stripPrefix.mockImplementation(() => '');

        const result = await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
        );
        expect(result).toMatchObject({
          identity: {
            gender: 'male',
            familyName: 'Jedusor',
            givenName: 'Thomas',
            birthdate: '1925-12-23',
            birthCountry: '99100',
            birthPlace: '76216',
          },
          rnippCode: '2',
          dead: true,
        });
      });
    });

    it('should return rnipp code with no user info if code is not 2 or 3', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              TypeReponseIdentification: ['8'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const result = await rnippSerializer.serializeXmlFromRnipp(
        rawXml.xmlString,
      );
      expect(result).toMatchObject({
        rnippCode: '8',
      });
    });

    it('should return an array ( familyName ) of error when json from parse is malformed', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              IdentificationIndividuCitoyen: [
                {
                  SituationActuelle: [
                    {
                      Individu: [
                        {
                          Noms: [{ NomFamille: [2] }],
                          Prenoms: [{ Prenom: ['trete'] }],
                          Naissance: [
                            {
                              DateNaissance: ['2019-07-02'],
                              LieuNaissance: [
                                {
                                  Localite: [
                                    { _: '55555', $: { code: '55555' } },
                                  ],
                                },
                              ],
                              NumeroActeNaissance: ['55555'],
                            },
                          ],
                          Sexe: ['male'],
                        },
                      ],
                    },
                  ],
                },
              ],
              TypeReponseIdentification: ['2'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: ['familyName must be a string'],
      };

      try {
        await rnippSerializer.serializeXmlFromRnipp(rawXml.xmlString);
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });

    it('should return an array ( givenName ) of error when json from parse is malformed', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              IdentificationIndividuCitoyen: [
                {
                  SituationActuelle: [
                    {
                      Individu: [
                        {
                          Noms: [{ NomFamille: ['familyName'] }],
                          Prenoms: [{ Prenom: [5] }],
                          Naissance: [
                            {
                              DateNaissance: ['2019-07-02'],
                              LieuNaissance: [
                                {
                                  Localite: [
                                    { _: '55555', $: { code: '55555' } },
                                  ],
                                },
                              ],
                              NumeroActeNaissance: ['55555'],
                            },
                          ],
                          Sexe: ['male'],
                        },
                      ],
                    },
                  ],
                },
              ],
              TypeReponseIdentification: ['2'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: [
          'givenName must match /^[a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+([\\ \\-][a-zA-ZÀÂÉÊÈËÎÏÔÙÇàâéêèëîïôùç]+)*$/ regular expression',
        ],
      };

      try {
        await rnippSerializer.serializeXmlFromRnipp(rawXml.xmlString);
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });

    it('should return an array ( birthdate ) of error when json from parse is malformed', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              IdentificationIndividuCitoyen: [
                {
                  SituationActuelle: [
                    {
                      Individu: [
                        {
                          Noms: [{ NomFamille: ['familyName'] }],
                          Prenoms: [{ Prenom: ['firstName'] }],
                          Naissance: [
                            {
                              DateNaissance: ['fdsfds'],
                              LieuNaissance: [
                                {
                                  Localite: [
                                    { _: '55555', $: { code: '55555' } },
                                  ],
                                },
                              ],
                              NumeroActeNaissance: ['55555'],
                            },
                          ],
                          Sexe: ['male'],
                        },
                      ],
                    },
                  ],
                },
              ],
              TypeReponseIdentification: ['2'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: ['birthdate must be a valid ISO 8601 date string'],
      };

      try {
        await rnippSerializer.serializeXmlFromRnipp(rawXml.xmlString);
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });

    it('should return an array ( birthdate, familyName ) of several error when json from parse is malformed', async () => {
      mockedXmlService.parseString.mockImplementation(
        (input, options, callback) =>
          callback(null, {
            IdentificationsIndividusCitoyens: {
              IdentificationIndividuCitoyen: [
                {
                  SituationActuelle: [
                    {
                      Individu: [
                        {
                          Noms: [{ NomFamille: [2] }],
                          Prenoms: [{ Prenom: ['firstName'] }],
                          Naissance: [
                            {
                              DateNaissance: ['fgdgd'],
                              LieuNaissance: [
                                {
                                  Localite: [
                                    { _: '55555', $: { code: '55555' } },
                                  ],
                                },
                              ],
                              NumeroActeNaissance: ['55555'],
                            },
                          ],
                          Sexe: ['female'],
                        },
                      ],
                    },
                  ],
                },
              ],
              TypeReponseIdentification: ['2'],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: [
          'familyName must be a string',
          'birthdate must be a valid ISO 8601 date string',
        ],
      };

      try {
        await rnippSerializer.serializeXmlFromRnipp(rawXml.xmlString);
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });
  });
});
