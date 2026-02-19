use std::fmt;

/// Optional value type, similar to Option<T> but with Effect integration
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OptionEffect<T> {
    Some(T),
    None,
}

impl<T> OptionEffect<T> {
    pub fn some(value: T) -> Self {
        Self::Some(value)
    }

    pub fn none() -> Self {
        Self::None
    }

    pub fn is_some(&self) -> bool {
        matches!(self, Self::Some(_))
    }

    pub fn is_none(&self) -> bool {
        matches!(self, Self::None)
    }

    pub fn map<U, F>(self, f: F) -> OptionEffect<U>
    where
        F: FnOnce(T) -> U,
    {
        match self {
            Self::Some(v) => OptionEffect::Some(f(v)),
            Self::None => OptionEffect::None,
        }
    }

    pub fn unwrap_or(self, default: T) -> T
    where
        T: Clone,
    {
        match self {
            Self::Some(v) => v,
            Self::None => default,
        }
    }
}

impl<T> From<Option<T>> for OptionEffect<T> {
    fn from(opt: Option<T>) -> Self {
        match opt {
            Some(v) => Self::Some(v),
            None => Self::None,
        }
    }
}

impl<T> From<OptionEffect<T>> for Option<T> {
    fn from(opt: OptionEffect<T>) -> Self {
        match opt {
            OptionEffect::Some(v) => Some(v),
            OptionEffect::None => None,
        }
    }
}

/// Either type for representing values that can be one of two types
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum Either<L, R> {
    Left(L),
    Right(R),
}

impl<L, R> Either<L, R> {
    pub fn left(value: L) -> Self {
        Self::Left(value)
    }

    pub fn right(value: R) -> Self {
        Self::Right(value)
    }

    pub fn is_left(&self) -> bool {
        matches!(self, Self::Left(_))
    }

    pub fn is_right(&self) -> bool {
        matches!(self, Self::Right(_))
    }

    pub fn map_left<F, L2>(self, f: F) -> Either<L2, R>
    where
        F: FnOnce(L) -> L2,
    {
        match self {
            Self::Left(v) => Either::Left(f(v)),
            Self::Right(v) => Either::Right(v),
        }
    }

    pub fn map_right<F, R2>(self, f: F) -> Either<L, R2>
    where
        F: FnOnce(R) -> R2,
    {
        match self {
            Self::Left(v) => Either::Left(v),
            Self::Right(v) => Either::Right(f(v)),
        }
    }

    pub fn unwrap_left(self) -> L {
        match self {
            Self::Left(v) => v,
            Self::Right(_) => panic!("called unwrap_left on Right value"),
        }
    }

    pub fn unwrap_right(self) -> R {
        match self {
            Self::Left(_) => panic!("called unwrap_right on Left value"),
            Self::Right(v) => v,
        }
    }
}

impl<L, R> fmt::Display for Either<L, R>
where
    L: fmt::Display,
    R: fmt::Display,
{
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Left(v) => write!(f, "Left({})", v),
            Self::Right(v) => write!(f, "Right({})", v),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_option_effect_some() {
        let opt = OptionEffect::some(42);
        assert!(opt.is_some());
        assert!(!opt.is_none());
        assert_eq!(opt.map(|x| x * 2), OptionEffect::some(84));
    }

    #[test]
    fn test_option_effect_none() {
        let opt: OptionEffect<i32> = OptionEffect::none();
        assert!(!opt.is_some());
        assert!(opt.is_none());
        assert_eq!(opt.map(|x| x * 2), OptionEffect::none());
    }

    #[test]
    fn test_either_left() {
        let either: Either<i32, String> = Either::left(42);
        assert!(either.is_left());
        assert!(!either.is_right());
        assert_eq!(either.map_left(|x| x * 2), Either::left(84));
    }

    #[test]
    fn test_either_right() {
        let either: Either<i32, String> = Either::right("hello".to_string());
        assert!(!either.is_left());
        assert!(either.is_right());
        assert_eq!(
            either.map_right(|s| s.to_uppercase()),
            Either::right("HELLO".to_string())
        );
    }
}
