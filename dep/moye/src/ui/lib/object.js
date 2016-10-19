/**
 * @copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 对象相关小工具
 * @author Leon(ludafa@outlook.com)
 */

define(function (require) {

    var $ = require('jquery');

    var TYPE = require('./type');
    var array = require('./array');

    var hasOwnProperty = Object.prototype.hasOwnProperty;

    var exports = {};

    /**
     * 序列化 JSON 对象
     *
     * @public
     * @method module:lib.stringify
     * @param {Object} value 需要序列化的json对象
     * @return {string} 序列化后的字符串
     */
    exports.stringify = window.JSON && TYPE.isFunction(JSON.stringify)
        ? JSON.stringify
        : (function () {
            var special = {
                '\b': '\\b',
                '\t': '\\t',
                '\n': '\\n',
                '\f': '\\f',
                '\r': '\\r',
                '"' : '\\"',
                '\\': '\\\\'
            };
            var escape = function (chr) {
                return special[chr]
                    || '\\u' + ('0000' + chr.charCodeAt(0).toString(16)).slice(-4);
            };
            return function stringify(obj) {
                if (obj && obj.toJSON) {
                    obj = obj.toJSON();
                }
                switch (TYPE.typeOf(obj)) {
                    case 'string':
                        return '"' + obj.replace(/[\x00-\x1f\\"]/g, escape) + '"';
                    case 'array':
                        return '[' + $.map(obj, stringify) + ']';
                    case 'object':
                        var string = [];
                        array.each(obj, function (value, key) {
                            var json = stringify(value);
                            if (json) {
                                string.push(stringify(key) + ':' + json);
                            }
                        });
                        return '{' + string + '}';
                    case 'number':
                    case 'boolean':
                        return '' + obj;
                    case 'null':
                        return 'null';
                }
                return null;
            };
        })();

    /**
     * 深层复制
     *
     * @public
     * @method module:lib.clone
     * @param {*} source 被复制的源
     * @return {*} 复制后的新对象
     */
    exports.clone = function clone(source) {

        var type = $.type(source);

        // 对于数组, 对其内部每个元素都clone一下
        if (type === 'array') {
            return array.map([].slice.call(source), clone);
        }

        // 不是object算了，没啥好复制的
        // 并且，不复制复杂对象. 原因是复杂对象根本没有办法这样复制啊。
        if (type !== 'object' || !$.isPlainObject(source)) {
            return source;
        }

        // 不是PlainObject的统一不拷贝
        // 每个属性都给clone一下.
        var cloned = {};

        for (var name in source) {
            if (source.hasOwnProperty(name)) {
                cloned[name] = clone(source[name]);
            }
        }

        return cloned;

    };

    /**
     * 判断obj是否自拥有指定属性
     *
     * @public
     * @method module:lib.has
     * @param  {*}       obj      目标
     * @param  {name}    property 属性名
     * @return {boolean}
     */
    exports.has = function (obj, property) {
        return obj != null && hasOwnProperty.call(obj, property);
    };

    /**
     * 深层合并
     *
     * 将source的自有属性合并到target对象上
     *
     * @public
     * @method module:lib.extend
     * @param  {Object} target 目标对象
     * @return {Object}
     */
    exports.extend = function extend(target) {
        target = target || {};
        var sources = array.slice(arguments, 1);

        for (var i = 0, len = sources.length; i < len; i++) {

            var source = sources[i];

            if (!source) {
                continue;
            }

            /* eslint guard-for-in: 0 */
            for (var name in source) {

                var sourceValue = source[name];

                // 各种不继续的情况
                if (
                    // 自己merge到自己没天理
                    sourceValue === target
                    // 不是source的自有属性
                    || !exports.has(source, name)
                    // 忽略undefined属性
                    || TYPE.isUndefined(sourceValue)
                ) {
                    continue;
                }

                var isArray = $.isArray(sourceValue);

                // 如果不是这两种类型的source值, 直接给值就好了
                if (!$.isPlainObject(sourceValue) && !isArray) {
                    target[name] = sourceValue;
                    continue;
                }

                // 这里要判断是否为target的自有属性, 如果不是自有属性设为null, 后续生成相应的新对象
                // 否则这里就可能取到原型链上的对象, 结果把source的属性合并到原型上去了...
                var targetValue = exports.has(target, name) ? target[name] : null;

                // 如果target值恰好与source值类型一致, 那就原地merge,
                // 否则生成新的对象, 类型与sourceValue一致
                if (isArray) {
                    targetValue = targetValue && $.isArray(targetValue)
                        ? targetValue
                        : [];
                }
                else {
                    targetValue = targetValue && $.isPlainObject(targetValue)
                        ? targetValue
                        : {};
                }

                target[name] = extend(targetValue, sourceValue);
            }

        }

        return target;
    };

    /**
     * 将对象解析成 query 字符串
     *
     * @public
     * @method module:lib.toQueryString
     * @param {Object}  object 需要解析的 JSON 对象
     * @param {string}  base   属性前缀...
     * @return {string}        解析结果字符串，其中值将被URI编码
     */
    exports.toQueryString = function (object, base) {

        var queryString = array.reduce(
            object,
            function (queryString, value, key) {
                var result;

                if (base) {
                    key = base + '[' + key + ']';
                }

                switch (TYPE.typeOf(value)) {
                    case 'object':
                        result = exports.toQueryString(value, key);
                        break;
                    case 'array':
                        var qs = {};
                        var i = value.length;
                        while (i--) {
                            qs[i] = value[i];
                        }
                        result = exports.toQueryString(qs, key);
                        break;
                    default:
                        result = key + '=' + encodeURIComponent(value);
                        break;
                }
                if (value != null) {
                    queryString.push(result);
                }
                return queryString;
            },
            []
        );

        return queryString.join('&');
    };

    return exports;

});
