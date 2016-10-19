/**
 * @copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file 字符串相关的小工具
 * @author Leon(ludafa@outlook.com)
 */

define(function (require) {

    var $ = require('jquery');

    return {

        /**
         * 生成全局唯一标识
         *
         * @public
         * @method module:lib.guid
         * @return {string} 新的全局唯一标识
         */
        guid: (function () {
            var guidPrefix = 'moye';
            var guid = 0;
            return function () {
                return guidPrefix + '-' + guid++;
            };
        })(),


        /**
         * 将字符串转换成单词首字母大写
         *
         * @public
         * @method module:lib.capitalize
         * @param {string} source 源字符串
         * @return {string}
         */
        capitalize: function (source) {
            return String(source).replace(
                /\b[a-z]/g,
                function (match) {
                    return match.toUpperCase();
                }
            );
        },

        /**
         * 测试是否包含指定字符
         *
         * @public
         * @method module:lib.contains
         * @param {string} source 源字符串
         * @param {string} target 包含的字符串
         * @param {string} seperator 分隔字符
         *
         * @return {boolean} 是否包含的结果
         */
        contains: function (source, target, seperator) {
            seperator = seperator || ' ';
            source = seperator + source + seperator;
            target = seperator + $.trim(target) + seperator;
            return source.indexOf(target) > -1;
        },

        /**
         * 对目标数字进行 0 补齐处理
         *
         * @public
         * @method module:lib.pad
         * @param  {(number | string)} source 需要补齐的数字或字符串
         * @param  {number}            width  补齐后的固定宽度（必须小于32）
         * @return {string}                   补齐后的字符串
         */
        pad: function (source, width) {

            // 把正负号取出来
            var sign = source < 0 ? '-' : '';

            // 我们只针对数字部分做处理
            var str = Math.abs(parseInt(source, 10)) + '';

            // 缓存长度
            var len = str.length;

            width = +width || 2;

            // 如果当前长度不足做一下补全
            // 生成一个10000这样的数字, 0的个数是补全的位数. 然后把1去掉, 接上原有的数字即可.
            if (len < width) {
                str = (1 << (width - len)).toString(2).slice(1) + str;
            }

            return sign + str;
        },

        /**
         * 格式化字符串
         *
         * @public
         * @method module:lib.format
         * @param  {string} template 字符串格式化模板
         * @param  {Object|function(string):string} data 要格式化的模板数据源或自定义数据获取方法
         * @return {string}
         */
        format: function (template, data) {
            var isFunc = $.isFunction(data);
            return template.replace(/(!|\$)\{([\w]+)\}/g, function (all, source, prop) {
                prop = isFunc ? data(prop) : data[prop];
                if (prop == null) {
                    return '';
                }
                return prop;
            });
        }

    };
});
