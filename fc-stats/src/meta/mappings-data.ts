export const MAPPINGS = {
  action: {
    rnippCheck: 'Redressement RNIPP',
    checkedToken: 'Token vérifié',
    authentication: 'Connexion',
    eidas: 'Eidas',
    consent: 'Consent',
  },
  typeAction: {
    verification: 'Vérification',
    rectifiedWithUsenameOnly: 'Redressement: avec le nom',
    rectified: 'Redressement',
    notRectifiedWithOneEcho: 'Redressement : un écho',
    divergence: 'Divergence',
    rejectedSyntaxErrors: 'Rejeté: erreur de syntaxe',
    notRectifiedWithMultipleEcho: 'Pas de Redressement: plusieurs échos',
    notRectifiedNoEcho: "Pas de Redressement : pas d'écho",
    identityProviderChoice: "Choix du fournisseur d'identité",
    initial: 'Initiale',
    deactivatedUserAuthenticationAttempt:
      'Tentative de connexion avec un compte désactivé',
    identityProviderAuthentication: "Connexion au fournisseur d'identité",
    newAuthenticationQuery: 'Nouvelle requête de connexion',
    confirmAuthentication: 'Connexion confirmée',
    conflict: 'Conflit',
    userInfosWithoutEmailError:
      "Information utilisateur ok, pas d'erreur sur l'email",
    nonExistantProviderAuthenticationAttempt:
      'Tentative de connexion à un fournisseur inexistant',
    deactivatedProviderAuthenticationAttempt:
      'Tentative de connexion avec un fournisseur désactivé',
    deceasedPerson: 'Personne décédée',
    xmlOkButMissingData: 'XML ok mais données manquantes',
    cantCallRnipp: 'RNIPP injoignable',
  },
  metrics: {
    account: 'Comptes',
    activeAccount: 'Comptes actifs',
    activeFsCount: 'FS actifs',
    desactivated: 'Comptes désactivés',
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
      fs: 'FS',
      action: 'Action',
      typeAction: "Type d'action",
    },
    metrics: {
      key: 'Clé',
      range: 'Granularité',
    },
  },
};
