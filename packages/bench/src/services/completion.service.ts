const BASH_COMPLETION = `
_wbench_complete() {
    local cur prev words cword
    _get_comp_words_by_ref -n : cur prev words cword

    if [[ "${cword}" -eq 1 ]]; then
        COMPREPLY=($(compgen -W "run compare completion --help" -- "${cur}"))
        return 0
    fi

    local command="${words[1]}"
    case "${command}" in
        run)
            COMPREPLY=($(compgen -W "--warmup --runs --concurrency --prepare --cleanup --shell --output --export --html-report --config --parameter-scan --verbose --silent --help" -- "${cur}"))
            ;;
        compare)
            COMPREPLY=($(compgen -W "--threshold --help" -- "${cur}"))
            ;;
        *)
            COMPREPLY=()
            ;;
    esac
}

complete -F _wbench_complete wbench
`;

const ZSH_COMPLETION = `
#compdef wbench

_wbench() {
    local -a commands
    local -a options

    commands=(
        'run:Run a new benchmark'
        'compare:Compare a result file against a baseline'
        'completion:Generate shell completion script'
        '--help:Show help message'
    )

    _arguments -C \
        '1: :->command' \
        '*:: :->args'

    case $state in
        command)
            _describe 'command' commands
            ;;
        args)
            case $words[1] in
                run)
                    options=(
                        '--warmup:Number of warmup runs'
                        '--runs:Number of benchmark runs'
                        '--concurrency:Parallel processes per iteration'
                        '--prepare:Command to run before each benchmark'
                        '--cleanup:Command to run after each benchmark'
                        '--shell:Shell to use'
                        '--output:Output format (text, table, chart, json)'
                        '--export:Export results to JSON file'
                        '--html-report:Generate an interactive HTML report'
                        '--config:Specify a path to a config file'
                        '--parameter-scan:Scan a parameter (e.g., "size:10,20,30")'
                        '--verbose:Verbose output'
                        '--silent:Silent mode'
                        '--help:Show help message'
                    )
                    _describe 'option' options
                    ;;
                compare)
                    options=(
                        '--threshold:Set the regression threshold'
                        '--help:Show help message'
                    )
                    _describe 'option' options
                    ;;
            esac
            ;;
    esac
}

_wbench "$@"
`;

const FISH_COMPLETION = `
complete -c wbench -n "__fish_wbench_no_subcommand" -a run -d "Run a new benchmark"
complete -c wbench -n "__fish_wbench_no_subcommand" -a compare -d "Compare results"
complete -c wbench -n "__fish_wbench_no_subcommand" -a completion -d "Generate completion script"

# Run command options
complete -c wbench -p run -l warmup -d "Number of warmup runs"
complete -c wbench -p run -l runs -d "Number of benchmark runs"
complete -c wbench -p run -l concurrency -d "Parallel processes"
complete -c wbench -p run -l prepare -d "Prepare command"
complete -c wbench -p run -l cleanup -d "Cleanup command"
complete -c wbench -p run -l shell -d "Shell to use"
complete -c wbench -p run -l output -d "Output format"
complete -c wbench -p run -l export -d "Export to file"
complete -c wbench -p run -l html-report -d "Generate HTML report"
complete -c wbench -p run -l config -d "Config file path"
complete -c wbench -p run -l parameter-scan -d "Scan a parameter"
complete -c wbench -p run -l verbose -d "Verbose output"
complete -c wbench -p run -l silent -d "Silent mode"

# Compare command options
complete -c wbench -p compare -l threshold -d "Regression threshold"
`;

export const getCompletionScript = (shell: string): string => {
	switch (shell) {
		case "bash":
			return BASH_COMPLETION;
		case "zsh":
			return ZSH_COMPLETION;
		case "fish":
			return FISH_COMPLETION;
		default:
			return `echo "Unsupported shell: ${shell}. Supported shells are bash, zsh, fish."`;
	}
};
