import { describe, it, expect } from 'bun:test';
import { findUserById, isSome, isNone, parseJson, isOk, isErr } from './index';

describe('Option Type', () => {
    it('should return Some when a user is found', () => {
        const userOption = findUserById('1');
        expect(isSome(userOption)).toBe(true);
        if (isSome(userOption)) {
            expect(userOption.value.name).toBe('Alice');
        }
    });

    it('should return None when a user is not found', () => {
        const userOption = findUserById('2');
        expect(isNone(userOption)).toBe(true);
    });
});

describe('Result Type', () => {
    it('should return Ok for valid JSON', () => {
        const result = parseJson('{"key": "value"}');
        expect(isOk(result)).toBe(true);
        if (isOk(result)) {
            expect(result.value).toEqual({ key: 'value' });
        }
    });

    it('should return Err for invalid JSON', () => {
        const result = parseJson('invalid-json');
        expect(isErr(result)).toBe(true);
        if (isErr(result)) {
            expect(result.error).toBeInstanceOf(Error);
        }
    });
});
