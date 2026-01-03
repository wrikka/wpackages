# This script registers the argument completer for native commands.

$scriptBlock = {
    param(
        $wordToComplete,
        $commandAst,
        $cursorPosition
    )

    # Get the full command line text
    $commandLine = $commandAst.Extent.Text

    # In a real implementation, we would transpile and run the TS completer.
    # For now, we'll just simulate it for 'git'.
    if ($commandLine -like 'git *') {
        # This is where we would call our node script:
        # $suggestions = node C:\path\to\completer.js $commandLine

        # Dummy suggestions for now
        $suggestions = @('add', 'commit', 'push', 'pull')

        $suggestions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
            [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
        }
    }
}

# Register for a common native command, e.g., 'git'
Register-ArgumentCompleter -Native -CommandName 'git' -ScriptBlock $scriptBlock

Write-Host "✅ Shell completions installed for 'git'. Restart your terminal to apply."
