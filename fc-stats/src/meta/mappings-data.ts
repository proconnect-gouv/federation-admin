export const MAPPINGS = {
  action: {
    rnippCheck: 'Appel RNIPP',
    checkedToken: 'Vérification du token',
    authentication: 'Connexion',
    eidas: 'Niveau eidas',
    consent: 'Consentement - Information',
    feedback: 'Retour usagers (obsolète)',
    api_stats: 'API Stats (obsolète)',
    error: 'Erreurs',
  },
  typeAction: {
    verification: 'Demande de vérification',
    rectifiedWithUseNameOnly:
      "Demande identifiée sur le nom d’usage avec ou sans divergence d'état civil",
    rectified: "Demande identifiée sans divergence d'état civil",
    notRectifiedWithOneEcho:
      'Demande non identifiée avec existence d’un voisin',
    divergence: "Demande identifiée avec divergence d'état civil",
    rejectedSyntaxErrors:
      "Demande rejetée au contrôle, en raison d'erreurs de syntaxe sur les éléments d'état civil fournis.",
    notRectifiedWithMultipleEcho:
      'Demande non identifiée avec existence de plusieurs voisins',
    notRectifiedNoEcho: 'Demande non identifiée sans voisin',
    cantCallRnipp: 'RNIPP injoignable',
    deceasedPerson: 'Personne décédée',
    returnIsNotXml: 'Erreur : retour RNIPP pas au format XML',
    xmlOkButMissingData: 'Erreur : XML valide mais données manquantes',
    rnippCheck: 'Appel RNIPP',
    newAuthenticationQuery: 'Demande de connexion via FC',
    identityProviderChoice: "Choix du fournisseur d'identité",
    nonExistantProviderAuthenticationAttempt:
      "Tentative de connexion à un fournisseur d'identité inexistant",
    deactivatedProviderAuthenticationAttempt:
      'Tentative de connexion avec un fournisseur de service désactivé',
    identityProviderAuthentication: 'Connexion réussie au FI',
    userInfosWithoutEmailError:
      "Champs email de l'usager absent au retour du FI",
    deactivatedUserAuthenticationAttempt:
      'Tentative de connexion avec un usager désactivé chez FC',
    initial: 'Connexion FI et redressement RNIPP ok',
    confirmAuthentication: 'Connexion au FS confirmée',
    conflict: 'Conflit de niveau eidas',
    demande: 'Demande de consentement pour transfert de données (obsolète)',
    inconnu: 'Erreur technique lors du consentement (obsolète)',
    information: "Affichage de la page d'information",
    demandeData: "Consentement(FD) sur des données d'un fournisseur de données",
    demandeIdentity: "Consentement(FS) sur des données d'identités",
    birthDateError:
      "La date de naissance de l'usager diffère de plus d'un jour entre le FI et le RNIPP",
    getUserInfoError:
      'FI inaccessible : impossible de récupérer les informations utilisateur',
    getTokenError:
      'Impossible de récupérer le token du FI après authentification chez celui-ci',
    invalid_redirect_uri: 'Url de redirection du FS invalide',
    invalid_post_logout_redirect_uri:
      'Url de redirection au logout du FS invalide',
    unauthorized_scope:
      'Scope(s) de données demandé(s) par le FS non autorisé(s)',
    total_accounts: 'Api status (obsolète)',
    satisfaction: 'Retours usagers (obsolète)',
    userExitAuthenticationWebPage: 'Feedback (obsolète)',
    get_access_token: "Récupération de l'access token",
    get_user_info: "Accès aux données de l'usager par le FS",
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
      action: 'Catégorie',
      typeAction: 'Evènement',
    },
    metrics: {
      key: 'Clé',
      range: 'Granularité',
    },
  },
};
