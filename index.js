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
    const importantTODOs = []
    const usersTODOs = new Map()

    const todoRegex = /\/\/\s*TODO\s*(.*)/g;

    files.forEach(fileContent => {
        let match;
        while ((match = todoRegex.exec(fileContent)) !== null) {
            todos.push(match[1].trim());
            if (match[1].includes('!')) {
                importantTODOs.push(match[1].trim())
            }
            if (match[1].includes(';')) {
                const splitTODO = match[1].split(';')
                usersTODOs.set(splitTODO[0], [splitTODO[1].trim(), splitTODO[2].trim()])
            }
        }
    });

    return [todos, importantTODOs];
}

const todos = findTodosInFiles(files);


function processCommand(command) {
    switch (true) {
        case command === 'exit':
            process.exit(0);
            break;
        case command === 'show':
            console.log(todos[0].join('\n'));
            break;
        case command ==='important':
            console.log(todos[1].join('\n'));
            break;
        case /^user\s+\w+$/.test(command): {
            const username = command.split(' ')[1];
            console.log(todos[2].get(username)[1].join('\n'));
            break;
        }
    }
}

// TODO you can do it!
