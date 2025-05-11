import { isArr, isFn, isPlainObj, isStr, reduce, FormPath, } from '@formily/shared';
import { untracked, hasCollected } from '@formily/reactive';
import { traverse, traverseSchema, isNoNeedCompileObject, hasOwnProperty, patchStateFormSchema, } from './shared';
import * as acorn from 'acorn';
// Utility function to evaluate acorn AST with a scope
function evaluateExpression(node, scope) {
  // Handle different node types
  switch (node.type) {
    case 'Program': {
      const program = node;
      // For multiple statements, return the value of the last one
      let result;
      for (const statement of program.body) {
        if (statement.type === 'ExpressionStatement') {
          result = evaluateExpression(statement.expression, scope);
        }
      }
      return result;
    }
    case 'ExpressionStatement': {
      const expressionStatement = node;
      return evaluateExpression(expressionStatement.expression, scope);
    }
    case 'BinaryExpression': {
      const binaryNode = node;
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
      const logicalNode = node;
      const left = evaluateExpression(logicalNode.left, scope);
      switch (logicalNode.operator) {
        case '&&': return left && evaluateExpression(logicalNode.right, scope);
        case '||': return left || evaluateExpression(logicalNode.right, scope);
        case '??': return left ?? evaluateExpression(logicalNode.right, scope);
        default: throw new Error(`Unsupported logical operator: ${logicalNode.operator}`);
      }
    }
    case 'UnaryExpression': {
      const unaryNode = node;
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
              : unaryNode.argument.property.name;
            return delete obj[prop];
          }
          return false;
        default: throw new Error(`Unsupported unary operator: ${unaryNode.operator}`);
      }
    }
    case 'Identifier': {
      const identifierNode = node;
      return scope[identifierNode.name];
    }
    case 'Literal': {
      const literalNode = node;
      return literalNode.value;
    }
    case 'CallExpression': {
      const callNode = node;
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
      const memberNode = node;
      const object = evaluateExpression(memberNode.object, scope);
      if (object === null || object === undefined)
        return undefined;
      let property;
      if (memberNode.computed) {
        property = evaluateExpression(memberNode.property, scope);
      }
      else {
        property = memberNode.property.name;
      }
      return object[property];
    }
    case 'ArrayExpression': {
      const arrayNode = node;
      return arrayNode.elements.map(element => element ? evaluateExpression(element, scope) : undefined);
    }
    case 'ObjectExpression': {
      const objectNode = node;
      const obj = {};
      for (const prop of objectNode.properties) {
        if (prop.type === 'Property') {
          let key;
          if (prop.key.type === 'Identifier' && !prop.computed) {
            key = prop.key.name;
          }
          else {
            key = evaluateExpression(prop.key, scope);
          }
          obj[key] = evaluateExpression(prop.value, scope);
        }
        else if (prop.type === 'SpreadElement') {
          const spreadValue = evaluateExpression(prop.argument, scope);
          Object.assign(obj, spreadValue);
        }
      }
      return obj;
    }
    case 'ConditionalExpression': {
      const condNode = node;
      return evaluateExpression(condNode.test, scope)
        ? evaluateExpression(condNode.consequent, scope)
        : evaluateExpression(condNode.alternate, scope);
    }
    case 'ThisExpression': {
      return scope;
    }
    case 'ArrowFunctionExpression': {
      const arrowNode = node;
      return (...args) => {
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
        }
        else {
          // Handle expression body (implicit return)
          return evaluateExpression(arrowNode.body, fnScope);
        }
      };
    }
    case 'FunctionExpression': {
      const funcNode = node;
      const func = (...args) => {
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
      const templateNode = node;
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
      const updateNode = node;
      let value = evaluateExpression(updateNode.argument, scope);
      // Only update if it's a valid reference
      if (updateNode.argument.type === 'Identifier') {
        const name = updateNode.argument.name;
        if (updateNode.operator === '++') {
          value = updateNode.prefix ? ++scope[name] : scope[name]++;
        }
        else if (updateNode.operator === '--') {
          value = updateNode.prefix ? --scope[name] : scope[name]--;
        }
      }
      return value;
    }
    case 'AssignmentExpression': {
      const assignNode = node;
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
          : memberNode.property.name;
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
      const spreadNode = node;
      return evaluateExpression(spreadNode.argument, scope);
    }
    case 'SequenceExpression': {
      const seqNode = node;
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

var ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/;

var Registry = {
  silent: false,
  compile: function (expression, scope) {
    if (scope === void 0) { scope = {}; }

    if (Registry.silent) {
      try {
        // Parse expression with acorn and evaluate it
        const ast = acorn.parse(expression, {
          ecmaVersion: 2022,
          sourceType: 'script',
          // Add any needed acorn plugins here
        });
        return evaluateExpression(ast, scope);
      }
      catch (_a) { }
    }
    else {
      // Parse expression with acorn and evaluate it
      const ast = acorn.parse(expression, {
        ecmaVersion: 2022,
        sourceType: 'script',
        // Add any needed acorn plugins here
      });
      return evaluateExpression(ast, scope);
    }
  },
};
export var silent = function (value) {
    if (value === void 0) { value = true; }
    Registry.silent = !!value;
};
export var registerCompiler = function (compiler) {
    if (isFn(compiler)) {
        Registry.compile = compiler;
    }
};
export var shallowCompile = function (source, scope) {
    if (isStr(source)) {
        var matched = source.match(ExpRE);
        if (!matched)
            return source;
        return Registry.compile(matched[1], scope);
    }
    return source;
};
export var compile = function (source, scope) {
    var seenObjects = [];
    var compile = function (source) {
        if (isStr(source)) {
            return shallowCompile(source, scope);
        }
        else if (isArr(source)) {
            return source.map(function (value) { return compile(value); });
        }
        else if (isPlainObj(source)) {
            if (isNoNeedCompileObject(source))
                return source;
            var seenIndex = seenObjects.indexOf(source);
            if (seenIndex > -1) {
                return source;
            }
            var addIndex = seenObjects.length;
            seenObjects.push(source);
            var results = reduce(source, function (buf, value, key) {
                buf[key] = compile(value);
                return buf;
            }, {});
            seenObjects.splice(addIndex, 1);
            return results;
        }
        return source;
    };
    return compile(source);
};
export var patchCompile = function (targetState, sourceState, scope) {
    traverse(sourceState, function (value, pattern) {
        var compiled = compile(value, scope);
        if (compiled === undefined)
            return;
        var path = FormPath.parse(pattern);
        var key = path.segments[0];
        if (hasOwnProperty.call(targetState, key)) {
            untracked(function () { return FormPath.setIn(targetState, path, compiled); });
        }
    });
};
export var patchSchemaCompile = function (targetState, sourceSchema, scope, demand) {
    if (demand === void 0) { demand = false; }
    traverseSchema(sourceSchema, function (value, path, omitCompile) {
        var compiled = value;
        var collected = hasCollected(function () {
            if (!omitCompile) {
                compiled = compile(value, scope);
            }
        });
        if (compiled === undefined)
            return;
        if (demand) {
            if (collected || !targetState.initialized) {
                patchStateFormSchema(targetState, path, compiled);
            }
        }
        else {
            patchStateFormSchema(targetState, path, compiled);
        }
    });
};
//# sourceMappingURL=compiler.js.map