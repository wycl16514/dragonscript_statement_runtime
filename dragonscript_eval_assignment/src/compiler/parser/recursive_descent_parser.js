import Scanner from '../scanner/token'

export default class RecursiveDescentParser {
    constructor(expression) {
        this.source = expression
        this.scanner = new Scanner(expression)
        this.tokens = []
        this.current = -1
        this.parseTree = []
        this.advance()
    }

    getToken = () => {
        return this.tokens[this.current]
    }

    advance = () => {
        if (this.current + 1 >= this.tokens.length) {
            const token = this.scanner.scan()
            //we need to read the EOF token to know its end of the source
            this.tokens.push(token)
            this.current += 1
        } else {
            this.current += 1
        }
    }

    previous = () => {
        if (this.current > 0) {
            this.current -= 1
        }
    }

    addAcceptForNode = (parent, node) => {
        switch (node.name) {
            case "root":
                node.accept = (visitor) => {
                    visitor.visitRootNode(parent, node)
                }
                break
            case "program":
                node.accept = (visitor) => {
                    visitor.visitProgramNode(parent, node)
                }
                break
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
            case "expression":
                node.accept = (visitor) => {
                    visitor.visitExpressionNode(parent, node)
                }
                break
            case "assignment":
                node.accept = (visitor) => {
                    visitor.visitAssignmentNode(parent, node)
                }
                break
            case "equality":
                node.accept = (visitor) => {
                    visitor.visitEqualityNode(parent, node)
                }
                break
            case "comparison":
                node.accept = (visitor) => {
                    visitor.visitComparisonNode(parent, node)
                }
                break
            case "equality_recursive":
                node.accept = (visitor) => {
                    visitor.visitEqualityRecursiveNode(parent, node)
                }
                break
            case "comparison_recursive":
                node.accept = (visitor) => {
                    visitor.visitComparisonRecursiveNode(parent, node)
                }
                break
            case "term":
                node.accept = (visitor) => {
                    visitor.visitTermNode(parent, node)
                }
                break
            case "term_recursive":
                node.accept = (visitor) => {
                    visitor.visitTermRecursiveNode(parent, node)
                }
                break
            case "factor":
                node.accept = (visitor) => {
                    visitor.visitFactorNode(parent, node)
                }
                break
            case "factor_recursive":
                node.accept = (visitor) => {
                    visitor.visitFactorRecursiveNode(parent, node)
                }
                break
            case "unary":
                node.accept = (visitor) => {
                    visitor.visitUnaryNode(parent, node)
                }
                break
            case "unary_recursive":
                node.accept = (visitor) => {
                    visitor.visitUnaryRecursiveNode(parent, node)
                }
                break
            case "primary":
                node.accept = (visitor) => {
                    visitor.visitPrimaryNode(parent, node)
                }
                break

        }
    }

    createParseTreeNode = (parent, name) => {
        const node = {
            name: name,
            children: [],
            attributes: "",
        }

        this.addAcceptForNode(parent, node)

        return node
    }

    matchTokens = (tokens) => {
        const curToken = this.getToken()
        for (let i = 0; i < tokens.length; i++) {
            if (tokens[i] === curToken.token) {
                return curToken
            }
        }

        return null
    }

    parse = () => {
        const treeNode = this.createParseTreeNode(null, "root")
        this.program(treeNode)
        return treeNode
    }

    /*
    expression -> assignment
    assignment -> equality assign_to
    assign_to -> EQUAL expression | EPSILON
    
    equality -> .... -> primary -> IDENTIFIER
    var a ;
    var b ;
    a = b = 2;
    */

    program = (parent) => {
        //program -> declaration_recursive
        const programNode = this.createParseTreeNode(parent, "program")
        this.declarationRecursive(programNode)
        parent.children.push(programNode)
    }

    declarationRecursive = (parent) => {
        const declNode = this.createParseTreeNode(parent, "decl_recursive")
        //declaration_recursive -> EOF | var_decl declaration_recursive| statement declaration_recursive
        let token = this.matchTokens([Scanner.EOF])
        if (token) {
            //declaration_recursive -> EOF
            return
        }

        parent.children.push(declNode)
        token = this.matchTokens([Scanner.VAR])
        if (token) {
            //declaration_recursive -> var_decl declaration_recursive
            this.advance()
            this.varDecl(declNode)
        } else {
            //declaration_recursive -> statement declaration_recursive
            this.statement(declNode)
        }

        this.declarationRecursive(declNode)
    }

    varDecl = (parent) => {
        //var_decl -> VAR IDENTIFIER assign_to SEMICOLON
        const varDeclNode = this.createParseTreeNode(parent, "var_decl")
        parent.children.push(varDeclNode)

        let token = this.matchTokens([Scanner.IDENTIFIER])
        if (token === null) {
            throw new Error("var declaration missing identifier name")
        }
        this.advance()
        varDeclNode.attributes = {
            value: token.lexeme,
        }
        //assign_to -> EQUAL expression | EPSILON
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

    statementRecursive = (parent) => {
        //statement_recursive -> EOF | statement statement_recursive
        const statementRecursiveNode = this.createParseTreeNode(parent, "statement_recursive")
        parent.children.push(statementRecursiveNode)

        const token = this.matchTokens([Scanner.EOF])
        if (token) {
            statementRecursiveNode.attributes = {
                value: "EOF",
            }
            // eod of code
            return
        }

        this.statement(statementRecursiveNode)
        //loop back to statement after parsing the statment if there is not the end of file
        this.statementRecursive(statementRecursiveNode)
    }

    statement = (parent) => {
        // statement -> expression SEMICOLON | print_statement
        const stmtNode = this.createParseTreeNode(parent, "statement")
        //statement -> print_statement
        let token = this.matchTokens([Scanner.PRINT])
        if (token) {
            this.advance()
            this.printStmt(stmtNode)
            parent.children.push(stmtNode)
            return
        }

        //statement -> exression SEMI
        this.expression(stmtNode)
        token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("statement miss matching SEMICOLON")
        }
        this.advance()
        parent.children.push(stmtNode)

    }

    printStmt = (parent) => {
        //print_statement -> PRINT LEFT_PAREN expression RIGHT_PAREN SEMICOLON
        const printStmtNode = this.createParseTreeNode(parent, "print_stmt")
        let token = this.matchTokens([Scanner.LEFT_PAREN])
        if (token === null) {
            throw new Error("print statement missing left paren")
        }
        this.advance()

        this.expression(printStmtNode)

        token = this.matchTokens([Scanner.RIGHT_PAREN])
        if (token === null) {
            throw new Error("print statement missing right paren")
        }
        this.advance()

        token = this.matchTokens([Scanner.SEMICOLON])
        if (token === null) {
            throw new Error("print statement missing SEMICOLON")
        }
        this.advance()
        parent.children.push(printStmtNode)
    }

    expression = (parentNode) => {
        //expression -> assignemnt
        const exprNode = this.createParseTreeNode(parentNode, "expression")
        this.assignment(exprNode)
        parentNode.children.push(exprNode)
    }

    assignment = (parentNode) => {
        //assignment -> equality assign_to
        //assign_to -> EQUAL expression | EPSILON
        this.equality(parentNode)
        if (this.matchTokens([Scanner.EQUAL])) {
            this.previous()
            const token = this.matchTokens([Scanner.IDENTIFIER])
            if (token) {
                const assignmentNode = this.createParseTreeNode(parentNode, "assignment")
                assignmentNode.attributes = {
                    value: token.lexeme, //name of variable to be assigned to
                }
                //over the identifier
                this.advance()
                //over equal sign
                this.advance()
                parentNode.children.push(assignmentNode)
                this.expression(assignmentNode)
            } else {
                throw new Error("can only assign to defined identifier")
            }

        } else {
            //assign_to -> EPSILON
            return
        }
    }

    equality = (parentNode) => {
        //equality -> comparison equality_recursive
        const equNode = this.createParseTreeNode(parentNode, "equality")
        this.comparison(equNode)
        this.equalityRecursive(equNode)
        parentNode.children.push(equNode)
    }

    comparison = (parentNode) => {
        //comparison -> term comparison_recursive
        const compaNode = this.createParseTreeNode(parentNode, "comparison")
        this.term(compaNode)
        this.comparisonRecursive(compaNode)
        parentNode.children.push(compaNode)
    }

    equalityRecursive = (parentNode) => {
        const opToken = this.matchTokens([Scanner.BANG_EQUAL, Scanner.EQUAL_EQUAL])
        if (!opToken) {
            //equality_recursive -> epsilon
            return
        }


        //equality_recursive -> (!= | ==) equlity
        const equalityRecursiveNode = this.createParseTreeNode(parentNode, "equality_recursive")
        equalityRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        equalityRecursiveNode.toekn = opToken
        parentNode.children.push(equalityRecursiveNode)
        this.advance()
        this.equality(equalityRecursiveNode)
    }

    comparisonRecursive = (parentNode) => {
        //comparison_recursive -> epsilon | (>|>=|<|<=)comparison
        const opToken = this.matchTokens([Scanner.GREATER_EQUAL, Scanner.GREATER,
        Scanner.LESS, Scanner.LESS_EQUAL])
        if (!opToken) {
            //comparison_recursive -> epsilon
            return
        }
        //comparison_recursive ->  (>|>=|<|<=)comparison
        const comparisonRecursiveNode = this.createParseTreeNode(parentNode, "comparison_recursive")
        comparisonRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        comparisonRecursiveNode.token = opToken
        parentNode.children.push(comparisonRecursiveNode)
        //scan over those operators
        this.advance()
        this.comparison(comparisonRecursiveNode)
    }

    term = (parentNode) => {
        //term -> factor term_recursive
        const term = this.createParseTreeNode(parentNode, "term")
        this.factor(term)
        this.termRecursive(term)
        parentNode.children.push(term)
    }

    termRecursive = (parentNode) => {
        //term_recursive -> epsilon | ("-" | "+") term
        const opToken = this.matchTokens([Scanner.MINUS, Scanner.PLUS])
        if (opToken === null) {
            //term_recursive -> epsilon
            return
        }
        //term_recursive ->   ("-" | "+") term
        const termRecursiveNode = this.createParseTreeNode(parentNode, "term_recursive")
        termRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        termRecursiveNode.token = opToken
        parentNode.children.push(termRecursiveNode)
        this.advance()
        this.term(termRecursiveNode)
    }

    factor = (parentNode) => {
        //factor -> unary factor_recursive
        const factor = this.createParseTreeNode(parentNode, "factor")
        this.unary(factor)
        this.factorRecursive(factor)
        parentNode.children.push(factor)
    }

    factorRecursive = (parentNode) => {
        //factor_recursive -> epsilon | ("*" | "/") factor
        const opToken = this.matchTokens([Scanner.START, Scanner.SLASH])
        if (opToken === null) {
            //factor_recursive -> epsilon
            return
        }

        //factor_recursive ->   ("*" | "/") factor
        const factorRecursiveNode = this.createParseTreeNode(parentNode, "factor_recursive")
        factorRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        factorRecursiveNode.token = opToken
        parentNode.children.push(factorRecursiveNode)
        this.advance()
        this.factor(factorRecursiveNode)
    }

    unary = (parentNode) => {
        //unary -> primary | unary_recursive
        const unaryNode = this.createParseTreeNode(parentNode, "unary")
        if (this.primary(unaryNode) === false) {
            this.unaryRecursive(unaryNode)
        }
        parentNode.children.push(unaryNode)
    }

    unaryRecursive = (parentNode) => {
        //unary_recursive -> epsilon | ("!" | "-") unary
        const opToken = this.matchTokens([Scanner.BANG, Scanner.MINUS])
        if (opToken === null) {
            //unary_recursive -> epsilon
            return
        }

        //unary_recursive -> ("!" | "-") unary
        const unaryRecursiveNode = this.createParseTreeNode(parentNode, "unary_recursive")
        unaryRecursiveNode.attributes = {
            value: opToken.lexeme,
        }
        unaryRecursiveNode.token = opToken
        this.advance()
        parentNode.children.push(unaryRecursiveNode)
        this.unary(unaryRecursiveNode)
    }


    primary = (parentNode) => {
        //primary -> NUMBER | STRING | true | false | nil | "(" expression ")"|IDENTIFIER|epsilon
        const token = this.matchTokens([Scanner.NUMBER, Scanner.STRING,
        Scanner.TRUE, Scanner.FALSE, Scanner.NIL, Scanner.LEFT_PAREN, Scanner.IDENTIFIER])
        if (token === null) {
            //primary -> epsilon
            return false
        }

        const primaryNode = this.createParseTreeNode(parentNode, "primary")
        if (token.lexeme === '(') {
            primaryNode.attributes = {
                value: "grouping",
            }
        } else {
            primaryNode.attributes = {
                value: token.lexeme,
            }
            primaryNode.token = token
        }

        parentNode.children.push(primaryNode)

        this.advance()
        if (token.token === Scanner.LEFT_PAREN) {
            //primary -> ( expression )
            this.expression(primaryNode)
            if (!this.matchTokens([Scanner.RIGHT_PAREN])) {
                throw new Error("Missing match ) in expression")
            }
            this.advance()
        }
        return true
    }

}