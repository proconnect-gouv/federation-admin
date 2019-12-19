import { Test } from '@nestjs/testing';
import { RnippSerializer } from './rnipp-serializer.service';
import { rawXml } from '../fixtures/xmlMockedString';
describe('RnippSerializer (e2e)', () => {
  let rnippSerializer: RnippSerializer;

  const mockedXmlService = {
    parseString: jest.fn(),
    processors: {
      stripPrefix: jest.fn(),
    },
  };

  const personBornInFrance = {
    gender: 'male',
    familyName: 'rrr',
    givenName: 'trete',
    preferredUsername: '',
    birthdate: '2019-07-02',
    birthCountry: '99100',
    birthPlace: '55555',
    supportId: '1234567891234567',
  };

  const personNotBornInFrance = {
    gender: 'male',
    familyName: 'rrr',
    givenName: 'trete',
    preferredUsername: '',
    birthdate: '2019-07-02',
    birthCountry: '99999',
    birthPlace: '99350',
    supportId: '1234567891234567',
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RnippSerializer,
        { provide: 'Xml2js', useValue: mockedXmlService },
      ],
    }).compile();

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
        personBornInFrance,
      );
      expect(result).toMatchObject({
        identity: {
          gender: 'male',
          familyName: 'rrr',
          givenName: 'trete',
          birthdate: '2019-07-02',
          birthCountry: '99100',
          birthPlace: '55555',
          supportId: '1234567891234567',
        },
        rnippCode: '3',
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
          personNotBornInFrance,
        );
        expect(result).toMatchObject({
          identity: {
            gender: 'male',
            familyName: 'rrr',
            givenName: 'trete',
            birthdate: '2019-07-02',
            birthCountry: '99350',
            birthPlace: '00000',
            supportId: '1234567891234567',
          },
          rnippCode: '2',
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
        personBornInFrance,
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
        await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
          personBornInFrance,
        );
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
        await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
          personBornInFrance,
        );
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
        await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
          personBornInFrance,
        );
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
        await rnippSerializer.serializeXmlFromRnipp(
          rawXml.xmlString,
          personBornInFrance,
        );
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });
  });
});
