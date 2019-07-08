import express from 'express';
import Api from '../controllers/Api';

class ApiV1 {
  constructor(container) {
    this.router = express.Router();

    this.registerContainer(container);
    this.registerRoutes();

    return this.router;
  }

  registerContainer(container) {
    this.router.use((req, res, next) => {
      req.container = container;
      next();
    });
  }

  registerRoutes() {
    this.router.get('/total/:action/:start/:stop', Api.getTotalForAction);
    this.router.get(
      '/totalByFi/:fi/:start/:stop',
      Api.getTotalForActionsAndFiAndRangeByWeek
    );
  }
}

export default ApiV1;
