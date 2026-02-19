// The Model component manages the data and business logic.
export class UserModel {
    private name: string;
    private email: string;

    constructor(name: string, email: string) {
        this.name = name;
        this.email = email;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getName(): string {
        return this.name;
    }

    public setEmail(email: string): void {
        this.email = email;
    }

    public getEmail(): string {
        return this.email;
    }
}

// The View component is responsible for displaying the data.
export class UserView {
    public printUserDetails(userName: string, userEmail: string): void {
        console.log('User Details:');
        console.log(`Name: ${userName}`);
        console.log(`Email: ${userEmail}`);
    }
}

// The Controller component acts as an interface between Model and View.
export class UserController {
    private model: UserModel;
    private view: UserView;

    constructor(model: UserModel, view: UserView) {
        this.model = model;
        this.view = view;
    }

    public setUserName(name: string): void {
        this.model.setName(name);
    }

    public getUserName(): string {
        return this.model.getName();
    }

    public setUserEmail(email: string): void {
        this.model.setEmail(email);
    }

    public getUserEmail(): string {
        return this.model.getEmail();
    }

    public updateView(): void {
        this.view.printUserDetails(this.model.getName(), this.model.getEmail());
    }
}
