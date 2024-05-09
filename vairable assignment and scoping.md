Declare variables is inevitable for programming language. In js, there are three ways to declare variables, one is using keyword var, varaible declared in this way has global scope,
that is any code after the line of declaration can reference it, the other two ways of variable declaration are using keyword let and const, variables declared by this way have local
scoping, when go out the statement group with { and }, you can't reference them any more.

Let's see how we can add global variable declaration by using var in our language. First we rewrite our grammar rules to support variable declaration:

program -> declaration_recursive

declaration_recursive -> EOF | var_decl  declaration_recursive | statement_recursive declaration_recursive

var_decl -> VAR IDENTIFIER  assign_to SEMICOLON

assign_to -> EQUAL expression | EPSILON

primary -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER |epsilon

In above grammar rule, we add a new rule with name "declaration_recursive" it will stop the parsing process if the current token is EOF, otherwise it will goto var_decl or 
statement_recursive and then loop back to declaration_recursive again. It will decide on jump to var_decl or statement_recursive according to current token, if the current
reading token is keyword var, then it will jump to rule of var_decl otherwise it will jump to statement_recursive, let't create the test case first:

```js
it("should evaluate variable in statement and expression", () => {
        let code = `var a = 123;
        print(a+1);
        var b = "value of a is: " + a;
        print(b);
        var c;
        print(c);
        var d = true;
        print(d);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(4)
        expect(console[0]).toEqual(124)
        expect(console[1]).toEqual("value of a is: 123")
        expect(console[2]).toEqual("null")
        expect(console[3]).toEqual("true")
    })

```

Take a look from the test case above, our intention for variable is clear, we support variable declaration with assignment, we can assign all kinds of primary type to it like number,
string, and bool, variable can participate in arithmetic operation with other primitive type like number and string, we will add more operation base on variable at later time.Run the test case and make sure it fail.

Let's add code to satisfy the test case, add code on our parser:

```js

    declarationRecursive = (parent) => {
        const declNode = this.createParseTreeNode(parent, "decl_recursive")
        parent.children.push(declNode)
        let token = this.matchTokens([Scanner.EOF])
        if (token) {
            declNode.attributes = {
                value: "EOF",
            }
            //end of code
            return
        }

        //if the current token is var, goto var_decl
        token = this.matchTokens([Scanner.VAR])
        if (token) {
            this.advance()
            this.varDecl(declNode)
        } else {
            this.statementRecursive(declNode)
        }
        //loop back to declaration_recursive
        this.advance()
        this.declarationRecursive(declNode)
    }

    varDecl = (parent) => {
        const varDeclNode = this.createParseTreeNode(parent, "var_decl")
        parent.children.push(varDeclNode)

        let token = this.matchTokens([Scanner.IDENTIFIER])
        if (token === null) {
            throw new Error("var declaration missing identifier name")
        }
        //record the variable name here
        varDeclNode.attributes = {
            value: token.lexeme,
        }

        token = this.matchTokens([Scanner.EQUAL])
        if (token) {
            this.advance()
            this.expression(varDeclNode)
        }

        token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("variable declaration missing semicolon")
        }
        this.advance()
    }

addAcceptForNode = (parent, node) => {
    switch (node.name) {
    ....
     //add visit method for decl_recursive and var_decl
            case "decl_recursive":
                node.accept = (visitor) => {
                    visitor.visitDeclarationRecursiveNode(parent, node)
                }
                break
            case "var_decl":
                node.accept = (visitor) => {
                    visitor.visitVarDeclarationNode(parent, node)
                }
                break
    ....
}
```
Since we add now nodes, let's add visit methods to tree adjustor and intepreter, first let's do it for tree adjustor:
```js
 visitDeclarationRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitVarDeclarationNode = (parent, node) => {
        this.visitChildren(node)
    }
```
When it comes to intepreter, there are several things we need to considers.
