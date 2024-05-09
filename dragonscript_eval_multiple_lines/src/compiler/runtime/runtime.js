export default class RunTime {
    constructor() {
        //console is a string buffer to receive output from print statement
        this.console = []
    }

    outputConsole = (content) => {
        this.console.push(content)
    }
}