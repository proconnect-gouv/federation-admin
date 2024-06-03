export interface IOidcIdentity {
  readonly gender: string;
  readonly family_name: string;
  readonly preferred_username?: string;
  readonly given_name: string;
  readonly birthdate: string;
  readonly birthplace: string;
  readonly birthcountry: string;
}
