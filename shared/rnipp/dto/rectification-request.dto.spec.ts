import { RectificationRequestDTO } from './rectification-request.dto';

describe('RectificationRequestDTO', () => {
  let rectificationRequest: RectificationRequestDTO;
  beforeEach(async () => {
    rectificationRequest = new RectificationRequestDTO();
  });
  describe('rectifyIfPartialBirthdate', () => {
    it('should add "-01-01" if the brithdate is formatted "YYYY"', () => {
      // setup
      const birthdate = '1992';
      const expected = '1992-01-01';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = rectificationRequest['rectifyIfPartialBirthdate'](
        birthdate,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });

    it('should add "-01" if the brithdate is formatted "YYYY-MM"', () => {
      // setup
      const birthdate = '1992-11';
      const expected = '1992-11-01';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = rectificationRequest['rectifyIfPartialBirthdate'](
        birthdate,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });

    it('should not modify a date formatted "YYYY-MM-DD"', () => {
      // setup
      const birthdate = '1992-04-23';
      const expected = '1992-04-23';

      // action
      // To test the private we must use this syntax
      // tslint:disable-next-line: no-string-literal
      const result = rectificationRequest['rectifyIfPartialBirthdate'](
        birthdate,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });
});
