export const generateBashCompletion = (): string => {
	return `_wenv_completion() {
	local cur prev words cword
	_init_completion || return

	case $prev in
		--env|--schema|--example-output)
			_filedir
			return
			;;
		--output)
			COMPREPLY=($(compgen -W "json dotenv" -- "$cur"))
			return
			;;
	esac

	if [[ "$cur" == -* ]]; then
		COMPREPLY=($(compgen -W "
			--help -h
			--env
			--no-expand
			--override
			--output
			--schema
			--validate
			--generate-example
			--example-output
		" -- "$cur"))
	else
		_filedir -d
	fi
}

complete -F _wenv_completion wenv
`;
};

export const generateZshCompletion = (): string => {
	return `#compdef wenv

_wenv() {
	local -a commands

	_arguments -C \\
		'(--help -h)'{--help,-h}'[Show help]' \\
		'--env=[Set NODE_ENV]:environment:(development production test)' \\
		'(--no-expand)--no-expand[Disable variable expansion]' \\
		'--override[Write values into process.env]' \\
		'--output=[Output format]:format:(json dotenv)' \\
		'--schema=[Path to schema file]:file:_files' \\
		'--validate[Validate env variables against schema]' \\
		'--generate-example[Generate .env.example file]' \\
		'--example-output=[Output path for .env.example]:file:_files' \\
		'*:: :->paths'

	case $state in
		paths)
			_paths -/
			;;
	esac
}

_wenv "$@"
`;
};

export const generateFishCompletion = (): string => {
	return `complete -c wenv -f

complete -c wenv -l help -s h -d 'Show help'
complete -c wenv -l env -d 'Set NODE_ENV' -x
complete -c wenv -l no-expand -d 'Disable variable expansion'
complete -c wenv -l override -d 'Write values into process.env'
complete -c wenv -l output -d 'Output format' -x -a 'json dotenv'
complete -c wenv -l schema -d 'Path to schema file' -r
complete -c wenv -l validate -d 'Validate env variables'
complete -c wenv -l generate-example -d 'Generate .env.example'
complete -c wenv -l example-output -d 'Output path for .env.example' -r
`;
};

export const generatePowerShellCompletion = (): string => {
	return `Register-ArgumentCompleter -Native -CommandName wenv -ScriptBlock {
	param($wordToComplete, $commandAst, $cursorPosition)

	$options = @(
		'--help', '-h'
		'--env'
		'--no-expand'
		'--override'
		'--output'
		'--schema'
		'--validate'
		'--generate-example'
		'--example-output'
	)

	$previousWord = $commandAst.CommandElements[-1].Extent.Text

	switch ($previousWord) {
		'--env' {
			$suggestions = @('development', 'production', 'test')
			break
		}
		'--output' {
			$suggestions = @('json', 'dotenv')
			break
		}
		default {
			$suggestions = $options | Where-Object { $_ -like "$wordToComplete*" }
		}
	}

	$suggestions | ForEach-Object {
		[System.Management.Automation.CompletionResult]::new($_, $_, 'ParameterValue', $_)
	}
}
`;
};

export const getCompletionScript = (shell: "bash" | "zsh" | "fish" | "powershell"): string => {
	switch (shell) {
		case "bash":
			return generateBashCompletion();
		case "zsh":
			return generateZshCompletion();
		case "fish":
			return generateFishCompletion();
		case "powershell":
			return generatePowerShellCompletion();
	}
};
