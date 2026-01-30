export class UpdateDepsError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'UpdateDepsError';
  }
}

export class PackageNotFoundError extends UpdateDepsError {
  constructor(packageName: string) {
    super(`Package not found: ${packageName}`, 'PACKAGE_NOT_FOUND');
    this.name = 'PackageNotFoundError';
  }
}

export class RegistryError extends UpdateDepsError {
  constructor(message: string) {
    super(message, 'REGISTRY_ERROR');
    this.name = 'RegistryError';
  }
}

export class ConfigError extends UpdateDepsError {
  constructor(message: string) {
    super(message, 'CONFIG_ERROR');
    this.name = 'ConfigError';
  }
}
