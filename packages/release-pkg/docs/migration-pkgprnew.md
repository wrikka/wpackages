# Migration Guide: from pkg.pr.new

Migrating from `pkg.pr.new` to `@wpackages/release-pkg` is straightforward. The process involves uninstalling the `pkg.pr.new` GitHub App and updating your CI workflow.

## Step 1: Uninstall the `pkg.pr.new` GitHub App

1. Go to your repository's **Settings** page.
2. Navigate to **Integrations & webhooks** > **GitHub Apps**.
3. Find the `pkg.pr.new` app and click **Configure**.
4. Scroll down and click **Uninstall**.

## Step 2: Update Your CI Workflow

In your GitHub Actions workflow file (e.g., `.github/workflows/preview.yml`), you will replace the `pkg-pr-new` command with the `wrelease` command.

### Before (`pkg.pr.new`)

Your old workflow step probably looked something like this:

```yaml
- name: Publish Preview
  run: npx pkg-pr-new publish
```

### After (`@wpackages/release-pkg`)

Update the step to use `wrelease preview`. You also need to ensure `GITHUB_TOKEN` is passed to the environment so the tool can post comments to the pull request.

```yaml
- name: Install dependencies
  run: bun install

- name: Publish Preview
  run: bunx wrelease preview
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    # Add NPM_TOKEN if you want to publish to the npm registry
    # NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```

That's it! `@wpackages/release-pkg` will now handle the preview release process, offering more features and flexibility.
