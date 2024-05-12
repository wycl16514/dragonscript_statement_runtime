import RecursiveDescentParser from "../parser/recursive_descent_parser";
import Intepreter from "./intepreter";
import TreeAdjustVisitor from "./tree_adjust_visitor";

describe("Testing evaluation for expression", () => {

    const createParsingTree = (code) => {
        const parser = new RecursiveDescentParser(code)
        const root = parser.parse()
        const treeAdjustVisitor = new TreeAdjustVisitor()
        root.accept(treeAdjustVisitor)
        return root
    }

    it("should evaluate integer number successfully", () => {
        const root = createParsingTree("1234;")
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1234,
        })
    })

    it("should evaluate float number successfully", () => {
        const root = createParsingTree("12.34;")
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 12.34,
        })
    })

    it("should evaluate string literal successfully", () => {
        const root = createParsingTree('"hello world!";')
        const intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })

    it("should evaluate string or number literal in parentheses", () => {
        let root = createParsingTree('(1.23);')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })

        root = createParsingTree('("hello world!");')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello world!",
        })
    })

    it("should evaluate unary operator - for number literal", () => {
        let root = createParsingTree('-1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: -1.23,
        })
    })

    it("should evaluate unary operator ! for true and false boolean", () => {
        let root = createParsingTree('!true;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!false;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate to false for unary operator ! for expression not nil and false", () => {
        let root = createParsingTree('!1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!"hello";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('!nil;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate binary operator +, - correctly", () => {
        let root = createParsingTree('1.23+2.46;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 3.69,
        })

        root = createParsingTree('2.46-1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })
    })


    it("should evaluate binary operator * and / correctly", () => {
        let root = createParsingTree('1.23*2;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 2.46,
        })

        root = createParsingTree('2.46 / 2;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "number",
            value: 1.23,
        })
    })

    it("should evaluate comparison operator correctly", () => {
        let root = createParsingTree('2.46 > 1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('1.23 >= 2.46;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('2.46 < 1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('1.23 <= 2.46;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should evaluate equality operator correctly", () => {
        let root = createParsingTree('2.46 == 1.23;')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: false,
        })

        root = createParsingTree('2.46 != 1.23;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('nil == nil;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('"hello" == "hello";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })

        root = createParsingTree('"hello" != "world";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "boolean",
            value: true,
        })
    })

    it("should support number and string for operator + and *", () => {
        let root = createParsingTree('3 + "hello,world!";')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "3hello,world!",
        })

        root = createParsingTree('"hello,world!" + 3;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,world!3",
        })

        root = createParsingTree('3 * "hello,";')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,hello,hello,",
        })

        root = createParsingTree('"hello," * 3;')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "string",
            value: "hello,hello,hello,",
        })
    })

    it("should report error for incompatible type operation", () => {
        let root = createParsingTree('"hello" - "world!";')
        let intepreter = new Intepreter()
        let runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" - 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" / "world!";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" * "world!";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" == 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" != 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" < 3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <=  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >=  3;')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >=  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" >  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()

        root = createParsingTree('"hello" <=  "world";')
        intepreter = new Intepreter()
        runCode = () => {
            root.accept(intepreter)
        }
        expect(runCode).toThrow()
    })

    it("should evaluate a print statement", () => {
        let root = createParsingTree('print(1+2*3+4);')
        let intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "print",
            value: 11,
        })

        root = createParsingTree('print("hello");')
        intepreter = new Intepreter()
        root.accept(intepreter)
        expect(root.evalRes).toMatchObject({
            type: "print",
            value: "hello",
        })
    })

    it("should output content in print to console of runtime", () => {
        let code = `print(1+2*3+4);
       print("hello");
       print("world");`
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)

        const console = intepreter.runTime.console
        expect(console.length).toEqual(3)
        expect(console[0]).toEqual(11)
        expect(console[1]).toEqual("hello")
        expect(console[2]).toEqual("world")
    })

    it("should enable to parse variable declaration", () => {
        let code = `
        var a = 123;
        var b = "hello";
        var c;
        `
        let root = createParsingTree(code)
        expect(root).not.toBeNull()
    })

    it("should bind variable to value that it is assigned to", () => {
        let code = `
           var a = 1+2*3+4;
           print(a);
           var a = "hello";
           print(a);
           var c;
           print(c);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(3)
        expect(console[0]).toEqual(11)
        expect(console[1]).toEqual("hello")
        expect(console[2]).toEqual("null")
    })

    it("should enable parsing variable reassignment", () => {
        let code = `
        var a = 1+2*3+4;
        a = "hello";
        var b;
        a = b = "world!";
        `

        let root = createParsingTree(code)
        expect(root).not.toBeNull()
    })

    it("should throw exception for assignment to r value", () => {
        let code = `
            var a = 1+2*3+4;
            (a) = "hello";
        `
        let codeToParse = () => {
            createParsingTree(code)
        }
        expect(codeToParse).toThrow()

        let code1 = `
        123 = "hello";
        `
        let codeToParse1 = () => {
            createParsingTree(code1)
        }
        expect(codeToParse1).toThrow()

        let code2 = `
         "hello" = 123;
        `
        let codeToParse2 = () => {
            createParsingTree(code2)
        }
        expect(codeToParse2).toThrow()
    })

    it("should evaluate assignement statement correctly", () => {
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

    it("should enable assigned variable in arithmetic expression", () => {
        let code = `
        var a;
        var b;
        a = 1;
        b = 2;
        var c = a + b;
        print(c);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(1)
        expect(console[0]).toEqual(3)
    })

    it("should enable assigned variable in string expression", () => {
        let code = `
        var a;
        var b;
        a = "hello";
        b = ",world";
        var c = a + b;
        print(c);
        a = 3;
        b = "hello";
        var c;
        c = a + b;
        print(c);
        var d;
        d = a * b;
        print(d);
        `
        let root = createParsingTree(code)
        let intepreter = new Intepreter()
        root.accept(intepreter)
        const console = intepreter.runTime.console
        expect(console.length).toEqual(3)
        expect(console[0]).toEqual("hello,world")
        expect(console[1]).toEqual("3hello");
        expect(console[2]).toEqual("hellohellohello")
    })


    it("should throw exception when assign to undefiend variable", () => {
        let code = `
        a = 123;
        `

        let codeToParse = () => {
            let root = createParsingTree(code)
            let intepreter = new Intepreter()
            root.accept(intepreter)
        }

        expect(codeToParse).toThrow()
    })

})

