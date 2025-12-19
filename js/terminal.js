// C# Console Simulator
// This script injects a fake terminal into the DOM

document.addEventListener('DOMContentLoaded', () => {
    createTerminal();
});

function createTerminal() {
    // 1. Create the Terminal Button
    const fab = document.createElement('button');
    fab.innerHTML = '>_ Console';
    fab.className = 'terminal-fab';
    fab.onclick = toggleTerminal;
    // Force LTR for the FAB button to ensure icon/text alignment
    fab.style.direction = 'ltr';
    fab.style.textAlign = 'left';
    document.body.appendChild(fab);

    // 2. Create the Terminal Window
    const termInfo = `
<div class="terminal-overlay" id="terminal-overlay" style="direction: ltr; text-align: left;">
    <div class="terminal-window">
        <div class="terminal-header">
            <div class="term-buttons">
                <span class="term-btn term-close"></span>
                <span class="term-btn term-min"></span>
                <span class="term-btn term-max"></span>
            </div>
            <div class="term-title">dotnet.exe - C# Interactive</div>
        </div>
        <div class="terminal-body" id="term-body">
            <div class="term-line">Microsoft (R) .NET Interactive Compiler</div>
            <div class="term-line">Copyright (C) Microsoft Corporation. All rights reserved.</div>
            <div class="term-line"><br></div>
            <div class="term-line">Type "help" for a list of commands.</div>
            <div class="term-input-line">
                <span class="prompt">C:\\Masterclass></span>
                <input type="text" class="term-input" id="term-input" autocomplete="off" spellcheck="false">
            </div>
        </div>
    </div>
</div>`;

    const div = document.createElement('div');
    div.innerHTML = termInfo;
    document.body.appendChild(div);

    // 3. Event Listeners
    const input = document.getElementById('term-input');
    const overlay = document.getElementById('terminal-overlay');

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            processCommand(input.value);
            input.value = '';
        }
    });

    document.querySelector('.terminal-overlay').addEventListener('click', (e) => {
        if (e.target === overlay) toggleTerminal();
    });
}

function toggleTerminal() {
    const overlay = document.getElementById('terminal-overlay');
    const input = document.getElementById('term-input');

    if (overlay.classList.contains('open')) {
        overlay.classList.remove('open');
    } else {
        overlay.classList.add('open');
        setTimeout(() => input.focus(), 100);
    }
}

function processCommand(cmd) {
    const body = document.getElementById('term-body');
    const inputLine = document.querySelector('.term-input-line');

    // Add old command to history
    const historyLine = document.createElement('div');
    historyLine.className = 'term-line';
    historyLine.innerHTML = `<span class="prompt">${fsState.currentDir}></span> ${escapeHtml(cmd)}`;
    body.insertBefore(historyLine, inputLine);

    // Process
    const output = getOutput(cmd.trim().toLowerCase());

    if (output) {
        const outLine = document.createElement('div');
        outLine.className = 'term-line term-output';
        outLine.innerHTML = output;
        body.insertBefore(outLine, inputLine);
    }

    // Auto scroll
    body.scrollTop = body.scrollHeight;
}

const replState = {
    variables: {}
};

// Mock File System State
const fsState = {
    currentDir: 'C:\\Masterclass',
    files: {
        'C:\\Masterclass': ['HelloWorld', 'DemoApp'],
        'C:\\Masterclass\\HelloWorld': ['Program.cs', 'HelloWorld.csproj', 'bin', 'obj'],
        'C:\\Masterclass\\DemoApp': ['Program.cs', 'DemoApp.csproj']
    }
};

// Helper for colors
const c = {
    keyword: 'color: #569cd6', // Blue
    string: 'color: #ce9178',  // Orange
    number: 'color: #b5cea8',  // Light Green
    comment: 'color: #6a9955', // Green
    func: 'color: #dcdcaa',    // Yellow
    control: 'color: #c586c0', // Purple
    text: 'color: #cccccc',    // Gray
    success: 'color: #4ec9b0', // Teal/Greenish
    error: 'color: #f44747',   // Red
    warn: 'color: #e3a936'     // Yellow/Orange
};

function getOutput(cmd) {
    if (!cmd) return '';
    const cleanCmd = cmd.trim(); // Case sensitive for C#, but we'll handle shell differently

    // 0. Update Prompt Logic (Helper)
    const updatePrompt = () => {
        const prompts = document.querySelectorAll('.prompt');
        prompts.forEach(p => p.textContent = fsState.currentDir + '>');
    };

    // --- SHELL COMMANDS (Case Insensitive mostly) ---
    const lowerCmd = cleanCmd.toLowerCase();

    // 1. Help
    if (lowerCmd === 'help') {
        return `Available commands:
  <span style="${c.func}">help</span>                      <span style="${c.comment}">// Show this list</span>
  <span style="${c.func}">clear</span> / <span style="${c.func}">cls</span>               <span style="${c.comment}">// Clear the screen</span>
  <span style="${c.func}">dir</span> / <span style="${c.func}">ls</span>                  <span style="${c.comment}">// List contents</span>
  <span style="${c.func}">cd</span> [dir]                  <span style="${c.comment}">// Change directory</span>
  <span style="${c.func}">mkdir</span> [name]              <span style="${c.comment}">// Create directory</span>
  <span style="${c.func}">dotnet new console</span>        <span style="${c.comment}">// Create new C# project</span>
  <span style="${c.func}">dotnet run</span>                <span style="${c.comment}">// Run the current project</span>
  <span style="${c.func}">dotnet build</span>              <span style="${c.comment}">// Build the current project</span>
  
  <span style="${c.control}">C# Interactive Mode:</span>
  <span style="${c.func}">Console</span>.<span style="${c.func}">WriteLine</span>(<span style="${c.string}">"text"</span>);
  <span style="${c.keyword}">int</span> x = <span style="${c.number}">10</span>;
  <span style="${c.keyword}">string</span> s = <span style="${c.string}">"Hello"</span>;
`;
    }

    // 2. Clear
    if (lowerCmd === 'clear' || lowerCmd === 'cls') {
        const body = document.getElementById('term-body');
        const lines = body.querySelectorAll('.term-line');
        lines.forEach(l => l.remove());
        return '';
    }

    // 3. Directory Listing (dir / ls)
    if (lowerCmd === 'dir' || lowerCmd === 'ls') {
        const files = fsState.files[fsState.currentDir] || [];
        if (files.length === 0) return 'Directory is empty.';

        // Window style dir output helper
        let out = '';
        files.forEach(f => {
            const isDir = f.indexOf('.') === -1; // Simple heuristic
            out += isDir ? `<span style="${c.keyword}">&lt;DIR&gt;</span>          ${f}\n` : `               ${f}\n`;
        });
        return `<pre>${out}</pre>`;
    }

    // 4. Change Directory (cd ...)
    if (lowerCmd.startsWith('cd ')) {
        const target = cleanCmd.substring(3).trim();

        if (target === '..') {
            const parts = fsState.currentDir.split('\\');
            if (parts.length > 1) {
                parts.pop();
                fsState.currentDir = parts.join('\\') || 'C:\\'; // Prevent empty
                updatePrompt();
                return '';
            }
            return ''; // Already at root
        }

        // Check if exists
        const currentPath = fsState.currentDir;
        const newPath = currentPath.endsWith('\\') ? currentPath + target : currentPath + '\\' + target;

        const currentFiles = fsState.files[currentPath] || [];
        if (currentFiles.includes(target)) {
            fsState.currentDir = newPath;
            updatePrompt();
            return '';
        }

        return `<span style="${c.error}">The system cannot find the path specified: ${escapeHtml(target)}</span>`;
    }

    // 5. Make Directory (mkdir ...)
    if (lowerCmd.startsWith('mkdir ')) {
        const target = cleanCmd.substring(6).trim();
        if (!target) return 'usage: mkdir [name]';

        if (!fsState.files[fsState.currentDir]) fsState.files[fsState.currentDir] = [];

        if (!fsState.files[fsState.currentDir].includes(target)) {
            fsState.files[fsState.currentDir].push(target);
            // Initialize empty folder
            const newPath = fsState.currentDir.endsWith('\\') ? fsState.currentDir + target : fsState.currentDir + '\\' + target;
            fsState.files[newPath] = [];
            return '';
        }
        return `<span style="${c.warn}">A subdirectory or file ${escapeHtml(target)} already exists.</span>`;
    }

    // 6. Dotnet commands
    if (lowerCmd === 'dotnet --version') return '8.0.100';

    if (lowerCmd.startsWith('dotnet new console')) {
        return `The template "Console App" was created successfully.
Processing post-creation actions...
Restoring <span style="${c.text}">${escapeHtml(fsState.currentDir)}\\Program.csproj</span>:
  Determining projects to restore...
  Restored <span style="${c.text}">${escapeHtml(fsState.currentDir)}\\Program.csproj</span> (in 150 ms).
<span style="${c.success}">Restore succeeded.</span>`;
    }

    if (lowerCmd.startsWith('dotnet build')) {
        return `Microsoft (R) Build Engine version 17.0.0+ for .NET
Copyright (C) Microsoft Corporation. All rights reserved.

  Determining projects to restore...
  All projects are up-to-date for restore.
  HelloWorld -> <span style="${c.text}">${escapeHtml(fsState.currentDir)}\\bin\\Debug\\net8.0\\HelloWorld.dll</span>

<span style="${c.success}">Build succeeded.</span>
    0 Warning(s)
    0 Error(s)
    
Time Elapsed 00:00:01.2`;
    }

    if (lowerCmd.startsWith('dotnet run')) {
        return `<span style="${c.success}">Build succeeded.</span>
    0 Warning(s)
    0 Error(s)

<span style="${c.text}">Hello World!</span>
<span style="${c.comment}">[SUCCESS] App executed normally.</span>`;
    }

    // --- C# INTERPRETER (Fallthrough) ---

    // Pattern: Console.WriteLine("...");
    const printMatch = cleanCmd.match(/^Console\.WriteLine\(\s*"(.*)"\s*\);?$/);
    if (printMatch) {
        return `<span style="${c.text}">${escapeHtml(printMatch[1])}</span>`;
    }

    // Pattern: Console.WriteLine(variable);
    const printVarMatch = cleanCmd.match(/^Console\.WriteLine\(\s*([a-zA-Z0-9_]+)\s*\);?$/);
    if (printVarMatch) {
        const varName = printVarMatch[1];
        if (replState.variables.hasOwnProperty(varName)) {
            return `<span style="${c.text}">${escapeHtml(replState.variables[varName])}</span>`;
        } else {
            return `<span style="${c.error}">error CS0103: The name '${escapeHtml(varName)}' does not exist in the current context</span>`;
        }
    }

    // Pattern: int x = 10;
    const intMatch = cleanCmd.match(/^int\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*([0-9]+);?$/);
    if (intMatch) {
        const varName = intMatch[1];
        const val = parseInt(intMatch[2]);
        replState.variables[varName] = val;
        return `<span style="${c.comment}">// ${varName} assigned <span style="${c.number}">${val}</span></span>`;
    }

    // Pattern: string s = "hello";
    const strMatch = cleanCmd.match(/^string\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*"(.*)";?$/);
    if (strMatch) {
        const varName = strMatch[1];
        const val = strMatch[2];
        replState.variables[varName] = val;
        return `<span style="${c.comment}">// ${varName} assigned <span style="${c.string}">"${escapeHtml(val)}"</span></span>`;
    }

    // Pattern: Variable evaluation (just 'x')
    if (cleanCmd.match(/^[a-zA-Z_][a-zA-Z0-9_]*$/)) {
        if (replState.variables.hasOwnProperty(cleanCmd)) {
            return `<span style="${c.text}">${escapeHtml(replState.variables[cleanCmd])}</span>`;
        }
    }

    // Unknown - Treat as error for both shell and Code
    if (/^[a-z]/.test(cleanCmd)) {
        return `'${escapeHtml(cleanCmd.split(' ')[0])}' is not recognized as an internal or external command,
operable program or batch file.`;
    }

    return `<span style="${c.error}">error CS0103: The name '${escapeHtml(cleanCmd)}' does not exist in the current context</span>`;
}

function escapeHtml(text) {
    if (!text) return text;
    return text.toString()
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
