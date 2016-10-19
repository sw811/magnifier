/**
 * @file 最小长度校验规则
 * @author leon<ludafa@outlook.com>
 * @author wuhuiyao(wuhuiyao@baidu.com)
 */

define(function (require) {

    var ValidityState = require('../ValidityState');
    var ValidateRule = require('../ValidateRule');

    ValidateRule.register('minlength', {

        check: function (value, control) {
            var minLength = this.minLength;
            var result = (value + '').length >= minLength;
            return new ValidityState(
                result,
                this.getMessage(control, result)
            );
        },

        message: {
            invalid: '!{title}长度不能小于!{minLength}'
        }

    });

});
