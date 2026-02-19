import { describe, it, expect, spyOn } from 'bun:test';
import { EventEmitter, OrderService, NotificationService } from './index';

describe('Event-Driven Architecture Pattern', () => {
    it('should notify listeners when an event is emitted', () => {
        const emitter = new EventEmitter();
        const orderService = new OrderService(emitter);
        const notificationService = new NotificationService(emitter);

        const notificationSpy = spyOn(notificationService, 'handleOrderCreated');

        const orderData = { orderId: 'xyz-123', amount: 99.99 };
        orderService.createOrder(orderData);

        expect(notificationSpy).toHaveBeenCalled();
        expect(notificationSpy.mock.calls[0][0]).toMatchObject(orderData);
    });
});
