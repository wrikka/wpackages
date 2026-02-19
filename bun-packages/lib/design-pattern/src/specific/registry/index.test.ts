import { describe, it, expect, beforeEach } from 'bun:test';
import { Registry, IConfigService, ConfigService } from './index';

describe('Registry Pattern', () => {
    // Clear the registry before each test to ensure isolation
    beforeEach(() => {
        Registry.clear();
    });

    it('should register and retrieve a service', () => {
        const config = new ConfigService({ API_URL: 'https://api.example.com' });
        Registry.register<IConfigService>('ConfigService', config);

        const retrievedConfig = Registry.get<IConfigService>('ConfigService');

        expect(retrievedConfig).toBe(config);
        expect(retrievedConfig.get('API_URL')).toBe('https://api.example.com');
    });

    it('should throw an error if a service is not found', () => {
        expect(() => {
            Registry.get('NonExistentService');
        }).toThrow('Registry: Service with key \'NonExistentService\' not found.');
    });
});
