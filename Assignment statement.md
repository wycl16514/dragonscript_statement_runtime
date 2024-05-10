First let's do a bug fix in token.js:

```js
export default class Scanner {
    ...
    //bug fix here
    static IDENTIFIER = 24 // x, y...
    ...
}
```
change the value for identifier from 14 to 24.

In last section, we support assigment in the declaration of variable. But we can't support the reassignment, for example our parser can't support a statement like a = 234; without the var keyword, enven the given variable has alread declared before. Let's enhance our parser to enable variable assigment like the way indicated in the following test case:

```js
  it("should enable variable reassignment", () => {
        let code = `
        var a = 1+2*3+4;
        print(a);
        a = "hello";
        print(a);
        var b ;
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
We can see from the above code that variable a is assigned with value of 1+2*3+4, and then it can be reassigned with string "hello". Notice that we even support chain assignment like a = b = "world";
,run the test and make sure it fail.

We can modify the grammar rule of expression to enable the parsing of assigment like following:

expression -> assignment

assignment -> IDENTIFIER EQUAL assignment | equality

Notice that in the rule of assigment, we put it at the end of the rule which get make the parsing loop back to it again. Let's check how to change the code in parser:
```js
 expression = (parentNode) => {
        //expression -> assignment
        const exprNode = this.createParseTreeNode(parentNode, "expression")
        this.assignment(exprNode)
        parentNode.children.push(exprNode)
    }

    assignment = (parentNode) => {
        //assignment -> IDENTIFIER EQUAL assignment | equality
        let assignmentNode = this.createParseTreeNode(parentNode, "assignment")
        while (true) {
            let token = this.matchTokens([Scanner.IDENTIFIER])
            if (token === null) {
                break
            }
            assignmentNode.attributes = {
                value: token.lexeme
            }
            parentNode.children.push(assignmentNode)
            //go over the identifier
            this.advance()
            token = this.matchTokens([Scanner.EQUAL])
            if (token === null) {
                throw new Error("assignment without equal symbol")
            }
            this.advance()
            //using while loop to come back to the assigment parsing
            parentNode = assignmentNode
            assignmentNode = this.createParseTreeNode(parentNode, "assignment")
        }

        this.equality(assignmentNode)
    }

 addAcceptForNode = (parent, node) => {
    switch (node.name) {
       ...
      case "assignment":
                node.accept = (visitor) => {
                    visitor.visitAssignmentNode(parent, node)
                }
                break
      ...
    }
    ....
 }

```
Pay attention to assignment method, we use loop instead of recursive call to loop back to itself, as long as there is identifier at the begin of statement, the parser will apply the
rule of assignment to analyze the current line of code. Since we add a new node with name "assignment", we need to add method in tree adjustment visitor like following:
```js
 visitAssignmentNode = (parent, node) => {
        this.visitChildren(node)
    }
```
Now we let's check its parsing tree first, using the command like following:

<img width="1434" alt="截屏2024-05-10 21 53 47" src="https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/bcfc9cf7-611e-4da6-9aa3-0d250f6ecc2f">

Now let's go to intepreter to handle evaluate assignment operation by using the following code:
```

```


