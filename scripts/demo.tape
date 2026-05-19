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

# Intro
Type "# weave — multi-agent flows in TypeScript"
Sleep 700ms
Enter

# Show repo layout
Type "tree -L 2 -I 'node_modules|dist|*.sqlite'"
Sleep 400ms
Enter
Sleep 2.5s

# Show a flow definition
Type "bat --paging=never --style=plain examples/chat-router/src/index.ts | head -60"
Sleep 400ms
Enter
Sleep 4s

# Run the example
Ctrl+L
Type "ANTHROPIC_API_KEY=sk-...   pnpm --filter weave-example-chat-router start \"my invoice looks wrong\""
Sleep 500ms
Enter
Sleep 6s

# Open the trace UI in a second pane
Ctrl+L
Type "pnpm --filter @polymatx/weave-ui start --db ./weave.sqlite --port 4321"
Sleep 400ms
Enter
Sleep 3s

# Wrap
Ctrl+L
Type "open http://localhost:4321 # local trace dashboard"
Sleep 400ms
Enter
Sleep 2s
