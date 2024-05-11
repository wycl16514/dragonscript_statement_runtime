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
```
It turns out cases at aboved can passed too, which shows the robust of our evaluator and parser!
