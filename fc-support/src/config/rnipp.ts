export default {
  hostname: process.env.HOSTNAME || 'rnipp.docker.dev-franceconnect.fr',
  baseUrl:
    process.env.BASE_URL ||
    '/Brpp2IdentificationComplet/individus?rechercheType=S',
  userId: process.env.USER_ID || '',
  clientSiret: process.env.CLIENT_SIRET || '',
  protocol: 'https',
  httpsAgentConfig: {
    rejectUnauthorized: process.env.HTTPSAGENTCONFIG || false,
  },

  headers() {
    return {
      userId: this.get('rnipp.userId'),
      clientSiret: this.get('rnipp.clientSiret'),
    };
  },
};
