In last section, we support assigment in the declaration of variable. But we can't support the reassignment, for example our parser can't support a statement like a = 234; without the var keyword, enven the given
variable has alread declared before. Let's enhance our parser to enable variable assigment like the way indicated in the following test case:

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

