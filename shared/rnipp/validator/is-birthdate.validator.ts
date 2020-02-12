import { ValidateIf, ValidationOptions } from 'class-validator';
import * as moment from 'moment';

export function validateBirthdate(obj, value: string) {
  if (typeof value !== 'string') {
    return false;
  }

  /*
   * Expected:
   * YYYY-00-00 => YYYY
   * YYYY-MM-00 => YYYY-MM
   * YYYY-MM-DD => YYYY-MM-DD
   */
  const trimedField = value.replace(
    /^([0-9]{4})-00-00$|^([0-9]{4}-[0-9]{2})-00$/,
    '$1$2',
  );

  const isFullDate = moment(trimedField, 'YYYY-MM-DD', true).isValid();
  const isPresumeDay = moment(trimedField, 'YYYY-MM', true).isValid();
  const isPresumeMonth = moment(trimedField, 'YYYY', true).isValid();

  // Explanation on "présumés nés": https://www.legislation.cnav.fr/Pages/texte.aspx?Nom=CR_CN_2006013_07022006#1
  const isPresume = value.includes('-00') && (isPresumeDay || isPresumeMonth);

  return isFullDate || isPresume;
}

export function IsBirthdate(validationOptions?: ValidationOptions) {
  return ValidateIf(validateBirthdate, validationOptions);
}
