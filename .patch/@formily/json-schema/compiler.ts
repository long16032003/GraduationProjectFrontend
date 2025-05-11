// @ts-nocheck
import { FormPath, isArr, isFn, isPlainObj, isStr, reduce } from '@formily/shared';
import { IGeneralFieldState } from '@formily/core';
import { hasCollected, untracked } from '@formily/reactive';
import { hasOwnProperty, isNoNeedCompileObject, patchStateFormSchema, traverse, traverseSchema } from './shared';
import { ISchema } from './types';
import * as acorn from 'acorn';
import * as ESTree from 'estree';

// Define a type for the scope object
type Scope = Record<string, any>;

// Utility function to evaluate acorn AST with a scope
function evaluateExpression(node: ESTree.Node, scope: Scope): any {
  // Handle different node types
  switch (node.type) {
    case 'Program': {
      const program = node as ESTree.Program;
      // For multiple statements, return the value of the last one
      let result: any;
      for (const statement of program.body) {
        if (statement.type === 'ExpressionStatement') {
          result = evaluateExpression(statement.expression, scope);
        }
      }
      return result;
    }

    case 'ExpressionStatement': {
      const expressionStatement = node as ESTree.ExpressionStatement;
      return evaluateExpression(expressionStatement.expression, scope);
    }

    case 'BinaryExpression': {
      const binaryNode = node as ESTree.BinaryExpression;
      const left = evaluateExpression(binaryNode.left, scope);
      const right = evaluateExpression(binaryNode.right, scope);

      switch (binaryNode.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '%': return left % right;
        case '<': return left < right;
        case '>': return left > right;
        case '<=': return left <= right;
        case '>=': return left >= right;
        case '==': return left == right;
        case '!=': return left != right;
        case '===': return left === right;
        case '!==': return left !== right;
        case '&': return left & right;
        case '|': return left | right;
        case '^': return left ^ right;
        case '<<': return left << right;
        case '>>': return left >> right;
        case '>>>': return left >>> right;
        case 'in': return left in right;
        case 'instanceof': return left instanceof right;
        default: throw new Error(`Unsupported binary operator: ${binaryNode.operator}`);
      }
    }

    case 'LogicalExpression': {
      const logicalNode = node as ESTree.LogicalExpression;
      const left = evaluateExpression(logicalNode.left, scope);

      switch (logicalNode.operator) {
        case '&&': return left && evaluateExpression(logicalNode.right, scope);
        case '||': return left || evaluateExpression(logicalNode.right, scope);
        case '??': return left ?? evaluateExpression(logicalNode.right, scope);
        default: throw new Error(`Unsupported logical operator: ${logicalNode.operator}`);
      }
    }

    case 'UnaryExpression': {
      const unaryNode = node as ESTree.UnaryExpression;
      const argument = evaluateExpression(unaryNode.argument, scope);
      
      switch (unaryNode.operator) {
        case '-': return -argument;
        case '+': return +argument;
        case '!': return !argument;
        case '~': return ~argument;
        case 'typeof': return typeof argument;
        case 'void': return void argument;
        case 'delete': 
          if (unaryNode.argument.type === 'MemberExpression') {
            const obj = evaluateExpression(unaryNode.argument.object, scope);
            const prop = unaryNode.argument.computed 
              ? evaluateExpression(unaryNode.argument.property, scope)
              : (unaryNode.argument.property as ESTree.Identifier).name;
            return delete obj[prop];
          }
          return false;
        default: throw new Error(`Unsupported unary operator: ${unaryNode.operator}`);
      }
    }

    case 'Identifier': {
      const identifierNode = node as ESTree.Identifier;
      return scope[identifierNode.name];
    }

    case 'Literal': {
      const literalNode = node as ESTree.Literal;
      return literalNode.value;
    }

    case 'CallExpression': {
      const callNode = node as ESTree.CallExpression;
      const callee = evaluateExpression(callNode.callee, scope);
      if (typeof callee !== 'function') {
        throw new Error(`${callNode.callee.type} is not a function`);
      }
      
      const args = callNode.arguments.map(arg => evaluateExpression(arg, scope));
      
      // Handle method calls (when callee is a member expression)
      if (callNode.callee.type === 'MemberExpression') {
        const object = evaluateExpression(callNode.callee.object, scope);
        return callee.apply(object, args);
      }
      
      // eslint-disable-next-line prefer-spread
      return callee.apply(null, args);
    }

    case 'MemberExpression': {
      const memberNode = node as ESTree.MemberExpression;
      const object = evaluateExpression(memberNode.object, scope);
      if (object === null || object === undefined) return undefined;

      let property: string | number;
      if (memberNode.computed) {
        property = evaluateExpression(memberNode.property, scope);
      } else {
        property = (memberNode.property as ESTree.Identifier).name;
      }

      return object[property];
    }

    case 'ArrayExpression': {
      const arrayNode = node as ESTree.ArrayExpression;
      return arrayNode.elements.map(element => 
        element ? evaluateExpression(element, scope) : undefined
      );
    }

    case 'ObjectExpression': {
      const objectNode = node as ESTree.ObjectExpression;
      const obj: Record<string | number | symbol, any> = {};
      
      for (const prop of objectNode.properties) {
        if (prop.type === 'Property') {
          let key: string | number | symbol;
          
          if (prop.key.type === 'Identifier' && !prop.computed) {
            key = prop.key.name;
        } else {
          key = evaluateExpression(prop.key, scope);
        }

          obj[key] = evaluateExpression(prop.value, scope);
        } else if (prop.type === 'SpreadElement') {
          const spreadValue = evaluateExpression(prop.argument, scope);
          Object.assign(obj, spreadValue);
      }
      }
      
      return obj;
    }

    case 'ConditionalExpression': {
      const condNode = node as ESTree.ConditionalExpression;
      return evaluateExpression(condNode.test, scope)
        ? evaluateExpression(condNode.consequent, scope)
        : evaluateExpression(condNode.alternate, scope);
    }

    case 'ThisExpression': {
      return scope;
    }

    case 'ArrowFunctionExpression': {
      const arrowNode = node as ESTree.ArrowFunctionExpression;
      return (...args: any[]) => {
        // Create a new scope with arguments
        const fnScope = { ...scope };
        
        // Handle parameters
        arrowNode.params.forEach((param, index) => {
          if (param.type === 'Identifier') {
            fnScope[param.name] = args[index];
          }
          // Additional handling for destructuring patterns could be added here
        });
        
        // Execute function body
        if (arrowNode.body.type === 'BlockStatement') {
          // Handle block body with multiple statements
          const bodyScope = { ...fnScope };
          for (const statement of arrowNode.body.body) {
            if (statement.type === 'ReturnStatement' && statement.argument) {
              return evaluateExpression(statement.argument, bodyScope);
            }
            // Execute each statement (limited support)
            if (statement.type === 'ExpressionStatement') {
              evaluateExpression(statement.expression, bodyScope);
            }
          }
          return undefined;
        } else {
          // Handle expression body (implicit return)
          return evaluateExpression(arrowNode.body, fnScope);
        }
      };
    }

    case 'FunctionExpression': {
      const funcNode = node as ESTree.FunctionExpression;
      const func = (...args: any[]) => {
        // Create a new scope with arguments
        const fnScope = { ...scope };
        
        // Handle parameters
        funcNode.params.forEach((param, index) => {
          if (param.type === 'Identifier') {
            fnScope[param.name] = args[index];
          }
          // Additional handling for destructuring patterns could be added here
        });
        
        // Execute function body
        if (funcNode.body.type === 'BlockStatement') {
          const bodyScope = { ...fnScope };
          for (const statement of funcNode.body.body) {
            if (statement.type === 'ReturnStatement' && statement.argument) {
              return evaluateExpression(statement.argument, bodyScope);
            }
            // Limited support for other statements
            if (statement.type === 'ExpressionStatement') {
              evaluateExpression(statement.expression, bodyScope);
            }
          }
        }
        return undefined;
      };
      
      return func;
    }

    case 'TemplateLiteral': {
      const templateNode = node as ESTree.TemplateLiteral;
      let result = '';
      
      for (let i = 0; i < templateNode.expressions.length; i++) {
        result += templateNode.quasis[i].value.raw;
        result += String(evaluateExpression(templateNode.expressions[i], scope));
      }
      
      // Add the final quasi
      result += templateNode.quasis[templateNode.quasis.length - 1].value.raw;
      
      return result;
    }

    case 'UpdateExpression': {
      const updateNode = node as ESTree.UpdateExpression;
      let value = evaluateExpression(updateNode.argument, scope);
      
      // Only update if it's a valid reference
      if (updateNode.argument.type === 'Identifier') {
        const name = updateNode.argument.name;
        if (updateNode.operator === '++') {
          value = updateNode.prefix ? ++scope[name] : scope[name]++;
        } else if (updateNode.operator === '--') {
          value = updateNode.prefix ? --scope[name] : scope[name]--;
        }
      }
      
      return value;
    }

    case 'AssignmentExpression': {
      const assignNode = node as ESTree.AssignmentExpression;
      const right = evaluateExpression(assignNode.right, scope);
      
      // Handle simple identifier assignment
      if (assignNode.left.type === 'Identifier') {
        const name = assignNode.left.name;
        
        switch (assignNode.operator) {
          case '=': return scope[name] = right;
          case '+=': return scope[name] += right;
          case '-=': return scope[name] -= right;
          case '*=': return scope[name] *= right;
          case '/=': return scope[name] /= right;
          case '%=': return scope[name] %= right;
          case '**=': return scope[name] **= right;
          case '<<=': return scope[name] <<= right;
          case '>>=': return scope[name] >>= right;
          case '>>>=': return scope[name] >>>= right;
          case '|=': return scope[name] |= right;
          case '^=': return scope[name] ^= right;
          case '&=': return scope[name] &= right;
          case '&&=': return scope[name] &&= right;
          case '||=': return scope[name] ||= right;
          case '??=': return scope[name] ??= right;
          default: throw new Error(`Unsupported assignment operator: ${assignNode.operator}`);
        }
      }
      
      // Handle property assignment
      if (assignNode.left.type === 'MemberExpression') {
        const memberNode = assignNode.left;
        const object = evaluateExpression(memberNode.object, scope);
        const property = memberNode.computed 
          ? evaluateExpression(memberNode.property, scope)
          : (memberNode.property as ESTree.Identifier).name;
        
        switch (assignNode.operator) {
          case '=': return object[property] = right;
          case '+=': return object[property] += right;
          case '-=': return object[property] -= right;
          case '*=': return object[property] *= right;
          case '/=': return object[property] /= right;
          case '%=': return object[property] %= right;
          default: throw new Error(`Unsupported assignment operator: ${assignNode.operator}`);
        }
      }
      
      throw new Error(`Unsupported left-hand side in assignment: ${assignNode.left.type}`);
    }

    case 'SpreadElement': {
      const spreadNode = node as ESTree.SpreadElement;
      return evaluateExpression(spreadNode.argument, scope);
    }

    case 'SequenceExpression': {
      const seqNode = node as ESTree.SequenceExpression;
      let result;
      for (const expr of seqNode.expressions) {
        result = evaluateExpression(expr, scope);
      }
      return result;
    }

    default:
      throw new Error(`Unsupported node type: ${node.type}`);
  }
}

const ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/
const Registry = {
  silent: false,
  compile(expression: string, scope = {}) {
    if (Registry.silent) {
      try {
        // Parse expression with acorn and evaluate it
        const ast = acorn.parse(expression, {
          ecmaVersion: 2022,
          sourceType: 'script',
          // Add any needed acorn plugins here
        });
        return evaluateExpression(ast, scope);
      } catch (_a) {
        //
      }
    } else {
      // Parse expression with acorn and evaluate it
      const ast = acorn.parse(expression, {
        ecmaVersion: 2022,
        sourceType: 'script',
        // Add any needed acorn plugins here
      });
      return evaluateExpression(ast, scope);
    }
  },
}

export const silent = (value = true) => {
  Registry.silent = !!value
}

export const registerCompiler = (
  compiler: (expression: string, scope: any) => any
) => {
  if (isFn(compiler)) {
    Registry.compile = compiler
  }
}

export const shallowCompile = <Source = any, Scope = any>(
  source: Source,
  scope?: Scope
) => {
  if (isStr(source)) {
    const matched = source.match(ExpRE)
    if (!matched) return source
    return Registry.compile(matched[1], scope)
  }
  return source
}

export const compile = <Source = any, Scope = any>(
  source: Source,
  scope?: Scope
): any => {
  const seenObjects = []
  const compile = (source: any) => {
    if (isStr(source)) {
      return shallowCompile(source, scope)
    } else if (isArr(source)) {
      return source.map((value: any) => compile(value))
    } else if (isPlainObj(source)) {
      if (isNoNeedCompileObject(source)) return source
      const seenIndex = seenObjects.indexOf(source)
      if (seenIndex > -1) {
        return source
      }
      const addIndex = seenObjects.length
      seenObjects.push(source)
      const results = reduce(
        source,
        (buf, value, key) => {
          buf[key] = compile(value)
          return buf
        },
        {}
      )
      seenObjects.splice(addIndex, 1)
      return results
    }
    return source
  }
  return compile(source)
}

export const patchCompile = (
  targetState: IGeneralFieldState,
  sourceState: any,
  scope: any
) => {
  traverse(sourceState, (value, pattern) => {
    const compiled = compile(value, scope)
    if (compiled === undefined) return
    const path = FormPath.parse(pattern)
    const key = path.segments[0]
    if (hasOwnProperty.call(targetState, key)) {
      untracked(() => FormPath.setIn(targetState, path, compiled))
    }
  })
}

export const patchSchemaCompile = (
  targetState: IGeneralFieldState,
  sourceSchema: ISchema,
  scope: any,
  demand = false
) => {
  traverseSchema(sourceSchema, (value, path, omitCompile) => {
    let compiled = value
    const collected = hasCollected(() => {
      if (!omitCompile) {
        compiled = compile(value, scope)
      }
    })
    if (compiled === undefined) return
    if (demand) {
      if (collected || !targetState.initialized) {
        patchStateFormSchema(targetState, path, compiled)
      }
    } else {
      patchStateFormSchema(targetState, path, compiled)
    }
  })
}