import { describe, it, expect, spyOn } from 'bun:test';
import { UserModel, UserViewModel, UserView } from './index';

describe('MVVM Pattern', () => {
    it('should automatically update the view when the viewmodel changes', () => {
        const model = new UserModel('John Doe', 'john.doe@example.com');
        const viewModel = new UserViewModel(model);
        const view = new UserView(viewModel);

        const renderSpy = spyOn(view, 'render');

        // Initial render happens on binding
        expect(renderSpy).toHaveBeenCalledTimes(1);

        // Simulate user interaction in the view, which calls a command on the ViewModel
        view.changeName('Jane Doe');

        // The ViewModel should have notified the View, triggering another render
        expect(renderSpy).toHaveBeenCalledTimes(2);

        // Check if the ViewModel correctly transformed the data for the view
        expect(viewModel.userName).toBe('JANE DOE');
    });
});
