import Job from './Job';

class WeeklyIdpRepport extends Job {
  static usage() {
    return `
      Usage:
      > WeeklyIdpRepport --idp=<idp identifier> --email=<email address to send repport to>
    `;
  }

  // get the date with n days
  static getShiftedDate(date, days) {
    const shiftTime = days * 24 * 60 * 60 * 1000;
    return new Date(date.setTime(date.getTime() + shiftTime));
  }

  static getDateAtMidnight(from) {
    const date = new Date(from);
    date.setUTCHours(0);
    date.setUTCMinutes(0);
    date.setUTCSeconds(0);

    return date;
  }

  static formatDate(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return [
      date.getFullYear(),
      month > 9 ? month : `0${month}`,
      day > 9 ? day : `0${day}`,
    ].join('-');
  }

  static formatRows(weeks) {
    const orderedWeeks = weeks.reverse();
    return orderedWeeks
      .map(week => {
        let html = `<td>Semaine du ${WeeklyIdpRepport.formatDate(
          new Date(week.startDate)
        )}</td>`;

        // identityProviderChoice : Clics sur le bouton,
        const identityProviderChoice = WeeklyIdpRepport.getPropertyCount(
          week.events,
          'identityProviderChoice'
        );

        // identityProviderAuthentication : Authentifications réussies chez le FI
        const identityProviderAuthentication = WeeklyIdpRepport.getPropertyCount(
          week.events,
          'identityProviderAuthentication'
        );

        // initial : Authentifications réussies chez le FS
        const initial = WeeklyIdpRepport.getPropertyCount(
          week.events,
          'initial'
        );

        html += [
          `<td>${identityProviderChoice}</td>`,
          `<td>${identityProviderAuthentication}</td>`,
          `<td>${initial}</td>`,
        ].join('');

        return `<tr>${html}</tr>`;
      })
      .join('');
  }

  static getPropertyCount(events, property) {
    const filteredEvent = events
      .filter(event => event.label === property)
      .shift();
    if (!filteredEvent) {
      return 0;
    }
    return filteredEvent.count;
  }

  static formatMessage(idp, weeks) {
    const rows = WeeklyIdpRepport.formatRows(weeks);
    const html = `
      Bonjour,
      Veuillez trouver ci-après les statistiques d'utilisation de FranceConnect vous concernant, regroupées par semaine :
      <table border="1" cellpadding="10">
        <thead>
          <tr>
            <th>Depuis</th>
            <th>Clics sur le bouton ${idp}</th>
            <th>Authentifications réussies chez le FI</th>
            <th>Authentifications réussies chez le FS <sup>*</sup></th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <p><sup>*</sup> Premières connexions et SSO cumulés</p>
    `;

    return html;
  }

  static getSubject(idp) {
    const date = WeeklyIdpRepport.formatDate(new Date());
    return [
      "[FranceConnect] Vos statistiques d'activité",
      idp,
      process.env.NODE_ENV,
      date,
    ].join(' - ');
  }

  static getDateRange(date) {
    const endDate = WeeklyIdpRepport.getDateAtMidnight(
      WeeklyIdpRepport.getShiftedDate(date, -1)
    );
    const stop = WeeklyIdpRepport.formatDate(endDate);
    const start = WeeklyIdpRepport.formatDate(
      new Date(String(endDate.getFullYear()))
    );

    return { start, stop };
  }

  async run(params) {
    // Setup
    const { input, mailer, stats } = this.container.get([
      'input',
      'mailer',
      'stats',
    ]);

    const schema = {
      idp: { type: 'string', mandatory: true },
      email: { type: 'string', mandatory: true },
    };
    const { idp, email } = input.get(schema, params);
    const { start, stop } = WeeklyIdpRepport.getDateRange(new Date());

    const data = await stats.getTotalForActionsAndFiAndRangeByWeek(
      idp,
      start,
      stop
    );

    const emailContent = WeeklyIdpRepport.formatMessage(idp, data);
    const subject = WeeklyIdpRepport.getSubject(idp);
    // Render
    mailer.send({
      subject,
      fromEmail: 'ne-pas-repondre@franceconnect.gouv.fr',
      fromName: 'FranceConnect',
      recipients:  [email],
      body: emailContent,
    });
  }
}

WeeklyIdpRepport.description =
  'Sends a weekly stats report to Identity provider';

export default WeeklyIdpRepport;
