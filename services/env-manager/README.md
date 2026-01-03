# env-manager

CLI: `wenv`

Build:

```bash
bun run build
```

Usage:

```bash
# read from current folder (default path ".")
wenv

# read from one or more paths
wenv . ./apps/program

# set environment name
wenv --env production

# output as dotenv
wenv --output dotenv
```
