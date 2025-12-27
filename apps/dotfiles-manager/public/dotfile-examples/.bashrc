# Example bashrc

export PATH="$PATH:$HOME/.local/bin"
alias ll='ls -la'
alias gs='git status'

# Custom prompt
PS1='\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '
