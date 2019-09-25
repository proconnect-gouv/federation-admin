import { BadRequestException } from '@nestjs/common';

export function toBoolean(value: string): boolean | undefined {
  switch (value) {
    case 'true':
    case 'on':
    case '1':
    case 'yes':
      return true;
    case 'false':
    case 'off':
    case '0':
    case 'no':
      return false;
    default:
      return undefined;
  }
}

export function linesToArray(value: string): string[] | undefined {
  let result: string[];
  try {
    result = value.split(/\r\n|\n|\r|[;]/);
  } catch (e) {
    return undefined;
  }
  return result;
}
