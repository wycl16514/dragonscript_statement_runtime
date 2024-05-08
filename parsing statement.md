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
arithmetic expression, that's why when we enter into the state of statement, we need to check which way should we take, go to parse the print statment or go to parse the arithmetic 


