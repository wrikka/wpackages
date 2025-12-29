@{
  RootModule = 'ShellCompletions.psm1'
  ModuleVersion = '0.1.0'
  GUID = '3f4a87c6-4ff6-4b7a-8d44-ef2c3b70a9f8'
  Author = 'wpackages'
  CompanyName = 'wpackages'
  Copyright = ''
  Description = 'Shell completions (Fig-like) for Windows PowerShell'
  PowerShellVersion = '7.0'
  FunctionsToExport = @('Install-ShellCompletions','Enable-GitCompletion')
  CmdletsToExport = @()
  AliasesToExport = @()
}
