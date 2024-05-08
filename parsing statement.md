So far our parser can be a not bad calculator because it can only handle arithmetic expression. For a full fleged programming language, we need it to understant statement like if..else, for, while and so on.
In this section let's see how we can enhance our grammar for the supporting of parsing statement. Let's do it from simple to complex, first we enable our parser to handle a simple print statme like following;

```js
print(1+2*3+4);
print("hello world!");
```

First we need to enhance our grammar rules to let the parser understand the print state, and we change our grammar rules as following:

Program -> statement statement_recursive
statement -> expression SEMICOLON | print_statement
statement_recursive -> EOF | statement
print_statement -> PRINT LEFT_PAREN expression RIGHT_PAREN SEMICOLON

The above grammar enable the parser to do following things:

1, the parser can understand multiple lines of code with the combination of expression and print statement by using the rule statement_recursive
2, the parser can understand the print statement should begin with the print keyword, then follow by left paren and right paren with and expression in between, which means the print statment can print out an
arithmetic expression or a string

Now we need to think about what kind of result we should get when we evaluate the print statement for print(1+2*3+4); and print("hello");? By the principle of from simple to complex, let's return an evaluation object like following, we will change the evaluation effect in later sections:
```js
{
type: "print",
value: 11,
}

{
type: "print",
value:"hello",
}
```

After deciding the print statement evaluation result, we can add test case first:
```js
it("should evaluate a print statement", () => {
        let code = 'print(1+2*3+4);'
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "print",
            value: 11,
        })

        code = 'print("hello");'
        root = createParsingTree(code)
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "print",
            value: "hello",
        })

    })
```
Run the test and make sure it fail, then we add code to satisfy the test. we need to change our parser to reflect the changes of the above grammar rule, go to recursive_descent_parser.js
and make the following code changes:
```js
 parse = () => {
        //clear the parsing tree
        const treeRoot = this.createParseTreeNode(null, "root")
        //root of the grammar is program
        this.program(treeRoot)

        return treeRoot
    }

    program = (parent) => {
        const programNode = this.createParseTreeNode(parent, "program")
        this.statement(programNode)
        parent.children.push(programNode)
    }

    statementRecursive = (parent) => {
        const token = this.matchTokens([Scanner.EOF])
        if (token) {
            //end of code
            return
        }

        const stmtRecursiveNode = this.createParseTreeNode(parent, "statement_recursive")
        this.statement(stmtRecursiveNode)
        parent.children.push(stmtRecursiveNode)
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
        parent.children.push(stmtNode)
    }

    printStmt = (parent) => {
        //print_stmt ->PRINT LEFT_PAREN expressin RIGHT_PAREN SEMICOLON
        const printStmtNode = this.createParseTreeNode(parent, "print_stmt")
        let token = this.matchTokens([Scanner.LEFT_PAREN])
        if (token === null) {
            throw new Error("print statement miss left paren")
        }
        this.advance()

        this.expression(printStmtNode)

        token = this.matchTokens([Scanner.RIGHT_PAREN])
        if (token === null) {
            throw new Error("print statement miss right paren")
        }
        this.advance()

        token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("print statement miss matching SEMICOLON")
        }
        parent.children.push(printStmtNode)
    }
```
In the above code, we change the beginning of the parsing from statement to program, and in parsing the statement we need to consider two cases now, one is for the print statement , the second is for
arithmetic expression, that's why when we enter into the state of statement, we need to check which way should we take, go to parse the print statment or go to parse the arithmetic. In printStmt we do
the parsing according to the rule print_stmt -> PRINT LEFT_PAREN expression RIGHT_PAREN SEMICOLON, first check it should begin with left paren, then parsing the expression inside it and make sure it ends
with right paren and semicolon.

Since we have added new nodes, then we need to add the handling for new nodes in addAcceptForNode like following:
```js
 addAcceptForNode = (parent, node) => {
        switch (node.name) {
            case "root":
                node.accept = (visitor) => {
                    visitor.visitRootNode(parent, node)
                }
                break
            //add visit method for program and statement recursive
            case "program":
                node.accept = (visitor) => {
                    visitor.visitProgramNode(parent, node)
                }
                break
            case "statement_recursive":
                node.accept = (visitor) => {
                    visitor.visitStatementRecursiveNode(parent, node)
                }
                break
            case "statement":
                node.accept = (visitor) => {
                    visitor.visitStatementNode(parent, node)
                }
                break
            case "print_stmt":
                node.accept = (visitor) => {
                    visitor.visitPrintStatementNode(parent, node)
                }
                break
    ....
}
```
Since the parsing tree has new nodes, we need to handle the new nodes in tree_adjust_visitor and inpteprer, we don't need to do any adjustment for the newly added nodes, therefore we have the following code
for tree adjust vistor:
```js
   visitProgramNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitStatementRecursiveNode = (parent, node) => {
        this.visitChildren(node)
    }

    visitPrintStatementNode = (parent, node) => {
        this.visitChildren(node)
    }
```

But we need to the the evaluation for the print_stmt node in intepreter, and we add code like following:
```js
 visitProgramNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

    visitStatementRecursiveNode = (parent, node) => {
        this.visitChildren(node)
        this.attachEvalResult(parent, node)
    }

 visitPrintStatementNode = (parent, node) => {
        this.visitChildren(node)
        const exprEval = node.children[0].evalRes
        node.evalRes = {
            type: "print",
            value: exprEval.value,
        }
        this.attachEvalResult(parent, node)
    }
```
When visit the print_stmt node in the parsing tree, we first evaluate its child node that is expression node, then we get the evaluation result and put the result value in the evalRes object for the print_stmt
node here then passing it up to its parent until the root node. After completing above code, let's check the parsing tree for statement of  print(1+2*3+4) :


<img width="1364" alt="截屏2024-05-08 14 42 50" src="https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/ff61c7fa-2b79-4c0b-87af-6ed26c823e02">

The parsing tree looks good, and there is an expression node as child of the print_stmt node, then let's run the test again and make sure it can be passed:

<img width="1072" alt="截屏2024-05-08 14 44 58" src="https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/62563a94-ee1f-4ecd-b596-7170a7904998">

So far so good, we will see how to improve the evaluation of statements in next section.
