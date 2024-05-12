export default class RunTime {
    constructor() {
        //console is a string buffer to receive output from print statement
        this.console = []
        /*
        globalEnv is used to record the binding of global variable
        */
        this.globalEnv = {}
    }

    bindGlobalVariable = (name, value) => {
        this.globalEnv[name] = value
    }

    getGlobalVariableVal = (name) => {
        if (this.globalEnv[name] === null) {
            throw new Error(`undefined global variable with name ${name}`)
        }

        return this.globalEnv[name]
    }

    outputConsole = (content) => {
        this.console.push(content)
    }
}