# VHS tape for the weave README demo GIF.
# Render with: vhs scripts/demo.tape -o docs/assets/demo.gif
# https://github.com/charmbracelet/vhs

Output docs/assets/demo.gif

Set FontSize 16
Set Width 1280
Set Height 760
Set Theme "Catppuccin Mocha"
Set TypingSpeed 35ms
Set PlaybackSpeed 1.0

# Intro banner
Type "echo '# weave — multi-agent flows in TypeScript'"
Sleep 400ms
Enter
Sleep 1.5s

# Show repo layout
Type "tree -L 2 -I 'node_modules|dist|.astro|*.sqlite|pagefind|_astro|coverage'"
Sleep 400ms
Enter
Sleep 3s

Ctrl+L

# Peek at a flow definition
Type "bat --paging=never --style=plain --line-range=20:70 examples/chat-router/src/index.ts"
Sleep 400ms
Enter
Sleep 5s

Ctrl+L

# Seed synthetic trace data so the UI has something to show
Type "node scripts/seed-traces.mjs /tmp/weave-demo.sqlite"
Sleep 300ms
Enter
Sleep 2s

# Start the trace dashboard
Type "node packages/ui/dist/cli.js --db /tmp/weave-demo.sqlite --port 4321 &"
Sleep 300ms
Enter
Sleep 1.5s

Ctrl+L

Type "open http://localhost:4321  # local trace dashboard"
Sleep 300ms
Enter
Sleep 2s
