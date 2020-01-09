import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

import * as fileType from 'file-type';

const VALIDATOR_NAME = 'IsDataURI';
// Standard max size of HTTP request
const HTTP_MAX_SIZE = 20 * 1024 * 1024;
// minimum extension name size (jpg,png...);
const MIN_EXTENSION_LENGTH = 3;

/**
 * Permet de fabriquer la structure complète du Regex pour vérifier les dataURIs
 * Par défaut: ^(data:image\/(?:png|jpe?g|gif|svg\+xml))(;base64,)(?:[A-Za-z0-9\+/]{4})*(?:[A-Za-z0-9\+/]{2}==|[A-Za-z0-9\+/]{3}=|[A-Za-z0-9\+/]{4})
 * @param {string} mime regex au format string pour décrire les formats d'images autorisées
 */
const buildDataURIRegex = (mime: string): RegExp => {
  // tslint:disable-next-line: prettier
  const base64 = '(?:[A-Za-z0-9\\\+/]{4})*(?:[A-Za-z0-9\\\+/]{2}==|[A-Za-z0-9\\\+/]{3}=|[A-Za-z0-9\\\+/]{4})';
  const regex = `^(data:image\/(?:${mime}))(;base64,)${base64}`;
  return new RegExp(regex);
};

/**
 * Calcul la taille des data base64 en fonction du nombre de caractère
 * @param {number} length la longeur de texte base64 à mesurer
 * @param {number=2} blockSize la taille des bloc de données - UTF-8 = 2
 */
const sizeOf = (length: number, blockSize: number = 2): number => {
  if (blockSize === 0) {
    return NaN;
  }
  // permet de calculer la taille d'une image depuis un base64
  // @see {link:https://en.wikipedia.org/wiki/Base64}
  // tslint:disable-next-line: no-bitwise
  return Math.ceil(((length * 3 + 1) >> 2) / blockSize) * blockSize;
};

@ValidatorConstraint()
export class IValidateDataURI implements ValidatorConstraintInterface {
  validate(value: any, { constraints }) {
    const [maxSize, regex] = constraints;

    const input = (value as string) || '';

    /**
     * Teste si les données de la requête ne dépasse pas la taille max d'une requête web
     * selon NodeJS
     *
     */
    const inputSize = sizeOf(input.length);
    if (input.length === 0 || inputSize > HTTP_MAX_SIZE) {
      return false;
    }

    // on vérifie que l'on a bien un dataURI
    const dataRegex = buildDataURIRegex(regex);
    const hasDataURI = dataRegex.test(input);
    if (!hasDataURI) {
      return false;
    }

    // on récupère uniquement la partie base64
    const infos = input.split(',');
    if (infos.length !== 2) {
      return false;
    }

    // on vérifie que la taille du base64 est inférieur au max autorisé
    const [mime, image] = infos;
    const { length } = image;
    if (length === 0) {
      return false;
    }

    const isGoodSize = sizeOf(length) <= maxSize;
    if (!isGoodSize) {
      return false;
    }

    // on vérifie le "vrai" type de l'élément
    const { ext } = fileType(Buffer.from(image, 'base64')) || { ext: null };
    if (!ext || typeof ext !== 'string') {
      return false;
    }

    return ext.length >= MIN_EXTENSION_LENGTH && mime.includes(ext);
  }

  defaultMessage(args: ValidationArguments) {
    return "Votre image n'est pas à la bonne taille ou bon format";
  }
}

/**
 * Decorator permettant de vérifier que les images en dataURL sont correctes
 * @param {number=1048576} imageSize taille de l'image en bits (default: 1Mo)
 * @param {string="png|jpe?g|gif|svg+xml"} mimeRegex regex décrivant les formats d'images autorisées
 * @param {ValidationOptions} validationOptions options fournies par le decorator au validator
 */
export function IsDataURI(
  imageSize: number = 1048576, // 1Mo
  // tslint:disable-next-line: prettier
  mimeRegex: string = 'png|jpe?g|gif|svg\\\+xml',
  validationOptions?: ValidationOptions,
) {
  return ({ constructor }: any, imageProp: string) => {
    registerDecorator({
      name: VALIDATOR_NAME,
      target: constructor,
      propertyName: imageProp,
      constraints: [imageSize, mimeRegex],
      options: validationOptions,
      validator: IValidateDataURI,
    });
  };
}
