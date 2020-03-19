import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  registerDecorator,
  ValidationOptions,
} from 'class-validator';

import * as fileType from 'file-type';

import { JSDOM } from 'jsdom';
import * as sharp from 'sharp';

const VALIDATOR_NAME = 'IsDataURI';
// Standard max size of HTTP request
const HTTP_MAX_SIZE = 20 * 1024 * 1024;
// minimum extension name size (jpg,png...);
const MIN_EXTENSION_LENGTH = 3;

// number of character per data in base64
const BASE64_WORD = 4;

const SVG_MIME = 'image/svg+xml';

// maxinum number of pixels allowed in width or height
const MAX_PIXEL_SIZE = 1000;

const DATA_URI_FORMAT_REGEX = new RegExp(/^data:(image\/[a-zA-Z+]+);base64$/);

/**
 * Permet de fabriquer la structure complète du Regex pour vérifier les dataURIs. On utilise ici
 * une version basique pour vérifier le base64 car la taille de l'image sature le moteur du Regex.
 * Par défaut: ^(data:image\/(?:png|jpe?g|gif|svg\+xml))(;base64,)([a-zA-Z0-9/+]*={0,3})
 * @param {string} mime regex au format string pour décrire les formats d'images autorisées
 */
const buildDataURIRegex = (mime: string): RegExp =>
  new RegExp(`^(data:image\/(?:${mime}))(;base64,[a-zA-Z0-9/+]*={0,2})`);

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

/**
 * check for hacking SVG script injection
 * @see {link:https://fr.slideshare.net/x00mario/the-image-that-called-me| SVG attack}
 * @param {Buffer} blob l'image à tester en buffer
 */
const isDirtySVG = (blob: Buffer): boolean => {
  const content = blob.toString();
  if (content.includes('script')) {
    return true;
  }
  const DOM = new JSDOM(content);
  const doc = DOM.window.document;
  const foreign = doc.querySelector('foreignObject');
  return !!foreign;
};

/**
 * check for hacking image bomb
 * @see {link:https://en.wikipedia.org/wiki/Zip_bomb| zip bomb}
 * @param {Buffer} blob l'image à tester en buffer
 */
const isImageBomb = async (blob: Buffer): Promise<boolean> => {
  const { width, height } = await sharp(blob).metadata();
  return width > MAX_PIXEL_SIZE || height > MAX_PIXEL_SIZE;
};

/**
 * check for hacking script injection
 * @see {link:https://www.opswat.com/blog/hacking-pictures-stegosploit-and-how-stop-it| Image Injection}
 * @param {Buffer} blob l'image à tester en buffer
 */
const isInjectedImage = (blob: Buffer): boolean => {
  const content = blob.toString();
  return content.includes('script');
};

@ValidatorConstraint()
export class IValidateDataURI implements ValidatorConstraintInterface {
  async validate(value: any, { constraints }) {
    const [maxSize, regex] = constraints;

    const input = (value as string) || '';

    /**
     * Teste si les données de la requête ne dépassent pas la taille max d'une requête web
     * selon NodeJS
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
    const [format, image] = infos;

    const { length } = image;
    if (length === 0) {
      return false;
    }

    const isGoodSize = sizeOf(length) <= maxSize;
    if (!isGoodSize) {
      return false;
    }

    // les données base64 sont des multiples de 4 caractères
    if (length % BASE64_WORD) {
      return false;
    }

    const blob = Buffer.from(image, 'base64');

    // on vérifie le "vrai" type de l'élément
    const { ext, mime: mimeBlob } = fileType(blob) || { ext: null, mime: '' };
    if (!ext || typeof ext !== 'string') {
      return false;
    }

    // on vérifie l'extension de l'image
    const [, mime = ''] = format.match(DATA_URI_FORMAT_REGEX);
    const hasGoodExtension =
      ext.length >= MIN_EXTENSION_LENGTH &&
      (mime.includes(ext) || (mime === mimeBlob && mime.length));
    if (!hasGoodExtension) {
      return false;
    }

    if (mime === SVG_MIME) {
      if (isDirtySVG(blob)) {
        return false;
      }
    } else {
      if (await isImageBomb(blob)) {
        return false;
      }

      if (isInjectedImage(blob)) {
        return false;
      }
    }
    return true;
  }

  defaultMessage(args: ValidationArguments) {
    return 'Votre image ne respecte pas les paramètres demandées (taille, format...)';
  }
}

/**
 * Decorator permettant de vérifier que les images en dataURL sont correctes
 * @param {number=1048576} imageSize taille de l'image en bits (default: 1Mo)
 * @param {string="png|jpe?g|gif|svg+xml"} mimeRegex regex décrivant les formats d'images autorisées
 * @param {ValidationOptions} validationOptions options fournies par le decorator au validator
 */
export function IsDataURI(
  imgSize: number = 1048576, // 1Mo

  // desactivate prettier in order to keep the \\\ in regex
  // tslint:disable-next-line: prettier
  mimeRegex: string = 'png|jpe?g|gif|svg\\\+xml',
  validationOptions?: ValidationOptions,
) {
  return ({ constructor }: any, imageProp: string) => {
    registerDecorator({
      name: VALIDATOR_NAME,
      target: constructor,
      propertyName: imageProp,
      constraints: [imgSize, mimeRegex],
      options: validationOptions,
      validator: IValidateDataURI,
    });
  };
}
