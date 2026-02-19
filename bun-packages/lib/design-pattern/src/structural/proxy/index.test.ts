import { describe, it, expect, spyOn } from 'bun:test';
import { Proxy } from './index';

// Mock RealSubject for testing purposes
class RealSubject {
    public request(): void {}
}

describe('Proxy Pattern', () => {
    it('should control access to the real subject', () => {
        const realSubject = new RealSubject();
        const realSubjectRequestSpy = spyOn(realSubject, 'request');
        const proxy = new Proxy(realSubject);

        // Mock console.log to verify logging
        const consoleLogSpy = spyOn(console, 'log').mockImplementation(() => {});

        proxy.request();

        expect(consoleLogSpy).toHaveBeenCalledWith('Proxy: Checking access prior to firing a real request.');
        expect(realSubjectRequestSpy).toHaveBeenCalled();
        expect(consoleLogSpy).toHaveBeenCalledWith('Proxy: Logging the time of request.');

        consoleLogSpy.mockRestore();
    });
});
