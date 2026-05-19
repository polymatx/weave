# VHS tape for the weave README demo GIF.
# Render with: vhs scripts/demo.tape
# https://github.com/charmbracelet/vhs

Output docs/assets/demo.gif

Set FontSize 18
Set Width 1400
Set Height 820
Set Theme "Catppuccin Mocha"
Set TypingSpeed 30ms
Set PlaybackSpeed 1.0
Set Padding 24
Set Margin 0

# Start from a clean prompt
Hide
Type `PS1='$ ' && export PS1` Enter
Type "clear" Enter
Show
Sleep 600ms

# Show the project layout
Type "tree -L 2 -I 'node_modules|dist|.astro|*.sqlite|pagefind|_astro|coverage|.git'"
Enter
Sleep 4s

Hide
Type "clear" Enter
Show

# Peek at an actual flow definition with syntax highlighting
Type "bat --paging=never --style=numbers,grid --line-range=20:60 examples/chat-router/src/index.ts"
Enter
Sleep 6s

Hide
Type "clear" Enter
Show

# Seed synthetic trace data so the UI has something to show
Type "node scripts/seed-traces.mjs /tmp/weave-demo.sqlite"
Enter
Sleep 1.5s

# Start the trace dashboard
Type "node packages/ui/dist/cli.js --db /tmp/weave-demo.sqlite --port 4321 &"
Enter
Sleep 2s

# Prove the dashboard sees the runs
Type "curl -s http://localhost:4321/api/runs | jq '.[0]'"
Enter
Sleep 3s

Hide
Type "kill %1 2>/dev/null" Enter
Show
Sleep 400ms

Type "# open http://localhost:4321 for the visual dashboard"
Sleep 1.2s
Enter
Sleep 800ms
