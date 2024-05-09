Declare variables is inevitable for programming language. In js, there are three ways to declare variables, one is using keyword var, varaible declared in this way has global scope,
that is any code after the line of declaration can reference it, the other two ways of variable declaration are using keyword let and const, variables declared by this way have local
scoping, when go out the statement group with { and }, you can't reference them any more.

Let's see how we can add global variable declaration by using var in our language. First we rewrite our grammar rules to support variable declaration:

program -> declaration_recursive

declaration_recursive -> EOF | var_decl  declaration_recursive | statement_recursive declaration_recursive

var_decl -> VAR IDENTIFIER  assign_to SEMICOLON

assign_to -> EQUAL expression

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
string, and bool, variable can participate in arithmetic operation with other primitive type like number and string, we will add more operation base on variable at later time.Run the
test case and make sure it fail.
