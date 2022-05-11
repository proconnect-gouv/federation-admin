import { IOidcIdentity } from '../citizen/interfaces/oidc-identity.interface';
export interface IFormattedIdpList {
  uid: string;
  name: string;
  image: string;
  title: string;
  active: boolean;
  isChecked: boolean;
}

export interface IFormattedIdpSettings {
  allowFutureIdp: boolean;
  idpList: IFormattedIdpList[];
}

export interface IPayload {
  identity: IOidcIdentity;
  idpSettings: IPayloadIdpSettings;
}

export interface IPayloadIdpSettings {
  allowFutureIdp: boolean;
  idpList: string[];
}

export interface IPayloadData {
  identity: IOidcIdentity;
  preferences: IFormattedIdpSettings;
  uid: string;
  isChecked: boolean;
}
