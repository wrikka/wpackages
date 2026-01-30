export interface EnrichmentConfig {
	serviceName?: string;
	serviceVersion?: string;
	environment?: string;
	deploymentId?: string;
	region?: string;
	customAttributes?: Record<string, unknown>;
}

export class AttributeEnricher {
	private config: EnrichmentConfig;

	constructor(config: EnrichmentConfig = {}) {
		this.config = config;
	}

	enrich(attributes: Record<string, unknown>): Record<string, unknown> {
		const enriched = { ...attributes };

		if (this.config.serviceName) {
			enriched["service.name"] = this.config.serviceName;
		}
		if (this.config.serviceVersion) {
			enriched["service.version"] = this.config.serviceVersion;
		}
		if (this.config.environment) {
			enriched["deployment.environment"] = this.config.environment;
		}
		if (this.config.deploymentId) {
			enriched["deployment.id"] = this.config.deploymentId;
		}
		if (this.config.region) {
			enriched["cloud.region"] = this.config.region;
		}

		if (this.config.customAttributes) {
			Object.assign(enriched, this.config.customAttributes);
		}

		return enriched;
	}

	updateConfig(config: Partial<EnrichmentConfig>): void {
		this.config = { ...this.config, ...config };
	}
}

export function createAttributeEnricher(config?: EnrichmentConfig): AttributeEnricher {
	return new AttributeEnricher(config);
}
