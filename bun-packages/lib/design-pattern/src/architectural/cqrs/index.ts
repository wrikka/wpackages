// This is a conceptual demonstration of CQRS.

// --- Data Stores ---
// In a real application, these would be separate databases optimized for their purpose.
const userWriteStore: Map<string, { id: string; name: string; email: string }> = new Map();
const userReadStore: Map<string, { id: string; name: string }> = new Map(); // A simplified model for reads

// --- Commands ---
// Represent the intent to change state.
class CreateUserCommand {
    constructor(public readonly id: string, public readonly name: string, public readonly email: string) {}
}

class ChangeUserEmailCommand {
    constructor(public readonly id: string, public readonly newEmail: string) {}
}

// --- Command Handlers ---
// Process commands and mutate state.
class UserCommandHandler {
    public handleCreateUser(command: CreateUserCommand): void {
        console.log(`CommandHandler: Creating user ${command.name}`);
        const user = { id: command.id, name: command.name, email: command.email };
        userWriteStore.set(command.id, user);
        // In a real system, an event would be published here to update the read model.
        this.updateReadModel(user);
    }

    public handleChangeUserEmail(command: ChangeUserEmailCommand): void {
        console.log(`CommandHandler: Changing email for user ${command.id}`);
        const user = userWriteStore.get(command.id);
        if (user) {
            user.email = command.newEmail;
            userWriteStore.set(command.id, user);
            this.updateReadModel(user);
        }
    }

    // This simulates the process of updating the read model (e.g., via an event listener).
    private updateReadModel(user: { id: string; name: string; email: string }): void {
        console.log(`Updating read model for user ${user.id}`);
        userReadStore.set(user.id, { id: user.id, name: user.name });
    }
}

// --- Queries ---
// Represent the intent to read data.
class GetUserQuery {
    constructor(public readonly id: string) {}
}

// --- Query Handlers ---
// Process queries and return data without mutating state.
class UserQueryHandler {
    public handleGetUser(query: GetUserQuery): { id: string; name: string } | undefined {
        console.log(`QueryHandler: Getting user ${query.id}`);
        return userReadStore.get(query.id);
    }
}

// --- Main Application Logic ---
export function runCQRSExample() {
    const commandHandler = new UserCommandHandler();
    const queryHandler = new UserQueryHandler();

    // 1. Execute a command to create a user
    const userId = 'user-1';
    const createUser = new CreateUserCommand(userId, 'John Doe', 'john@example.com');
    commandHandler.handleCreateUser(createUser);

    // 2. Execute a query to get the user
    const getUser = new GetUserQuery(userId);
    const user = queryHandler.handleGetUser(getUser);
    console.log('Query Result:', user);

    // 3. Execute a command to change the user's email
    const changeEmail = new ChangeUserEmailCommand(userId, 'john.doe@newdomain.com');
    commandHandler.handleChangeUserEmail(changeEmail);

    // 4. Re-query the user (read model hasn't changed in this simple case)
    const updatedUser = queryHandler.handleGetUser(getUser);
    console.log('Updated Query Result:', updatedUser);

    return { user, updatedUser };
}
