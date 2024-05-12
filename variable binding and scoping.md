We have parsed the varaible declaration, now we need to know what kind of value that is binding with the given variable, let's check the test case first:

```js
 it("should bind variable to value that it is assigned to", () => {
        let code = `
           var a = 1+2*3+4;;
           print(a);
           var a = "hello";
           print(a);
           var c;
           print(c);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(3)
        expect(console[0]).toEqual(11)
        expect(console[1]).toEqual("hello")
        expect(console[2]).toEqual("null")
    })
```
According to the test case above, The intepreter need to remember what kind of value that are binding to the given variable currently, at it need to init an unassigned variable to null. We can do this by using
a map like object, run the test above and make sure it fail. Then we can add following code to make it pass, first we add code in Runtime:
```js
export default class RunTime {
    constructor() {
        //console its a string buffer to receive output from print
        this.console = []
        /*
        golbalEnv used to record the bindings for global variables
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

   ...
}
```

In above code, we define a map named globalEnv, it will used to remember the binding for global variable and its assigend value, when intepreter evaluate an assignment statement, it will call the bindGlobalVariable
method to save the assigned value with the given name of global variable, when there is code to reference a variable, the intepreter find the content of given variable with its name, if it can find the given global
variable in the map, there is an undefined error throw out.

In intepreter.js, we add following code:
```js
visitVarDeclarationNode = (parent, node) => {
        this.visitChildren(node)
        let assignedVal = node.evalRes
        const variableName = node.attributes.value

        if (assignedVal === undefined) {
            //variable declaration without assignment, init its value to null
            assignedVal = {
                type: "NIL",
                value: "null"
            }
        } 
        this.runTime.bindGlobalVariable(variableName, assignedVal)
        
        this.attachEvalResult(parent, node)
    }

visitPrimaryNode = (parent, node) => {
    ....
     switch (token.token) {
            case Scanner.IDENTIFIER:
                //get the binding value for given variable name
                const name = token.lexeme
                const val = this.runTime.getGlobalVariableVal(name)
                type = val.type 
                value = val.value 
            break
           ....
      }
    ....
}
```

In visitVarDeclarationNode, if there is assigment in the declaration of variable, then we can evaluate the result of the expression at the right of the equal symbol, if there is not assigment in the variable 
declaration, then the evaluated result should be undefined, then we can create a NIL value for the variable, then we call bindGlobalVariable to bind the assign value with the given variable name.

In VisistPrimaryNode, if the token for the given node is IDENTIFER, which means its referencing the value of a variable, then we can get the value of the given variable with its name and return to parent nodes. Run the code above and make sure the test case can be passed.
