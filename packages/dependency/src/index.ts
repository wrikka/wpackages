import 'reflect-metadata';

export enum Scope {
  Transient,
  Singleton,
}

type Constructor<T> = new (...args: any[]) => T;
export type Token<T> = string | symbol | Constructor<T>;

interface Registration<T> {
  constructor: Constructor<T>;
  scope: Scope;
  instance?: T;
}

const container = new Map<Token<any>, Registration<any>>();

export function clear() {
  container.clear();
}

export function injectable() {
  return function <T>(_target: Constructor<T>) {};
}

export function register<T>(
  token: Token<T>,
  options: { useClass: Constructor<T>; scope?: Scope },
): void;
export function register<T>(constructor: Constructor<T>, scope?: Scope): void;
export function register<T>(
  tokenOrCtor: Token<T> | Constructor<T>,
  optionsOrScope?: { useClass: Constructor<T>; scope?: Scope } | Scope,
): void {
  let token: Token<T>;
  let constructor: Constructor<T>;
  let scope = Scope.Transient;

  if (typeof optionsOrScope === 'object' && optionsOrScope !== null && 'useClass' in optionsOrScope) {
    // Corresponds to register(token, { useClass, scope })
    token = tokenOrCtor;
    constructor = optionsOrScope.useClass;
    scope = optionsOrScope.scope ?? Scope.Transient;
  } else if (typeof tokenOrCtor === 'function') {
    // Corresponds to register(constructor, scope?)
    token = tokenOrCtor;
    constructor = tokenOrCtor;
    if (typeof optionsOrScope === 'number') {
      scope = optionsOrScope;
    }
  } else {
    throw new Error('Invalid registration arguments');
  }

  container.set(token, { constructor, scope });
}

export function resolve<T>(token: Token<T>): T {
  const registration = container.get(token);

  let targetCtor: Constructor<T>;

  if (registration) {
    targetCtor = registration.constructor;
  } else if (typeof token === 'function') {
    targetCtor = token as Constructor<T>;
  } else {
    throw new Error(`No provider for token: ${token.toString()}`);
  }

  if (registration?.scope === Scope.Singleton) {
    if (!registration.instance) {
      registration.instance = createInstance(targetCtor);
    }
    return registration.instance;
  }

  return createInstance(targetCtor);
}

function createInstance<T>(constructor: Constructor<T>): T {
  const paramTypes: any[] = Reflect.getMetadata('design:paramtypes', constructor) || [];
  const dependencies = paramTypes.map(dep => resolve(dep));
  return new constructor(...dependencies);
}
