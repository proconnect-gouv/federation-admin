export default {
  transport: process.env.EMAIL_TRANSPORT || 'stdout',
  mailjetKey: process.env.MAILJET_KEY || '',
  mailjetSecret: process.env.MAILJET_SECRET || '',
  smtpSenderName: process.env.SMTP_SENDER_NAME || 'FranceConnect',
  smtpSenderEmail:
    process.env.SMTP_SENDER_EMAIL || 'ne-pas-repondre@franceconnect.gouv.fr',
  options: {
    proxyUrl: process.env.HTTPS_PROXY || '',
  },
};
