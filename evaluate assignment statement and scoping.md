We have enable the parsing of assignment statement, now let's see how to execute or evaluate the assignment statement, first we give out the test case like following:
```js
it("should evaluate assignment statement", () => {
        let code = `
            var a = 1+2*3+4;
            print(a);
            a = "hello";
            print(a);
            var b;
            a = b = "world";
            print(a);
            print(b);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(4)
        expect(console[0]).toEqual(11)
        expect(console[1]).toEqual("hello")
        expect(console[2]).toEqual("world")
        expect(console[3]).toEqual("world")
    })
```
Runt the test and make sure it fail, then we can goto intepreter.js to add the method of visitAssignmentNode like following:
```js
  visitAssignmentNode = (parent, node) => {
        this.visitChildren(node)
        if (node.attributes) {
            const name = node.attributes.value
            const val = node.evalRes
            this.runTime.bindGlobalVariable(name, val)
        }
        this.attachEvalResult(parent, node)
    }
```
The code for this.visitChildren(node) will evaluate the result at the right of equal sign, then we get the variable name from  node.attributes.value, and bind the evaluation result from the right of equal sign
to the given variable in the enviroment object, run the test again after completing above code and make sure it can be passed.

Let's try more test for variable assignment like following:
```
 it("should enable assigned variable in arithmetic expression", () => {
        let code = `
        var a = 1;
        var b = 2;
        var c = a+b;
        print(c);
       
    `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(1)
        expect(console[0]).toEqual(3)

    })
```
Actually we don't need to do anything and the test case above can passed automatically, let's try expression with different variable of different type like following:
```
 it("should enable assigned variable in string expression", () => {
        let code = `
        var a = "hello";
        var b = ",world";
        var c = a+b;
        print(c);
       
    `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(1)
        expect(console[0]).toEqual("hello,world")

    })

    it("should enable assigned variable in string expression", () => {
        let code = `
        var a = 3;
        var b = "hello";
        var c = a+b;
        var d = a * b;
        print(c);
        print(d);
       
    `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(2)
        expect(console[0]).toEqual("3hello")
        expect(console[1]).toEqual("hellohellohello")
    })

 it("should throw exception when assign to undefined variable", () => {
        let code = `
         a = 1234;
     `
        let codeToParse = () => {
            createParsingTree(code)
            let intepreter = new Intepreter()
            root.accept(intepreter)
        }
        expect(codeToParse).toThrow()
    })
```
It turns out cases at aboved can passed too, which shows the robust of our evaluator and parser!

Variables have scope, for example for the following code, we defined two variable with the same name but they can bind to different value:
```js
{
var a = "hello";
print(a); //"hello"
}

{
var a = "world";
print(a); //"world"
}
```
Most language support variables nesting and shadowing, for example :
```js
var a = 1;
print(a); // 1
{
    var a = 2;
    print(a); //2
}
print(a) //1 again
```

we may make it a little be complcated, like js, var used to define global variable, and let used to defined local variable like following:
```js
print(a);// error, undefined
{
    var a = 1;
    let b = 2;
}
print(a); //ok
print(b); //undefined
```
In order to achive above variable scoping,we can use the globalEnv for binding variable defined by using var, and we need some ways to accommodate the scoping for variables defined by let keyword. Because varaible defined by keyword let has local scoping, which means we can't put it in globalEnv, we need to create local 
enviroment for it, at the same time, we need to pay attention to the situation of nesting scope like following:
```js
{
   let a = 1;
   {
       let b = 2;
       {
           let c = 3;
           print(a);// it is ok
       }
       print(c); //error
   }
}
```
we can see from above code, for the deepest scope where variable c is in, we can reference variable defined at the outer scope, how can we handle this by using
local enviroment? The solution is we need to define the local enviroment in a way of stack like following:

localEnv:[{a: 1}, {b:2}, {c:3} ]

The deepest scope conrresponding to the enviroment object at the top of stack, when referencing variable in current scope, we begin searching the variable in 
enviroment stack at the top of localEvn stack, if we can't find the given variable, then we go to search it from the enviroment object at lower level, if we
still can't find it, we go down the layer until the bottom of localEnv stack, if we still can't find the given variable, we search it at global enviroment,
if we fail to find the variable in global enviroment, then we can be sure we are referencing an undefined varialbe.

We will handle the scoping problem case by case, let's define the grammar for statement scoping first, as you have seen above, we use braces { and } to define
the beginning and ending of a statment scope, then we can use the following grammar rules to define a statement scope:

statement -> expression | print_stmt | block
block -> LEFT_BRACE declaration_recursive LEFT_BRACE

Let's add a test case for parsing statement block first:
```js
it("should enable parsing statement block", ()=> {
        let code = `
            {
                var a = 1;
                {
                    var b = 2;
                }
            }

            {
                var c = 3;
            }
        `
        let root = createParsingTree(code)
        expect(root).not.toBeNull()
    })
```
Run the case and make sure it fail, then we add code in parser to make it passes as following:
```js
statement = (parent) => {
   ...
     //statement -> block
        //block -> LEFT_BRACE declaration_recursive RIGHT_BRACE
        token = this.matchTokens([Scanner.LEFT_BRACE])
        if (token) {
            parent.children.push(stmtNode)
            //over the left brace
            this.advance()
            this.block(stmtNode)
            if (!this.matchTokens([Scanner.RIGHT_BRACE])) {
                throw new Error("Missing right brace for block")
            }
            //over the right brace
            this.advance()
            return
        }
    ....
}

 block = (parent) => {
        const blockNode = this.createParseTreeNode(parent, "block")
        parent.children.push(blockNode)
        this.declarationRecursive(blockNode)
    }

 declarationRecursive = (parent) => {
        //stop parsing when we see the right brace which means its end of a block
        if (this.matchTokens([Scanner.RIGHT_BRACE])) {
            //return on end of block
            return
        }
        ....
    }
addAcceptForNode = (parent, node) => {
    switch (node.name) {
    ....
      case "block":
                node.accept = (visitor) => {
                    visitor.visitBlockNode(parent, node)
                }
                break
    ....
}
```
Then we need to add visit method in tree adjustment visitor:
```js
 visitBlockNode = (parent, node) => {
        this.visitChildren(node)
    }
```
After adding the above code, run test again and make sure the newly added test case can be passed. Now we have block statement, then we can enable the declaration
of local variable, like js, the keyword let will used to define variable with local scoping, let's see a test case:
```js
 it("variable declared by let should have local scoping", () => {
        let code = `
            var a = 1;
            let b = 3;
            {
                let a = 2;
                print(a);
            }
            print(a);
            print(b);
        `

        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(3)
        expect(console[0]).toEqual(2)
        expect(console[1]).toEqual(1)
        expect(console[2]).toEqual(3);
    })
```
In above case, we defined two variables with the same name a, the first one is defined using var and it is a global variable, and the second a is defined
in a block and when referencing it, we should get its value that is binding in the local not the value defined outside the local block, therefore the print(a)
in the block should give value of 2 instead of 1.

when the code leave the block, variable a return to the binding with the var declaration, then its value turns to 1 when execute the print statement outside the block,
finally even the variable b is declared by using let, since it is not within any scope, we still see it as a global variable. Run the test and make sure the case fail.

In order to satisy the case ,we first go to parser:

```js

```
Then in intepreter, when it is visiting a block node, it generates a local enviroment, any variables declared by using let will bind in the local variable, when
come out from the block element, the intepreter remove the local enviroment, therefore we add code to run time like following:
```js
 declarationRecursive = (parent) => {
     ...
      //if the current token is var, let  goto var_decl
        token = this.matchTokens([Scanner.VAR, Scanner.LET])
        if (token) {
            //declaration_recursive -> var_decl  declaration_recursive
            //save the keyword to VarDecl
            this.varDecl(declNode)
        } else {
            //declaration_recursive -> statement declaration_recursive
            this.statement(declNode)
        }
    ...
}

varDecl = (parent) => {
        const varDeclNode = this.createParseTreeNode(parent, "var_decl")
        parent.children.push(varDeclNode)
        //attach the declaration keyword
        varDeclNode.token = this.getToken()
        //go over the declaration keyword
        this.advance()
        ...
}
```
In above code, when in declarationRecursive, we keep the declaration key word and we can check the varaible is declared by var or let at the run time. In next step,
we goto runtime for adding new code:
```js
export default class RunTime {
    constructor() {
        //console its a string buffer to receive output from print
        this.console = []
        /*
        golbalEnv used to record the bindings for global variables
        */
        this.globalEnv = {}

        /*
        if variables that are declared by let in the out most , then 
        it should put into global envivroment
        */
        this.localEnv = [this.globalEnv]
    }

 addLocalEnv = () => {
        this.localEnv.push({})
    }

    bindLocalVariable = (name, value) => {
        const env = this.localEnv[this.localEnv.length - 1]
        env[name] = value
    }

    getVariable = (name) => {
        /*
        search the given variable in localEnv array
        */
        for (let i = this.localEnv.length - 1; i >= 0; i--) {
            if (this.localEnv[i][name]) {
                return this.localEnv[i][name]
            }
        }

        return null
    }


    removeLocalEnv = () => {
        if (this.localEnv.length > 1) {
            this.localEnv.pop()
        }
    }

```

Every time when intepreter found a block node, it will call add addLocalEnv to create a local enviroment object on the array of localEnv, when it comes out from
the block node, which meas the code to goto the end of block, then intepreter calls removeLocalEnv to remove the enviroment object, then any variables that are 
binding in the current block will be removed.

Notices in the constructor, we put globalEnv as the first element of localEnv, this means any variable declared by let at the out most will deem as global variables.
Now we can goto intepreter.js to add handling code:
```js
 visitBlockNode = (parent, node) => {
        /*
        in block statement, create local enviroment to store variables
        declared by let
        */
        this.runTime.addLocalEnv()
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
        //when out of the local block, remove current locan enviroment
        this.runTime.removeLocalEnv()
    }

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

        /*
        if the variable is declared by let, should bind it to local enviroment
        ,if it is declared by var, bind it to global enviroment
        */
        if (node.token.lexeme === "let") {
            this.runTime.bindLocalVariable(variableName, assignedVal)
        } else {
            this.runTime.bindGlobalVariable(variableName, assignedVal)
        }

        this.attachEvalResult(parent, node)
    }

 visitPrimaryNode = (parent, node) => {
    ....
      switch (token.token) {
            case Scanner.IDENTIFIER:
                //get the binding value for given variable name
                const name = token.lexeme
                const val = this.runTime.getVariable(name)
                type = val.type
                value = val.value
                break
      ....
      }
 ...
}
```
In intepreter, when it comes to block node, the method of visitBlockNode will be called, it calls addLocalEnv of runtime to create an enviroment object for the 
current block, when it comes to the end of block(after calling this.visitChildren(node)), it calls this.runTime.removeLocalEnv() to remove the current enviroment
object.

After adding the above code, run the test again and make sure it passes. Actually we have done many thing at once, for example the following cases can be satified:
```js
it("should restrict local variable in their own scope", () => {
        let code = `
           {
               let a = 1;
               print(a);
           }

           {
               let a = 2;
               print(a);
           }
        `

        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(2)
        expect(console[0]).toEqual(1)
        expect(console[1]).toEqual(2)
    })

    it("should reference variable in outer scope from inner scope", () => {
        let code = `
        {
            let a = 1;
            {
                let b = 2;
                {
                    print(a);
                    print(b);
                }
            }
        }
     `

        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(2)
        expect(console[0]).toEqual(1)
        expect(console[1]).toEqual(2)
    })
```

We need to make sure when referencing a local variable outsize of its declarting block should cause error, add the following test case:
```js
it("should throw exception for reference local variable when our of its scope", () => {
        let code = `
        {
            let a = 1;
        }
        print(a);
     `

        const codeToParse = () => {
            let root = createParsingTree(code)
            let intepreter = new Intepreter()
            root.accept(intepreter)
        }
        expect(codeToParse).toThrow("undefined variable with name a")
    })
```
Run and it will fail, we goto runtime to add code for this case:
```js
getVariable = (name) => {
        /*
        search the given variable in localEnv array
        */
        for (let i = this.localEnv.length - 1; i >= 0; i--) {
            if (this.localEnv[i][name]) {
                return this.localEnv[i][name]
            }
        }
        //report error for undefined variable
        throw new Error(`undefined variable with name ${name}`)
    }
```
Notice the above code, when we referencing variable in a block, it it can't find its declaration, the intepreter will look up to outer scope for it, if it looks all
enviroment created until the current scope and can't find the declaration of variable, the intepreter throw an exception for it, run the test again and make sure
it success.




