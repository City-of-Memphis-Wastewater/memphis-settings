import sys
from rich.console import Console

output = sys.argv[1]

with open("stdout.txt", encoding="utf-8") as f:
    text = f.read()

console = Console(record=True, width=120, force_terminal=True)
console.print(text, end="")
console.save_svg(output, title="memphis-settings --help")
