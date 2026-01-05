# API Reference

This document provides a detailed API reference for `@w/store`.

### `atom(initialValue)`
Creates a store for any single value.

### `map(initialValue)`
Creates a store for object values.

### `computed(stores, computerFn)`
Creates a readonly store whose value is derived from other stores.

### `onMount(store, callback)`
Runs a callback when a store gets its first subscriber.
