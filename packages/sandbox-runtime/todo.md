# WebContainer Project Roadmap

This document outlines the development plan for creating a WebContainer capable of running Node.js environments natively in the browser, inspired by StackBlitz's WebContainers.

---

### Phase 1: Core Shell & Virtual Filesystem (VFS) - (✅ Completed)

This phase establishes the foundational Rust-based WASM module with a functional in-memory filesystem and a basic command-line shell.

- [x] **Project Setup:** Initialize Rust (WASM lib) and Nuxt.js (example UI) projects.
- [x] **VFS Implementation:** Integrate the `vfs` crate to create a virtual, in-memory filesystem.
- [x] **Core VFS API:** Expose basic filesystem operations via WASM (`mkdir`, `touch`, `read_file`, `write_file`).
- [x] **Shell Implementation:** Implement a basic shell using `shlex` for command parsing.
- [x] **Built-in Commands:** Create essential shell commands (`ls`, `cd`, `pwd`) that interact with the VFS.
- [x] **UI Integration:** Develop a terminal-like UI in the Nuxt.js example to interact with the WASM shell.

---

### Phase 2: Advanced VFS & Process Primitives

This phase focuses on building a more robust virtual environment by simulating core OS features.

- [ ] **File Permissions & Ownership:** Implement a basic permission model (e.g., read, write, execute) for files and directories.
- [ ] **File Descriptors:** Create a system for managing file descriptors.
- [ ] **Process Primitives:**
  - [ ] Design and implement a basic Process Control Block (PCB) struct to represent running processes.
  - [ ] Create a virtual `stdin`, `stdout`, and `stderr` stream for each process.

---

### Phase 3: JavaScript Runtime Integration

This phase involves embedding a JavaScript engine to enable script execution.

- [ ] **Research & Select JS Engine:** Evaluate Rust-based JavaScript interpreters (e.g., `boa_engine`) for WASM compatibility and performance.
- [ ] **Engine Integration:** Compile the selected JS engine to WASM and integrate it into the `WebContainer`.
- [ ] **`js` Command:** Create a new shell command (`js <file>` or `js -c "<code>"`) to execute JavaScript code using the embedded engine.

---

### Phase 4: Node.js Compatibility Layer

This is a significant phase focused on bridging the gap between the JS engine and a full Node.js environment.

- [ ] **Node.js Built-in Modules:**
  - [ ] **`fs` Module:** Implement the Node.js `fs` module API using our VFS backend.
  - [ ] **`path` Module:** Implement the Node.js `path` module API.
  - [ ] **Other Core Modules:** Gradually implement other core modules (`os`, `events`, etc.).
- [ ] **`require()` Mechanism:** Implement a module loading system that can resolve and execute modules from the VFS.
- [ ] **`process` Object:** Create and manage a global `process` object with properties like `argv`, `env`, and `cwd`.
- [ ] **Event Loop:** Investigate how to simulate the Node.js event loop within the browser's single-threaded environment.

---

### Phase 5: Networking & Package Management

The final and most complex phase, enabling external communication and dependency management.

- [ ] **Virtualized TCP Network Stack:** Research and implement a virtualized network stack to handle TCP connections within the browser. This is crucial for running servers (e.g., `http.createServer`).
- [ ] **Package Fetching:** Implement logic to fetch package tarballs from the npm registry (e.g., `registry.npmjs.org`).
- [ ] **Package Installation:**
  - [ ] Implement tarball extraction into the VFS.
  - [ ] Develop the logic for resolving and installing package dependencies, simulating `npm`/`pnpm`/`bun`'s core functionality.
