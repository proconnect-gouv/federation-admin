export default {
  hostname: process.env.RNIPP_HOSTNAME || 'rnipp.docker.dev-franceconnect.fr',
  baseUrl:
    process.env.RNIPP_BASE_URL ||
    '/Brpp2IdentificationComplet/individus?rechercheType=S',
  userId: process.env.RNIPP_USER_ID || '',
  clientSiret: process.env.RNIPP_CLIENT_SIRET || '',
  protocol: process.env.RNIPP_PROTOCOL || 'https',
  httpsAgentConfig: {
    rejectUnauthorized: process.env.RNIPP_HTTPSAGENTCONFIG || false,
  },

  headers() {
    return {
      userId: this.get('rnipp.userId'),
      clientSiret: this.get('rnipp.clientSiret'),
    };
  },
};
