class Authentication {
  constructor(config) {
    this.config = config;
  }

  middleware(req, res, next) {
    if (typeof req.headers.token === 'undefined') {
      return res.sendStatus(401);
    }

    if (req.headers.token !== this.config.token) {
      return res.sendStatus(403);
    }

    return next();
  }
}

export default Authentication;
