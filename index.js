const {getAllFilePathsWithExtension, readFile} = require('./fileSystem');
const {readLine} = require('./console');

const files = getFiles();

console.log('Please, write your command!');
readLine(processCommand);

function getFiles() {
    const filePaths = getAllFilePathsWithExtension(process.cwd(), 'js');
    return filePaths.map(path => readFile(path));
}

function findTodosInFiles(files) {
    const todos = [];

    const todoRegex = /\/\/\s*TODO\s*(.*)/g;

    files.forEach(fileContent => {
        let match;
        while ((match = todoRegex.exec(fileContent)) !== null) {
            todos.push(match[1].trim());
        }
    });

    return todos;
}

const todos = findTodosInFiles(files);

function processCommand(command) {
    switch (command) {
        case 'exit':
            process.exit(0);
            break;
        case 'show':
            console.log(todos.join(' '));
        default:
            console.log('wrong command');
            break;
    }
}

// TODO you can do it!
