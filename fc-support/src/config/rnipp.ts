export default {
  hostname: process.env.RNIPP_HOSTNAME || 'rnipp.docker.dev-franceconnect.fr',
  baseUrl:
    process.env.RNIPP_BASE_URL ||
    '/Brpp2IdentificationComplet/individus?rechercheType=S',
  userId: process.env.RNIPP_USER_ID || '',
  clientSiret: process.env.RNIPP_CLIENT_SIRET || '',
  protocol: process.env.RNIPP_PROTOCOL || 'https',

  get httpsAgentConfig() {
    const config = {
      rejectUnauthorized: process.env.RNIPP_HTTPS_AGENT_INSECURE || false,
    };

    if (
      process.env.RNIPP_HTTPS_AGENT_KEY ||
      process.env.RNIPP_HTTPS_AGENT_CERT
    ) {
      if (process.env.RNIPP_HTTPS_AGENT_CA) {
        config.ca = process.env.RNIPP_HTTPS_AGENT_CA;
      }

      config.key = process.env.RNIPP_HTTPS_AGENT_KEY;
      config.cert = process.env.RNIPP_HTTPS_AGENT_CERT;
    }

    return config;
  },

  get headers() {
    return {
      userId: this.get('rnipp.userId'),
      clientSiret: this.get('rnipp.clientSiret'),
    };
  },
};
