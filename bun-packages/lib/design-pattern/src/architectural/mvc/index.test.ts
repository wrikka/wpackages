import { describe, it, expect, spyOn } from 'bun:test';
import { UserModel, UserView, UserController } from './index';

describe('MVC Pattern', () => {
    it('should update the view based on model changes through the controller', () => {
        const model = new UserModel('John Doe', 'john.doe@example.com');
        const view = new UserView();
        const controller = new UserController(model, view);

        const viewSpy = spyOn(view, 'printUserDetails');

        // Initial view update
        controller.updateView();
        expect(viewSpy).toHaveBeenCalledWith('John Doe', 'john.doe@example.com');

        // Change data through the controller
        controller.setUserName('Jane Doe');
        controller.setUserEmail('jane.doe@example.com');

        // Update view again
        controller.updateView();
        expect(viewSpy).toHaveBeenCalledWith('Jane Doe', 'jane.doe@example.com');

        expect(viewSpy).toHaveBeenCalledTimes(2);
    });
});
