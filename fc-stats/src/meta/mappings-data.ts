export const MAPPINGS = {
  action: {
    rnippcheck: 'Redressement RNNIPP',
    checkedtoken: 'Token vérifié',
    authentication: 'Connexion',
    eidas: 'Eidas',
    consent: 'Consent',
  },
  typeAction: {
    verification: 'Vérification',
    rectifiedwithusenameonly: 'Redressement: avec le nom',
    rectified: 'Redressement',
    notrectifiedwithoneecho: 'Redressement : un écho',
    divergence: 'Divergence',
    rejectedsyntaxerrors: 'Rejeté: erreur de synthaxe',
    notrectifiedwithmultipleecho: 'Pas de Redressement: plusieurs échos',
    notrectifiednoecho: "Pas de Redressement : pas d'echo",
    identityproviderchoice: "Choix du fournisseur d'identité",
    initial: 'Initiale',
    deactivateduserauthenticationattempt:
      'Tentative de connexion avec un compte désactivé',
    identityproviderauthentication: "Connexion au fournisseur d'identité",
    newauthenticationquery: 'Nouvelle requête de connexion',
    confirmAuthentication: 'Connexion confirmée',
    conflict: 'Confilt',
    userInfosWithoutEmailError: "Information user ok, pas d'erreur sur l'email",
    nonExistantProviderAuthenticationAttempt:
      'Tentative de connexion à un fournisseur inexistant',
    deactivatedProviderAuthenticationAttempt:
      'Tentative de connexion avec un fournisseur désactivé',
    deceasedperson: 'Personne décédée',
    xmlokbutmissingdata: 'XML ok mais données manquantes',
    cantcallrnipp: 'RNIPP injoignable',
  },
  metrics: {
    account: 'Comptes',
    activeAccount: 'Comptes actifs',
    activeFsCount: 'FS actifs',
    disabled: 'Comptes désactivés',
    registration: 'Comptes créés',
  },
  granularity: {
    day: 'Jour',
    week: 'Semaine',
    month: 'Mois',
    year: 'Année',
    all: 'Tout',
  },
  visualize: {
    list: 'Liste',
    bar: 'Histograme',
    line: 'Courbe',
    pie: 'Circulaire',
  },
  columns: {
    events: {
      fi: 'FI',
      'fs_label.keyword': 'FS',
      action: 'Action',
      typeAction: "Type d'action",
    },
    metrics: {
      key: 'Clé',
      range: 'Granularité',
    },
  },
};
