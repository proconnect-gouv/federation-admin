import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { getPasswordComplianceErrors } from '../password/password.service';

export function IsCompliant(validationsOptions?: ValidationOptions) {
  return (object: object, propertyName: string) => {
    registerDecorator({
      name: 'isCompliant',
      target: object.constructor,
      propertyName,
      options: {
        message: (args: ValidationArguments) => {
          const errors = getPasswordComplianceErrors(args.value);
          return errors.join(' ');
        },
        ...validationsOptions,
      },
      validator: {
        validate(value: any, args: ValidationArguments) {
          const errors = getPasswordComplianceErrors(args.value);
          return errors.length === 0;
        },
      },
    });
  };
}
