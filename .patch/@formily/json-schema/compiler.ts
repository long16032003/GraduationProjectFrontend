// @ts-nocheck
import {
  isArr,
  isFn,
  isPlainObj,
  isStr,
  reduce,
  FormPath,
} from '@formily/shared'
import { IGeneralFieldState } from '@formily/core'
import { untracked, hasCollected } from '@formily/reactive'
import {
  traverse,
  traverseSchema,
  isNoNeedCompileObject,
  hasOwnProperty,
  patchStateFormSchema,
} from './shared'
import { ISchema } from './types'
import jsep, { Node, BinaryExpression, UnaryExpression, Identifier, Literal, CallExpression, MemberExpression, ArrayExpression, ObjectExpression, ConditionalExpression, ThisExpression, Compound } from 'jsep';

// Define a type for the scope object
type Scope = Record<string, any>;

// Utility function to evaluate jsep AST with a scope
function evaluateExpression(node: Node, scope: Scope): any {
  // Handle different node types
  switch (node.type) {
    case 'BinaryExpression': {
      const binaryNode = node as BinaryExpression;
      const left = evaluateExpression(binaryNode.left, scope);
      const right = evaluateExpression(binaryNode.right, scope);

      switch (binaryNode.operator) {
        case '+': return left + right;
        case '-': return left - right;
        case '*': return left * right;
        case '/': return left / right;
        case '%': return left % right;
        case '==': return left == right;
        case '===': return left === right;
        case '!=': return left != right;
        case '!==': return left !== right;
        case '<': return left < right;
        case '>': return left > right;
        case '<=': return left <= right;
        case '>=': return left >= right;
        case '&&': return left && right;
        case '||': return left || right;
        default: throw new Error(`Unsupported binary operator: ${binaryNode.operator}`);
      }
    }

    case 'UnaryExpression': {
      const unaryNode = node as UnaryExpression;
      const argument = evaluateExpression(unaryNode.argument, scope);
      switch (unaryNode.operator) {
        case '-': return -argument;
        case '+': return +argument;
        case '!': return !argument;
        case '~': return ~argument;
        default: throw new Error(`Unsupported unary operator: ${unaryNode.operator}`);
      }
    }

    case 'Identifier': {
      const identifierNode = node as Identifier;
      return scope[identifierNode.name];
    }

    case 'Literal': {
      const literalNode = node as Literal;
      return literalNode.value;
    }

    case 'CallExpression': {
      const callNode = node as CallExpression;
      const callee = evaluateExpression(callNode.callee, scope);
      const args: any[] = [];
      for (let i = 0; i < callNode.arguments.length; i++) {
        args.push(evaluateExpression(callNode.arguments[i], scope));
      }
      return callee.apply(null, args);
    }

    case 'MemberExpression': {
      const memberNode = node as MemberExpression;
      const object = evaluateExpression(memberNode.object, scope);
      if (object === null || object === undefined) return undefined;

      let property: string | number;
      if (memberNode.computed) {
        property = evaluateExpression(memberNode.property, scope);
      } else {
        property = (memberNode.property as Identifier).name;
      }

      return object[property];
    }

    case 'ArrayExpression': {
      const arrayNode = node as ArrayExpression;
      const elements: any[] = [];
      for (let i = 0; i < arrayNode.elements.length; i++) {
        elements.push(evaluateExpression(arrayNode.elements[i], scope));
      }
      return elements;
    }

    case 'ObjectExpression': {
      const objectNode = node as ObjectExpression;
      const obj: Record<string | number, any> = {};
      for (let i = 0; i < objectNode.properties.length; i++) {
        const prop = objectNode.properties[i];
        let key: string | number;
        if (prop.key.type === 'Identifier') {
          key = (prop.key as Identifier).name;
        } else {
          key = evaluateExpression(prop.key, scope);
        }
        obj[key] = evaluateExpression(prop.value, scope);
      }
      return obj;
    }

    case 'ConditionalExpression': {
      const condNode = node as ConditionalExpression;
      return evaluateExpression(condNode.test, scope)
        ? evaluateExpression(condNode.consequent, scope)
        : evaluateExpression(condNode.alternate, scope);
    }

    case 'ThisExpression': {
      return scope;
    }

    case 'Compound': {
      const compoundNode = node as Compound;
      // For multiple statements, return the value of the last one
      let result: any;
      for (let i = 0; i < compoundNode.body.length; i++) {
        result = evaluateExpression(compoundNode.body[i], scope);
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
        // Parse expression with jsep and evaluate it
        const ast = jsep(expression);
        return evaluateExpression(ast, scope);
      } catch (_a) {
        //
      }
    } else {
      // Parse expression with jsep and evaluate it
      const ast = jsep(expression);
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
    let collected = hasCollected(() => {
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