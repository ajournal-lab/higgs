# Swap the Tailwind play-CDN (compiles in the browser at runtime) for the prebuilt stylesheet.
import re, sys
page, css = sys.argv[1], sys.argv[2]
s = open(page).read()
assert '<script src="https://cdn.tailwindcss.com"></script>' in s
s = s.replace('<script src="https://cdn.tailwindcss.com"></script>', '<style>' + open(css).read() + '</style>', 1)
s, n = re.subn(r'\s*<script>\s*tailwind\.config = \{.*?\n  </script>', '', s, count=1, flags=re.S)
assert n == 1, 'config block not found'
open(page, 'w').write(s); print('inlined', len(s))
