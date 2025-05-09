import { isArr, isFn, isPlainObj, isStr, reduce, FormPath, } from '@formily/shared';
import { untracked, hasCollected } from '@formily/reactive';
import { traverse, traverseSchema, isNoNeedCompileObject, hasOwnProperty, patchStateFormSchema, } from './shared';
import jsep from 'jsep';

// Utility function to evaluate jsep AST with a scope
function evaluateExpression(node, scope) {
  // Handle different node types
  switch (node.type) {
    case 'BinaryExpression':
      var left = evaluateExpression(node.left, scope);
      var right = evaluateExpression(node.right, scope);

      switch (node.operator) {
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
        default: throw new Error("Unsupported binary operator: " + node.operator);
      }

    case 'UnaryExpression':
      var argument = evaluateExpression(node.argument, scope);
      switch (node.operator) {
        case '-': return -argument;
        case '+': return +argument;
        case '!': return !argument;
        case '~': return ~argument;
        default: throw new Error("Unsupported unary operator: " + node.operator);
      }

    case 'Identifier':
      return scope[node.name];

    case 'Literal':
      return node.value;

    case 'CallExpression':
      var callee = evaluateExpression(node.callee, scope);
      var args = [];
      for (var i = 0; i < node.arguments.length; i++) {
        args.push(evaluateExpression(node.arguments[i], scope));
      }
      return callee.apply(null, args);

    case 'MemberExpression':
      var object = evaluateExpression(node.object, scope);
      if (object === null || object === undefined) return undefined;

      var property;
      if (node.computed) {
        property = evaluateExpression(node.property, scope);
      } else {
        property = node.property.name;
      }

      return object[property];

    case 'ArrayExpression':
      var elements = [];
      for (var i = 0; i < node.elements.length; i++) {
        elements.push(evaluateExpression(node.elements[i], scope));
      }
      return elements;

    case 'ObjectExpression':
      var obj = {};
      for (var i = 0; i < node.properties.length; i++) {
        var prop = node.properties[i];
        var key;
        if (prop.key.type === 'Identifier') {
          key = prop.key.name;
        } else {
          key = evaluateExpression(prop.key, scope);
        }
        obj[key] = evaluateExpression(prop.value, scope);
      }
      return obj;

    case 'ConditionalExpression':
      return evaluateExpression(node.test, scope)
        ? evaluateExpression(node.consequent, scope)
        : evaluateExpression(node.alternate, scope);

    case 'ThisExpression':
      return scope;

    case 'Compound':
      // For multiple statements, return the value of the last one
      var result;
      for (var i = 0; i < node.body.length; i++) {
        result = evaluateExpression(node.body[i], scope);
      }
      return result;

    default:
      throw new Error("Unsupported node type: " + node.type);
  }
};

var ExpRE = /^\s*\{\{([\s\S]*)\}\}\s*$/;

var Registry = {
  silent: false,
  compile: function (expression, scope) {
    if (scope === void 0) { scope = {}; }

    if (Registry.silent) {
      try {
        // Parse expression with jsep and evaluate it
        const ast = jsep(expression);
        return evaluateExpression(ast, scope);
      }
      catch (_a) { }
    }
    else {
      // Parse expression with jsep and evaluate it
      const ast = jsep(expression);
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