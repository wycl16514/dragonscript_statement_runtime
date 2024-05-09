We need to handle multiple lines of code now, for multiple expressions like following:

```js
1+2;
3*4;
```

We can evaluate them one by one and return the last one as the evaluation result, that is the final result of evaluate above code is {type:"number", value:12}, that's the case for most programming language.But 
for multiple lines of print statement, it is not appropriate to return the evaluation of the last line. Actually statements have some kind of "side effects", that is they will cause changes to its runtime 
eiviroment. For example a print statement lie print("hello"); will cause a string of "hello" to print out.

In order to refelct such effects, we need to create a virtual enviroment for our laugange to affect. For example we can create a Runtime Object, and there is a console in it, everytime we evaluate a print statement,
there should be a string "print" into the console,  let's create a runtime object for this, create a new foleder name runtime, and create a file name runtime.js, and have the following code:
```js
export default class RunTime {
    constructor() {
        //console its a string buffer to receive output from print
        this.console = []
    }

    outputConsole = (content) => {
        //add the content to console buffer
        this.console.push(content)
    }
}
```
The RunTime object above is quit simple, it only has a string buffer named console, and the outputConsole method just push some stuff inside it. In Intepreter, we created a Runtime object and prepare to put contents
from print statement to the console buffer of Runtime Object. In Intepreter.js we add the following code:
```js
import RunTime from "../runtime/runtime"
export default class Intepreter {
    constructor() {
        this.runTime = new RunTime();
    }
 ...
}
```
Before we do the real stuff, we add the test case first:
```js
it("should output content in print to console of runtime", () => {
        let code = `print(1+2*3+4);
        print("hello");
        print("world");
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        assert.equal(console.length, 3)
        assert.equal(console[0], 11)
        assert.equal(console[1], "hello")
        assert.equal(console[2], "world")
    })
```
Run the test and make sure it fail, before we add code to handle it, let's look for the parsing tree with multiple lines of print statement by using following command:
```
recursiveparsetree print(1+2*3+4);print("hello"); print("world!");
```
Then we get the following parsing tree:

![截屏2024-05-09 12 38 08](https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/61fae6a9-1bd1-4df2-a41b-15b4c7678511)

Oh, there seems to something wrong, we have three statements, but we have only two branches which means we can only evaluate the first two statements, the problem lies in the statementRecursive method,
I forgot to loop back to statement at the end of the methond, in order to make our parsing tree look better, we change the grammar a little bit like following:

program -> statement_recursive
statement_recursive -> EOF | statement statement_recursive

then the code will changes like following:
```js
    program = (parent) => {
        const programNode = this.createParseTreeNode(parent, "program")
        this.statementRecursive(programNode)
        parent.children.push(programNode)
    }

    statementRecursive = (parent) => {
        const stmtRecursiveNode = this.createParseTreeNode(parent, "statement_recursive")
        parent.children.push(stmtRecursiveNode)

        const token = this.matchTokens([Scanner.EOF])
        if (token) {
            stmtRecursiveNode.attributes = {
                value: "EOF",
            }
            //end of code
            return
        }
        this.statement(stmtRecursiveNode)
        //loop back to statement_recursive
        this.statementRecursive(stmtRecursiveNode)
    }

 statement = (parent) => {
        const stmtNode = this.createParseTreeNode(parent, "statement")
        //statement -> print_stmt

        let token = this.matchTokens([Scanner.PRINT])
        if (token) {
            this.advance()
            this.printStmt(stmtNode)
            parent.children.push(stmtNode)
            return
        }

        //stmt -> expression SEMI
        this.expression(stmtNode)
        token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("statement miss matching SEMICOLON")
        }
        //advance over the SEMICOLON
        this.advance()
        parent.children.push(stmtNode)
    }

```

Now run the command again to check the parsing tree:

![截屏2024-05-09 13 46 53](https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/03800d8c-f32d-4979-bb89-6bd6e43066e1)

By looking at the parsing tree we can see there are three parallel lines each one is conresponding to one print statement, then we can throw the content in the print statement into the console buffer of the runtime
object, then we can satisfy the test case above, therefore we have the following code:
```js
visitPrintStatementNode = (parent, node) => {
        this.visitChildren(node)
        const exprEval = node.children[0].evalRes
        node.evalRes = {
            type: "print",
            value: exprEval.value,
        }

        //put the print content to console of run time
        this.runTime.outputConsole(exprEval.value)

        this.attachEvalResult(parent, node)
    }
```
Now run the test command again and finally we can make sure the newly added test case can be passed.

