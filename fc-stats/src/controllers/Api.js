class Api {
  static handleError(error, res) {
    const { message, stack, type } = error;
    if (typeof type !== 'undefined' && type === 'input') {
      res.status(400);
      return res.json({ error: { message, stack } });
    }

    res.status(500);
    return res.json({ error: { message } });
  }

  static async getTotalForAction(req, res) {
    try {
      // Setup parameters
      const schema = {
        action: { type: 'action', mandatory: true },
        start: { type: 'date', mandatory: true },
        stop: { type: 'date', mandatory: true },
      };
      const { input, stats } = req.container.services;
      // Run action
      const { action, start, stop } = input.get(schema, req.params);
      const payload = await stats.getTotalForAction({
        action,
        start: new Date(start),
        stop: new Date(stop),
      });
      // Display result
      res.json({ payload });
    } catch (error) {
      // Error handling
      Api.handleError(error, res);
    }
  }

  static async getTotalForActionsAndFiAndRangeByWeek(req, res) {
    try {
      // Setup parameters
      const schema = {
        /** @TODO create a safe string validator to prevent injection */
        fi: { type: 'string', mandatory: true },
        start: { type: 'date', mandatory: true },
        stop: { type: 'date', mandatory: true },
      };
      const { input, stats } = req.container.services;
      // Run action
      const { fi, start, stop } = input.get(schema, req.params);
      const payload = await stats.getTotalForActionsAndFiAndRangeByWeek({
        fi,
        start: new Date(start),
        stop: new Date(stop),
      });
      // display result
      res.json({ payload });
    } catch (error) {
      // Error handling
      Api.handleError(error, res);
    }
  }
}

export default Api;
