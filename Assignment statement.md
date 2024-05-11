First let's do a bug fix in token.js:

```js
export default class Scanner {
    ...
    //bug fix here
    static IDENTIFIER = 24 // x, y...
    ...
}
```
change the value for identifier from 14 to 24. and in parser:
```
 advance = () => {
        if (this.current + 1 >= this.tokens.length) {
            /*
            if current at the end of array, we push a new token
            otherwise there has token ahead of current ,then we just 
            return the next already existing token
            */
            const token = this.scanner.scan()
            //we need to read the EOF token to know it is the end of source
            this.tokens.push(token)
            this.current += 1
        }
        //bug fix
        else {
            //don't need to read new token
            this.current += 1
        }
    }
```

In last section, we support assigment in the declaration of variable. But we can't support the reassignment, for example our parser can't support a statement like a = 234; without the var keyword, enven the given variable has alread declared before. Let's enhance our parser to enable variable assigment like the way indicated in the following test case:

```js
  it("should enable parsing variable reassignment", () => {
        var a = 1+2*3+4;
        a = "hello";
        var b;
        a = b = "world";
     `
        let root = createParsingTree(code)
        expect(root).not.toBeNull()
    })

```
We can see from the above code that variable a is assigned with value of 1+2*3+4, and then it can be reassigned with string "hello". Notice that we even support chain assignment like a = b = "world";
,run the test and make sure it fail.

We can modify the grammar rule of expression to enable the parsing of assigment like following:

expression -> assignment

assignment -> equality assign_to

assign_to -> EQUAL expression | EPSILON

In the grammar rules aboved, we differentiate an normal expression with an assignment statement by checking whther there is an equal sign
at the middle of the code, if there is an equal sign then we think we are encountering an assignment statement.

Let's check how to change the code in parser:
```js
 expression = (parentNode) => {
        //expression -> assignment
        const exprNode = this.createParseTreeNode(parentNode, "expression")
        this.assignment(exprNode)
        parentNode.children.push(exprNode)
    }

    assignment = (parentNode) => {
        //assignment ->equality assign_to
        this.equality(parentNode)
        if (this.matchTokens([Scanner.EQUAL])) {
            //over the equal sign
            this.advance()
            const assignmentNode = this.createParseTreeNode(parentNode, "assignment")
            parentNode.children.push(assignmentNode)
            this.expression(assignmentNode)
        } else {
            //assign_to -> EPSILON
            return
        }
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
Since we add a new node in the parser, we need to add visit method to tree adjustment visitor like following:

```js
 visitAssignmentNode = (parent, node) => {
        this.visitChildren(node)
    }
```

After completing the above code, let's draw the parsing tree for code with variable assignment by using the following command:

recursiveparsetree var a=1; print(a); a=2;

Then we get a parsing tree like following:

<img width="1383" alt="截屏2024-05-10 23 29 04" src="https://github.com/wycl16514/dragonscript_statement_runtime/assets/7506958/f72c3d8e-7df5-4e42-b846-c672c864a85c">

Look at the parsing tree we found something worth of notice, when the parser parsing the statement "a=2;", it take the variable "a" at the
left of equal sign to be an expression, and then assign the value of 2 to the expression of "a". This would bring some problem but let's 
run the test and make sure the newly added test case can be passed.

We have problem in the handling of assginment above, that is we can assign to the so called "r-value", that is the following statements
should be illegal but can be let go by our parser:

```js
var a = 1;
(a) = 2;
123 = 2;
```
In the code above, the "(a)" and "123" are so called "r-value" in compiler theory and should not be assigend. You can know more about 
r value at here https://www.geeksforgeeks.org/lvalue-and-rvalue-in-c-language/. In order to avoid the assigment to r value we need to 
do more checking, first let's add a new test case like following:

```js
it("should throw exception for assignment to r value", () => {
        let code = `
        var a = 1+2*3+4;
        (a) = "hello";
     `
        let codeToParse = () => {
            createParsingTree(code)
        }
        expect(codeToParse).toThrow()

        code = `123="hello";`
        expect(codeToParse).toThrow()

        code = `"hello"=123;`
        expect(codeToParse).toThrow()

        //assign to undefined variable
        code = `a = 123;`
        expect(codeToParse).toThrow()
    })
```
Run the test case above and make sure it fail, when we parsing statement for assignment, we need to make sure the object at the left of 
equal sign should be an identifier , therefore we change the code like following:
```js
 assignment = (parentNode) => {
        //assignment ->equality assign_to
        this.equality(parentNode)
        if (this.matchTokens([Scanner.EQUAL])) {
            //assign_to -> EQUAL expression
            this.previous()
            const token = this.matchTokens([Scanner.IDENTIFIER])
            if (token) {
                let assignmentNode = this.createParseTreeNode(parentNode, "assignment")
                assignmentNode.attributes = {
                    value: token.lexeme
                }
                //over the identifier
                this.advance()
                //over the equal sign
                this.advance()
                const curToken = this.getToken()
                console.log(curToken)
                this.expression(assignmentNode)
                parentNode.children.push(assignmentNode)
            } else {
                throw new Error("can only assign to defined identifier")
            }
        } else {
            //assign_to -> EPSILON
            return
        }
    }
```
In the above code, when the parser parsing an assginment statement, it will check the token at the left of the equal sign should be an identifier, if it is not,
it throw out an parsing error exeception, Let's run the test again and make sure the newly added test case can be passed.

Our code still not perfect, because we still can assign to an identifer that is not defined, for example the following test case will fail:
```js
 it("should throw exception when assign to undefined variable", () => {
        let code = `
         a = 1234;
     `
        let codeToParse = () => {
            createParsingTree(code)
        }
        expect(codeToParse).toThrow()
    })
})
```
Such case can't be handled by parser because we can only check variable defined or not at runtime, therefore its the job of identifier, let's do something on the
identifier:
```js

```





