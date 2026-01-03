import { expect, test, describe, beforeEach } from "bun:test";
import { injectable, register, resolve, Scope, clear } from "../src/index";

describe("DI Container V3 - Scopes", () => {
  beforeEach(() => {
    clear();
  });

  test("should resolve as transient by default", () => {
    @injectable()
    class TransientService {}
    register(TransientService);

    const instance1 = resolve(TransientService);
    const instance2 = resolve(TransientService);

    expect(instance1).toBeInstanceOf(TransientService);
    expect(instance2).toBeInstanceOf(TransientService);
    expect(instance1).not.toBe(instance2);
  });

  test("should resolve as singleton when specified", () => {
    @injectable()
    class SingletonService {}
    register(SingletonService, Scope.Singleton);

    const instance1 = resolve(SingletonService);
    const instance2 = resolve(SingletonService);

    expect(instance1).toBeInstanceOf(SingletonService);
    expect(instance2).toBe(instance1);
  });

  test("should handle nested dependencies with different scopes", () => {
    @injectable()
    class TransientDep {}
    register(TransientDep, Scope.Transient);

    @injectable()
    class SingletonDep {}
    register(SingletonDep, Scope.Singleton);

    @injectable()
    class RootA {
      constructor(
        public transient: TransientDep,
        public singleton: SingletonDep
      ) {}
    }
    register(RootA, Scope.Singleton);

    @injectable()
    class RootB {
      constructor(
        public transient: TransientDep,
        public singleton: SingletonDep
      ) {}
    }
    register(RootB, Scope.Singleton);

    const rootA = resolve(RootA);
    const rootB = resolve(RootB);

    // Both root services are singletons, but they are different from each other
    expect(rootA).not.toBe(rootB);

    // They should share the same singleton dependency
    expect(rootA.singleton).toBe(rootB.singleton);

    // They should have different transient dependencies
    expect(rootA.transient).not.toBe(rootB.transient);
  });

  test('should register with a token and resolve as singleton', () => {
    const ServiceToken = 'ServiceToken';

    @injectable()
    class ServiceImpl {}

    register(ServiceToken, { useClass: ServiceImpl, scope: Scope.Singleton });

    const instance1 = resolve<ServiceImpl>(ServiceToken);
    const instance2 = resolve<ServiceImpl>(ServiceToken);

    expect(instance1).toBeInstanceOf(ServiceImpl);
    expect(instance1).toBe(instance2);
  });
});
