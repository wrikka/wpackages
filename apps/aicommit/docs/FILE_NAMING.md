# File Naming Conventions

## Suffix Rules

All files in the aicommit project must follow these suffix conventions:

### Core Files
- **Configuration files**: `.config.ts` (e.g., `app.config.ts`, `database.config.ts`)
- **Type definitions**: `.type.ts` (e.g., `user.type.ts`, `api.type.ts`)
- **Constants**: `.constants.ts` (e.g., `api.constants.ts`, `app.constants.ts`)

### Utility Files
- **Library functions**: `.lib.ts` (e.g., `validation.lib.ts`, `formatting.lib.ts`)
- **Utility functions**: `.util.ts` (e.g., `string.util.ts`, `date.util.ts`)

### Service Layer
- **Services**: `.service.ts` (e.g., `user.service.ts`, `auth.service.ts`)
- **Repositories**: `.repository.ts` (e.g., `user.repository.ts`, `base.repository.ts`)
- **Adapters**: `.adapter.ts` (e.g., `database.adapter.ts`, `api.adapter.ts`)

### Application Layer
- **Components**: `.component.ts` (e.g., `button.component.ts`, `modal.component.ts`)
- **Controllers**: `.controller.ts` (e.g., `user.controller.ts`)
- **CLI commands**: `.cli.ts` (e.g., `commit.cli.ts`, `config.cli.ts`)
- **Web handlers**: `.web.ts` (e.g., `api.web.ts`, `health.web.ts`)

### Error Handling
- **Custom errors**: `.error.ts` (e.g., `validation.error.ts`, `api.error.ts`)
- **Error handlers**: `.handler.ts` (e.g., `global-error.handler.ts`)

### Testing
- **Unit tests**: `.test.ts` (e.g., `user.service.test.ts`)
- **Integration tests**: `.integration.test.ts`
- **E2E tests**: `.e2e.test.ts`

### Tools and Scripts
- **Tools**: `.tool.ts` (e.g., `migration.tool.ts`, `build.tool.ts`)
- **Scripts**: `.script.ts` (e.g., `deploy.script.ts`, `setup.script.ts`)

## Naming Rules

1. **Use lowercase kebab-case**: All file names must be in lowercase with hyphens separating words
2. **Be descriptive**: File names should clearly indicate their functionality
3. **Use appropriate suffix**: Always use the correct suffix for the file type
4. **Index files**: Use `index.ts` for barrel exports in directories

## Examples

✅ **Correct:**
- `user-auth.service.ts`
- `string-manipulation.util.ts`
- `database-connection.config.ts`
- `validation-error.handler.ts`

❌ **Incorrect:**
- `userService.ts` (missing hyphens)
- `utils.ts` (too generic, missing suffix)
- `UserAuth.ts` (camelCase instead of kebab-case)
- `user-auth-helper.ts` (non-standard suffix)

## Directory Structure

```
src/
├── types/
│   ├── config.type.ts
│   └── index.ts
├── constants/
│   ├── app.constants.ts
│   └── index.ts
├── lib/
│   ├── string-manipulation.util.ts
│   ├── validation.util.ts
│   └── index.ts
├── services/
│   ├── llm.service.ts
│   ├── config.service.ts
│   ├── git.service.ts
│   └── index.ts
├── error/
│   ├── custom-error.ts
│   └── index.ts
└── config/
    ├── app.config.ts
    └── index.ts
```
