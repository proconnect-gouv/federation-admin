import Container from '../../../src/services/Container';
import WeeklyIdpRepport from '../../../src/jobs/WeeklyIdpRepport';

describe('WeeklyIdpRepport', () => {
  describe('getShiftedDate', () => {
    it('Should return a new date object', () => {
      // Given
      const input = new Date('2019-05-01');
      const shift = 5;
      // When
      const result = WeeklyIdpRepport.getShiftedDate(input, shift);
      // Then
      expect(result).not.toBe(input);
      expect(result instanceof Date).toBe(true);
    });
    it('Should return a shifted date in the futur', () => {
      // Given
      const input = new Date('2019-05-01');
      const shift = 5;
      // When
      const result = WeeklyIdpRepport.getShiftedDate(input, shift);
      // Then
      expect(result.toUTCString()).toBe('Mon, 06 May 2019 00:00:00 GMT');
    });
    it('Should return a shifted date in the past', () => {
      // Given
      const input = new Date('2019-05-01');
      const shift = -5;
      // When
      const result = WeeklyIdpRepport.getShiftedDate(input, shift);
      // Then
      expect(result.toUTCString()).toBe('Fri, 26 Apr 2019 00:00:00 GMT');
    });
  });

  describe('getDateAtMidnight', () => {
    it('Should return a new date object', () => {
      // Given
      const input = new Date('2019-05-01');
      // When
      const result = WeeklyIdpRepport.getDateAtMidnight(input);
      // Then
      expect(result).not.toBe(input);
      expect(result instanceof Date).toBe(true);
    });
    it('Should return a new date where time id midnight', () => {
      // Given
      const input = new Date('2019-05-01T12:34:56.000Z');
      // When
      const result = WeeklyIdpRepport.getDateAtMidnight(input);
      // Then
      expect(result.toUTCString()).toBe('Wed, 01 May 2019 00:00:00 GMT');
    });
  });

  describe('formatDate', () => {
    it('Should return a formated date', () => {
      // Given
      const today = new Date('2019-05-20T12:34:56.000Z');
      // When
      const result = WeeklyIdpRepport.formatDate(today, 5);
      // Then
      expect(result).toBe('2019-05-20');
    });
  });

  describe('getDateRange', () => {
    it('Should return two bounds of a week', () => {
      // Given
      const input = new Date('2019-05-01');
      // When
      const result = WeeklyIdpRepport.getDateRange(input);
      // Then
      expect(result).toEqual({ start: '2019-01-01', end: '2019-04-30' });
    });
  });

  describe('formatRows', () => {
    it('Should return formated HTML', () => {
      // Given
      const data = [
        {
          startDate: 1516579200000,
          events: [
            {
              count: 665,
              label: 'confirmauthentication',
            },
            {
              count: 660,
              label: 'initial',
            },
            {
              count: 396,
              label: 'identityproviderauthentication',
            },
            {
              count: 726,
              label: 'identityproviderchoice',
            },
          ],
        },
      ];
      // When
      const result = WeeklyIdpRepport.formatRows(data);
      // Then
      expect(typeof result).toBe('string');
      expect(result).toEqual(
        [
          '<tr><td>Semaine du 2018-01-22</td>',
          '<td>660</td>',
          '<td>396</td>',
          '<td>726</td></tr>',
        ].join('\n')
      );
    });
  });

  describe('run', () => {
    it('Should call mailer service with good params', async () => {
      // Given
      const send = jest.fn();
      const container = new Container();

      container.add('input', () => ({ get: (schema, values) => values }));
      container.add('mailer',() => ( { send }));
      container.add('config',() => ( { getAPIRoot: () => 'foo' }));
      container.add('logger',() => ( { info: jest.fn() }));
      container.add('httpClient', () => ({
        get: () =>
          Promise.resolve({
            data: {
              payload: {
                weeks: [
                  {
                    startDate: 1514764800000,
                    events: [{ count: 2, label: 'bar' }],
                  },
                ],
              },
            },
          }),
      }));

      const params = { idp: 'foo', email: 'fizz@buzz.com' };
      // When
      const instance = new WeeklyIdpRepport(container);
      await instance.run(params);
      // Then
      expect(send.mock.calls).toHaveLength(1);
      expect(Object.keys(send.mock.calls[0][0])).toEqual([
        'subject',
        'fromEmail',
        'fromName',
        'recipients',
        'body',
      ]);
      expect(send.mock.calls[0][0].subject).toEqual(
        expect.stringContaining(params.idp)
      );
      expect(send.mock.calls[0][0].recipients).toEqual([
        { Email: params.email },
      ]);
    });
  });
});
