// --- Option (Maybe) Type ---

type Some<T> = { _tag: 'Some'; value: T };
type None = { _tag: 'None' };
export type Option<T> = Some<T> | None;

export const some = <T>(value: T): Some<T> => ({ _tag: 'Some', value });
export const none = (): None => ({ _tag: 'None' });

export const isSome = <T>(option: Option<T>): option is Some<T> => option._tag === 'Some';
export const isNone = <T>(option: Option<T>): option is None => option._tag === 'None';

// --- Result Type ---

type Ok<T> = { _tag: 'Ok'; value: T };
type Err<E> = { _tag: 'Err'; error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const ok = <T>(value: T): Ok<T> => ({ _tag: 'Ok', value });
export const err = <E>(error: E): Err<E> => ({ _tag: 'Err', error });

export const isOk = <T, E>(result: Result<T, E>): result is Ok<T> => result._tag === 'Ok';
export const isErr = <T, E>(result: Result<T, E>): result is Err<E> => result._tag === 'Err';

// --- Example Usage ---

const users = new Map<string, { id: string; name: string }>();
users.set('1', { id: '1', name: 'Alice' });

export function findUserById(id: string): Option<{ id: string; name: string }> {
    const user = users.get(id);
    return user ? some(user) : none();
}

export function parseJson(jsonString: string): Result<any, Error> {
    try {
        return ok(JSON.parse(jsonString));
    } catch (error) {
        return err(error as Error);
    }
}
