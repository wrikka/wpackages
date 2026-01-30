function Enable-GitCompletion {
  [CmdletBinding()]
  param()

  $scriptBlock = {
    param($wordToComplete, $commandAst, $cursorPosition)

    $commandLine = $commandAst.Extent.Text

    if ($commandLine -like 'git *') {
      $suggestions = @('add', 'commit', 'push', 'pull')

      $suggestions | Where-Object { $_ -like "$wordToComplete*" } | ForEach-Object {
        [System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
      }
    }
  }

  Register-ArgumentCompleter -Native -CommandName 'git' -ScriptBlock $scriptBlock
}

function Install-ShellCompletions {
  [CmdletBinding()]
  param()

  Enable-GitCompletion
}

Export-ModuleMember -Function Install-ShellCompletions, Enable-GitCompletion
