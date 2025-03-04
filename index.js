const { getAllFilePathsWithExtension, readFile } = require('./fileSystem');
const { readLine } = require('./console');

const files = getFiles();
const todos = findTodosInFiles(files);

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function parseTodo(rawText) {
    const todo = {
        text: rawText,
        important: rawText.includes('!'),
        user: null,
        date: null,
        markCount: getMarkCount(rawText)
    };
    if (rawText.includes(';')) {
        const parts = rawText.split(';');
        if (parts.length >= 3) {
            todo.user = parts[0].trim();
            todo.date = parts[1].trim();
            todo.text = parts.slice(2).join(';').trim();
        }
    }
    return todo;
}

function findTodosInFiles(files) {
    const todos = [];
    const todoRegex = /\/\/\s*TODO\s*(.*)/g;
    files.forEach(fileContent => {
        let match;
        while ((match = todoRegex.exec(fileContent)) !== null) {
            const rawText = match[1].trim();
            const todo = parseTodo(rawText);
            todos.push(todo);
        }
    });
    return todos;
}

function getMarkCount(str) {
    const matches = str.match(/!/g);
    return matches ? matches.length : 0;
}

function formatCell(text, width) {
    text = text || '';
    if (text.length > width) {
        return text.slice(0, width - 3) + '...';
    }
    return text.padEnd(width, ' ');
}

function printTodos(todosArray) {
    if (todosArray.length === 0) {
        console.log('No TODOs found.');
        return;
    }
    todosArray.forEach(todo => {
        const col1 = formatCell(todo.important ? '!' : '', 1);
        const col2 = formatCell(todo.user, 10);
        const col3 = formatCell(todo.date, 10);
        const col4 = formatCell(todo.text, 50);
        console.log(`${col1}  |  ${col2}  |  ${col3}  |  ${col4}`);
    });
}

function parseInputDate(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 1) {
        return new Date(dateStr + "-01-01");
    } else if (parts.length === 2) {
        return new Date(dateStr + "-01");
    } else {
        return new Date(dateStr);
    }
}

function parseTodoDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split("-");
    if (parts.length === 1) {
        return new Date(dateStr + "-01-01");
    } else if (parts.length === 2) {
        return new Date(dateStr + "-01");
    } else {
        return new Date(dateStr);
    }
}

function processCommand(command) {
    const trimmedCommand = command.trim();
    if (trimmedCommand === 'exit') {
        process.exit(0);
    } else if (trimmedCommand === 'show') {
        printTodos(todos);
    } else if (trimmedCommand === 'important') {
        const importantTodos = todos.filter(todo => todo.important)
            .sort((a, b) => b.markCount - a.markCount);
        printTodos(importantTodos);
    } else if (/^user\s+\w+$/i.test(trimmedCommand)) {
        const parts = trimmedCommand.split(/\s+/);
        const username = parts[1].toLowerCase();
        const userTodos = todos.filter(todo => todo.user && todo.user.toLowerCase() === username);
        printTodos(userTodos);
    } else if (/^sort\s+\w+$/i.test(trimmedCommand)) {
        const parts = trimmedCommand.split(/\s+/);
        const flag = parts[1].toLowerCase();
        switch (flag) {
            case 'importance': {
                const importantTodos = todos.filter(todo => todo.important)
                    .sort((a, b) => b.markCount - a.markCount);
                const normalTodos = todos.filter(todo => !todo.important);
                printTodos([...importantTodos, ...normalTodos]);
                break;
            }
            case 'user': {
                const userMap = new Map();
                const noUser = [];
                todos.forEach(todo => {
                    if (todo.user) {
                        const userKey = todo.user;
                        if (!userMap.has(userKey)) {
                            userMap.set(userKey, []);
                        }
                        userMap.get(userKey).push(todo);
                    } else {
                        noUser.push(todo);
                    }
                });
                userMap.forEach((userTodos, userName) => {
                    console.log(`--- ${userName} ---`);
                    printTodos(userTodos);
                });
                if (noUser.length > 0) {
                    console.log('--- No user ---');
                    printTodos(noUser);
                }
                break;
            }
            case 'date': {
                const withDate = todos.filter(todo => todo.date);
                const withoutDate = todos.filter(todo => !todo.date);
                withDate.sort((a, b) => Date.parse(b.date) - Date.parse(a.date));
                printTodos([...withDate, ...withoutDate]);
                break;
            }
            default:
                console.log('Unknown sort flag. Use: importance, user or date.');
        }
    } else if (/^date\s+\d{4}(-\d{2})?(-\d{2})?$/i.test(trimmedCommand)) {
        const parts = trimmedCommand.split(/\s+/);
        const inputDate = parseInputDate(parts[1]);
        const filteredTodos = todos.filter(todo => {
            if (!todo.date) return false;
            const todoDate = parseTodoDate(todo.date);
            return todoDate > inputDate;
        });
        printTodos(filteredTodos);
    } else {
        console.log('Wrong command');
    }
}
