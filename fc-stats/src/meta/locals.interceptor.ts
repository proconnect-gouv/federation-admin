import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from 'nestjs-config';
import * as moment from 'moment';
import * as queryString from 'query-string';

@Injectable()
export class LocalsInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();

    const appConfig = this.configService.get('app');

    res.locals.helpers = {};

    res.locals.APP_ROOT = appConfig.app_root;

    res.locals.APP_ENVIRONMENT = appConfig.environment;
    res.locals.COMMIT_URL_PREFIX = appConfig.commitUrlPrefix;

    res.locals.GIT_CURRENT_BRANCH = appConfig.currentBranch;
    res.locals.GIT_LATEST_COMMIT_SHORT_HASH = appConfig.latestCommitShortHash;
    res.locals.GIT_LATEST_COMMIT_LONG_HASH = appConfig.latestCommitLongHash;

    res.locals.CURRENT_USER = req.user;

    res.locals.REQ_PARAMS = req.params;
    res.locals.REQ_QUERY = req.query;
    res.locals.moment = moment;
    res.locals.queryString = queryString;

    res.locals.helpers.MAPPINGS = {
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
        notrectifiedwithmultipleecho: 'Pas de redressement: plusieurs échos',
        notrectifiednoecho: "Pas de redressement : pas d'echo",
        identityproviderchoice: "Choix du fournisseur d'identité",
        initial: 'Initiale',
        deactivateduserauthenticationattempt:
          'Tentative de connexion avec un compte désactivé',
        identityproviderauthentication: "Connexion au fournisseur d'identité",
        newauthenticationquery: 'Nouvelle requête de connexion',
        confirmAuthentication: 'Connexion confirmée',
        conflict: 'Conflit',
        userInfosWithoutEmailError: 'Information usager sans email',
        nonExistantProviderAuthenticationAttempt:
          "Tentative de connexion à un fournisseur d'identité inexistant",
        deactivatedProviderAuthenticationAttempt:
          "Tentative de connexion avec un fournisseur d'identité désactivé",
        deceasedperson: 'Personne décédée',
        xmlokbutmissingdata: 'XML ok mais données manquantes',
        cantcallrnipp: 'RNIPP injoignable',
      },
    };

    res.locals.helpers.getMapped = function getMapped(key) {
      if (res.locals.helpers.MAPPINGS.action[key] !== undefined) {
        return res.locals.helpers.MAPPINGS.action[key];
      } else if (res.locals.helpers.MAPPINGS.typeAction[key] !== undefined) {
        return res.locals.helpers.MAPPINGS.typeAction[key];
      }
      return key;
    };

    return next.handle();
  }
}
