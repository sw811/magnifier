/**
 * @file 放大镜入口
 * @author sunwei11
 */
define(
    function (require) {
        var Magnifier = require('./magnifier');
        var config = {
        };

        config.init = function () {
            new Magnifier({
                main: document.getElementsByClassName('magnifier'),
                datasource: {
                    // m: 'http://demo.lanrenzhijia.com/2015/jqzoom0225/images/01_mid.jpg',
                    // b: 'http://demo.lanrenzhijia.com/2015/jqzoom0225/images/01.jpg'
                    m: '../src/img/02.jpg',
                    b: '../src/img/01.jpg'
                }
            }).render();
        };

        return config;
    }
);
