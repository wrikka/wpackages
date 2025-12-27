import { container } from './core/container';
import { UserService } from './features/users/user.service';

async function main() {
  console.log('Starting program application...');

  const userService = container.get<UserService>('userService');

  const userResult = await userService.getUser('1');

  userResult.match(
    (user) => console.log('Successfully fetched user:', user),
    (error) => console.error('Failed to fetch user:', error.message, error.context)
  );
}

main().catch((err) => {
  console.error('Unhandled application error:', err);
  process.exit(1);
});
