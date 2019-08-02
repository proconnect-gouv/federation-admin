import {
  Controller,
  Get,
  Post,
  Render,
  Body,
  UsePipes,
  ValidationPipe,
  Req,
} from '@nestjs/common';

import { RnippService } from './rnipp.service';
import { ErrorControllerInterface } from './interface/error-controller.interface';
import { Person } from './interface/person.interface';
import { PersonRequestedDTO } from './dto/person-requested-input.dto';
import { PersonFoundDTO } from './dto/person-found-output.dto';
import { PersonFromRnipp } from './interface/personFromRnipp.interface';

@Controller()
export class RnippController {
  prototype: any;
  public constructor(private readonly rnippService: RnippService) {}

  @Get('rnipp')
  @Render('rnipp')
  // tslint:disable-next-line: no-empty
  public async rnippView(@Req() req) {
    const csrfToken = req.csrfToken();
    return { csrfToken };
  }

  @Post('research')
  @Render('rnipp')
  @UsePipes(new ValidationPipe({ transform: true }))
  public async researchRnipp(
    @Body() personRequested: PersonRequestedDTO,
    @Req() req,
  ): Promise<PersonFoundDTO | ErrorControllerInterface> {
    try {
      const rnipp: PersonFromRnipp = await this.rnippService.getJsonFromRnippApi(
        personRequested as Person,
      );
      const csrfToken = req.csrfToken();
      return {
        person: {
          requested: personRequested,
          found: rnipp.personFoundByRnipp,
        },
        rnippResponse: {
          code: rnipp.rnippCode,
          raw: rnipp.rawResponse,
        },
        csrfToken,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private async handleError(error: any): Promise<ErrorControllerInterface> {
    if (error.errors) {
      return { message: error.errors };
    } else {
      return {
        rawResponse: error.rawResponse,
        statusCode: error.statusCode || 500,
        message: error.message,
      };
    }
  }
}
