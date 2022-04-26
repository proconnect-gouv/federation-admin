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
