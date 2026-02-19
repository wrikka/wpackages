import { getTestMetadataManager } from "./global";

// Decorators for test metadata
export function slow(threshold?: number) {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.markSlow(propertyKey, threshold);
	};
}

export function skip(reason?: string) {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.skipTest(propertyKey, reason);
	};
}

export function only() {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.markOnly(propertyKey);
	};
}

export function tags(...tagList: string[]) {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.addTags(propertyKey, tagList);
	};
}

export function timeout(ms: number) {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.addAnnotation(propertyKey, "timeout", ms);
	};
}

export function retries(count: number) {
	return function(target: any, propertyKey: string, _descriptor: PropertyDescriptor) {
		const manager = getTestMetadataManager();
		manager.addAnnotation(propertyKey, "retries", count);
	};
}
