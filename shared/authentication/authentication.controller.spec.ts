import {AuthenticationController} from "./authentication.controller";

describe('AuthenticationController', () => {
    const authenticationController = new AuthenticationController();

    describe('logout method', () => {
        it('logs out the user and redirects to the homepage', () => {
            const req = {
                logout: jest.fn(),
            };
            const res = {
                redirect: jest.fn(),
            };

            authenticationController.logout(req, res);

            expect(req.logout).toHaveBeenCalledTimes(1);
            expect(res.redirect).toHaveBeenCalledTimes(1);
        });
    });
});
