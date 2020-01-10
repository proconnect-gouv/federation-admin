// REQUEST

export const HOSTNAME = 'HOSTNAME';
export const PROTOCOL = 'PROTOCOL';
export const BASEURL = 'BASE_URL';
export const USER_ID = 'USER_ID';
export const CLIENT_SIRET = 'CLIENT_SIRET';

// XML SELECTORS

export const IDENTIFICATION =
  'IdentificationsIndividusCitoyens.IdentificationIndividuCitoyen[0].SituationActuelle[0].Individu[0]';
export const GENDER = 'Sexe[0]';
export const FAMILY_NAME = 'Noms[0].NomFamille[0]';
export const GIVEN_NAME = 'Prenoms[0].Prenom';
export const PREFERED_NAME = '';
export const BIRTH_DATE = 'Naissance[0].DateNaissance[0]';
export const BIRTH_PLACE = 'Naissance[0].LieuNaissance[0].Localite[0].$.code';
export const BIRTH_COUNTRY = 'Naissance[0].LieuNaissance[0].Pays[0].$.code';
export const DEAD = 'Deces[0]';
export const RNIPP_CODE =
  'IdentificationsIndividusCitoyens.TypeReponseIdentification[0]';

// DATA

export const RNIPP_IDENTITY_NOT_RECTIFIED = '2';
export const RNIPP_IDENTITY_RECTIFIED = '3';
export const FRANCE_COG = '99100';
