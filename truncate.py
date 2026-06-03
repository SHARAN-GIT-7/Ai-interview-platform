import os

filepath = r'c:\Intervista Project\Ai-interview-platform\src\pages\verbal-test\Results.jsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

idx = next((i for i, l in enumerate(lines) if 'return <div className="min-h-screen bg-[#EAF0F0]" />;' in l), -1)

if idx != -1:
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(lines[:idx+2])
        f.write('\nexport default Results;\n')
    print("Truncated successfully")
else:
    print("Could not find target line")
