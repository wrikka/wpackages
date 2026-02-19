import { describe, it, expect } from 'bun:test';
import { runCQRSExample } from './index';

describe('CQRS Pattern', () => {
    it('should separate command and query operations', () => {
        // Note: This is a simplified test for a conceptual example.
        // In a real system, you would test handlers in isolation.
        const { user, updatedUser } = runCQRSExample();

        // The query should return the data from the read model.
        expect(user).toEqual({ id: 'user-1', name: 'John Doe' });

        // Even after the email (write model) was updated, our simple read model
        // still returns the same data, demonstrating the separation.
        expect(updatedUser).toEqual({ id: 'user-1', name: 'John Doe' });
    });
});
