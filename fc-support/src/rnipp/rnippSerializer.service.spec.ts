import { Test } from '@nestjs/testing';
import { RnippSerializer } from './rnippSerializer.service';
import * as rawXml from '../../test/xmlMockedString.json';

describe('RnippSerializer (e2e)', () => {
  let rnippSerializer: RnippSerializer;

  const mockedXmlService = {
    parseString: jest.fn(),
    processors: {
      stripPrefix: jest.fn(),
    },
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
    it('should return a json with xml as template', async () => {
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
          birthCountry: '55555',
          birthPlace: '55555',
        },
        rnippCode: 'Pas de rnipp code',
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
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: ['givenName must be a string'],
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

    it('should return an array ( birthCountry & birthPlace ) of error when json from parse is malformed', async () => {
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
                              DateNaissance: ['2019-07-02'],
                              LieuNaissance: [
                                {
                                  Localite: [{ _: '55555', $: { code: '4' } }],
                                },
                              ],
                              NumeroActeNaissance: ['614'],
                            },
                          ],
                          Sexe: ['female'],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          }),
      );

      mockedXmlService.processors.stripPrefix.mockImplementation(() => {
        return '';
      });

      const expectedContraints = {
        errors: [
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
        ],
      };

      try {
        await rnippSerializer.serializeXmlFromRnipp(rawXml.xmlString);
      } catch (error) {
        expect(error).toEqual(expectedContraints);
      }
    });

    it('should return an array ( birthCountry, birthdate, familyName ) of several error when json from parse is malformed', async () => {
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
                              LieuNaissance: [{ Localite: [{ _: 2 }] }],
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
          'birthPlace must match /^[0-9]{5}$/ regular expression',
          'birthCountry must match /^[0-9]{5}$/ regular expression',
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
