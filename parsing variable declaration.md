Declare variables is inevitable for programming language. In js, there are three ways to declare variables, one is using keyword var, varaible declared in this way has global scope,
that is any code after the line of declaration can reference it, the other two ways of variable declaration are using keyword let and const, variables declared by this way have local
scoping, when go out the statement group with { and }, you can't reference them any more.

Let's see how we can add global variable declaration by using var in our language. First we rewrite our grammar rules to support variable declaration:

program -> declaration_recursive

declaration_recursive -> EOF | var_decl  declaration_recursive | statement declaration_recursive

var_decl -> VAR IDENTIFIER  assign_to SEMICOLON

assign_to -> EQUAL expression | EPSILON

primary -> NUMBER | STRING | "true" | "false" | "nil" | "(" expression ")" | IDENTIFIER |epsilon

In above grammar rule, we add a new rule with name "declaration_recursive" it will stop the parsing process if the current token is EOF, otherwise it will goto var_decl or  statement and then loop back to declaration_recursive again. It will decide on jump to var_decl or statement according to current token, 
if the current reading token is keyword var, then it will jump to rule of var_decl otherwise it will jump to statement.Notice we don't use statement_recursive
any more because we can loop back to statement by declaration_recursive which is following the statement in the rule of declaration_recursive.

let't create the test case first:

```js

    it("should enable to parse variable declaration", ()=> {
        let code = `
            var a = 123;
            var b = "hello";
            var c;`
        let root = createParsingTree(code)
        expect(root).not.toBeNull()
    })

```

Take a look from the test case above, our intention for variable is clear, we support variable declaration with or without assignment,Let's add code to satisfy the test case, add code on our parser:

```js

     program = (parent) => {
        const programNode = this.createParseTreeNode(parent, "program")
        this.declarationRecursive(programNode)
        parent.children.push(programNode)
    }

    declarationRecursive = (parent) => {
        const declNode = this.createParseTreeNode(parent, "decl_recursive")
        let token = this.matchTokens([Scanner.EOF])
        if (token) {
            //declaration_recursive -> EOF
            declNode.attributes = {
                value: "EOF",
            }
            //end of code
            return
        }
        parent.children.push(declNode)

        //if the current token is var, goto var_decl
        token = this.matchTokens([Scanner.VAR])
        if (token) {
            //declaration_recursive -> var_decl  declaration_recursive
            this.advance()
            this.varDecl(declNode)
        } else {
            //declaration_recursive -> statement declaration_recursive
            this.statement(declNode)
        }
        //loop back to declaration_recursive
        this.declarationRecursive(declNode)
    }


    varDecl = (parent) => {
        const varDeclNode = this.createParseTreeNode(parent, "var_decl")
        parent.children.push(varDeclNode)

        let token = this.matchTokens([Scanner.IDENTIFIER])
        if (token === null) {
            throw new Error("var declaration missing identifier name")
        }
        this.advance()
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
and in intepreter.js we add the same methods there:
```js
    visitDeclarationRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitVarDeclarationNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }
```

After adding above code, let's check the parsing tree first, run the following command:
```
recursiveparsetree var a="hello"; var b=123; var c;
```
Then we get the tree like following:
![截屏2024-05-10 00 22 31](https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/cdf8fb32-6153-4e21-afbc-8dc3b417803a)

Now we run the test case again and make sure we can pass the case now.
