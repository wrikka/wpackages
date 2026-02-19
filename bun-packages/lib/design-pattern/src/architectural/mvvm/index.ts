// The Model - Same as in MVC
export class UserModel {
    constructor(public name: string, public email: string) {}
}

// The ViewModel - Prepares data for the View
// In a real framework, this would use observables and data binding.
// Here, we'll simulate it with a simple observer pattern.
export class UserViewModel {
    private model: UserModel;
    private _viewUpdateCallback: (() => void) | null = null;

    constructor(model: UserModel) {
        this.model = model;
    }

    // Data exposed to the View
    public get userName(): string {
        return this.model.name.toUpperCase(); // Example of transforming data
    }

    public get userEmail(): string {
        return this.model.email;
    }

    // Command/Action from the View
    public updateUserName(newName: string): void {
        this.model.name = newName;
        this.notifyView();
    }

    // Mechanism to notify the view of changes
    public bind(viewUpdateCallback: () => void): void {
        this._viewUpdateCallback = viewUpdateCallback;
    }

    private notifyView(): void {
        if (this._viewUpdateCallback) {
            this._viewUpdateCallback();
        }
    }
}

// The View - Displays data from the ViewModel
export class UserView {
    private viewModel: UserViewModel;

    constructor(viewModel: UserViewModel) {
        this.viewModel = viewModel;
        this.viewModel.bind(() => this.render()); // Bind to ViewModel updates
    }

    public render(): void {
        console.log('--- User View ---');
        console.log(`Name: ${this.viewModel.userName}`);
        console.log(`Email: ${this.viewModel.userEmail}`);
        console.log('-----------------');
    }

    // Simulates a user interaction that triggers a command
    public changeName(newName: string): void {
        console.log(`\nView: User initiated name change to "${newName}".`);
        this.viewModel.updateUserName(newName);
    }
}
