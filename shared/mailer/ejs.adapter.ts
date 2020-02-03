import * as path from 'path';
import { get } from 'lodash';
import { renderFile } from 'ejs';

import {
  ITemplateAdapter,
  IMailerModuleOptions,
  IMailerParams,
} from './interfaces';

export class EjsAdapter implements ITemplateAdapter {
  public compile(
    transporterOptions: IMailerModuleOptions,
    mailerParams: IMailerParams,
  ): Promise<string> {
    const templateExt = '.ejs';
    const templateName = mailerParams.templateName;
    const templateDir = get(transporterOptions, 'template.dir', '');
    const templatePath = path.join(templateDir, templateName + templateExt);

    return new Promise((resolve, reject) => {
      renderFile(templatePath, mailerParams, (error, html) =>
        error ? reject(error) : resolve(html),
      );
    });
  }
}
