/**
 * Moye (Zhixin UI)
 * Copyright 2014 Baidu Inc. All rights reserved.
 *
 * @file  放大镜控件
 * @author  sunwei11(sunwei11@baidu.com)
 */


define(
    function (require) {

        var $       = require('jquery');
        var Control = require('moye/Control');
        var painter = require('moye/painter');

        /**
         * 图片预加载函数
         *
         * @param  {string}   url   预加载图片的url
         * @param  {?Function} callback     加载成功的回调函数setTargetPicSize,setZoomPicSize作为传入的回调函数
         * @param  {Function} errorCallback 加载失败的回调函数
         */
        function preLoadImg(url, callback, errorCallback) {
            var img = new Image();
            img.src = url;
            if (img.complete) {
                callback(img);
                return;
            }
            img.onload = function () {
                callback(img);
                img.onload = img.onerror = null;
            };
            img.onerror = function (img) {
                errorCallback && errorCallback(img);
                img.onload = img.onerror = null;
            };
        }

        /**
         * 获得图片尺寸函数
         *
         * @param  {HTMLImgElement} img 图片对象
         * @return {Object}   图片的宽高
         */
        function getPicSize(img) {
            return {
                width: img.width,
                height: img.height
            };
        }

        /**
         * 根据得到的宽高设置中图的尺寸
         *
         * @param {Object} img 图片对象
         */
        function setTargetPicSize(img) {
            this.loadedCount++;
            this.options.targetPicSize = getPicSize(img);
        }

        /**
         * 根据得到的宽高设置大图的尺寸
         *
         * @param {Object} img 图片对象
         */
        function setZoomPicSize(img) {
            this.loadedCount++;
            this.options.zoomPicSize = getPicSize(img);
        }

        /**
         * 图片加载错误的回调函数
         *
         * @param {Object} img 图片对象
         */
        function errorCallback(img) {
            this.addState('error');
        }

        /**
         * 放大镜控件
         *
         * @requires Control
         * @requires painter
         * @exports Magnifier
         * @example
         * new Magnifier({
         *      main: document.getElementsByClassName('magnifier'),
         *      datasource: {
                    m: 'http://demo.lanrenzhijia.com/2015/jqzoom0225/images/01_mid.jpg',
                    b: 'http://demo.lanrenzhijia.com/2015/jqzoom0225/images/01.jpg'
                }
         * }).render();
         */
        var Magnifier = Control.extend({

            /**
             * 控件类型标识
             *
             * @type {string}
             * @private
             */
            type: 'Magnifier',

            /**
             * 控件配置项
             *
             * @name module:Magnifier#options
             * @type {Object}
             * @property {Object} datasource 目标图片和放大图片的来源
             * @property {number} offset.x 放大图片的容器相对于目标图片容器的x轴方向的偏移量，默认338，可定制
             * @property {number} offset.y 放大图片的容器相对于目标图片容器的y轴方向的偏移量，默认0，可定制
             * @property {number} zoomSize.width 放大的图片容器的宽度，相当于放大视窗的宽度，默认400，可定制
             * @property {number} zoomSize.height 放大的图片容器的高度，相当于放大视窗的高度，默认400，可定制
             */
            options: {

                /**
                 * 目标图片和放大图片的来源
                 *
                 * datasource.m 目标图片的来源
                 * datasource.b 大图的来源
                 */

                datasource: {
                    m: 'http://placehold.it/310x252',
                    b: 'http://placehold.it/750x610'
                },

                /**
                 * 放大图片的容器相对于目标图片容器的偏移量
                 *
                 * offset.x 放大图片的容器相对于目标图片容器的x轴方向的偏移量，默认338，可定制
                 * offset.y 放大图片的容器相对于目标图片容器的y轴方向的偏移量，默认0，可定制
                 * @type {Object}
                 */
                offset: {
                    x: 338,
                    y: 0
                },

                /**
                 * 放大的图片容器的尺寸，即放大视窗的宽高
                 *
                 * width 放大的图片容器的宽度，相当于放大视窗的宽度，默认400，可定制
                 * height 放大的图片容器的高度，相当于放大视窗的高度，默认400，可定制
                 * @type {Object}
                 */
                zoomSize: {
                    width: 400,
                    height: 400
                }
            },

            /**
             * 控件初始化
             *
             * @param {Object} options 控件配置项
             * @see module:Magnifier#options
             * @private
             */
            init: function (options) {
                this.$parent(options);
            },

            /**
             * 初始化Magnifier dom
             *
             * @private
             * @override
             */
            initStructure: function () {
                var helper = this.helper;
                var html = helper.getPartHTML('wrapper', 'div', this.getHtml());
                $(this.main).html(html);
            },

            /**
             * 生成Dom过程
             *
             * @private
             * @override
             */
            getHtml: function () {
                var helper = this.helper;
                var markHTML = helper.getPartHTML('mark', 'div',  '')
                    + helper.getPartHTML('middle-pic', 'img', '');
                var zoomHTML = helper.getPartHTML('big-pic', 'img', '');
                return helper.getPartHTML('middle-box', 'div', markHTML)
                    + helper.getPartHTML('big-box', 'div', zoomHTML);
            },

            /**
             * 事件绑定
             *
             * @private
             */
            initEvents: function () {
                var element = '#' + this.helper.getPartId('middle-box');
                this.delegate(this.main, 'mouseenter', element, this.onMouseOver);
                this.delegate(this.main, 'mouseleave', element, this.onMouseOut);
                this.delegate(this.main, 'mousemove', element, this.onLocated);
            },

            /**
             * 鼠标移入事件
             *
             * @param  {event} e 事件对象
             * @private
             */
            onMouseOver: function (e) {
                if (this.loadedCount < 2) {
                    return;
                }
                // 获得放大镜尺寸
                this.updateMarkSize();
                // 显示放大镜以及大图
                $(this.helper.getPart('mark'))
                    .css('display', 'block');
                $(this.helper.getPart('big-box'))
                    .css('display', 'block');
            },

            /**
             * 鼠标移出事件
             *
             * @param  {event} e 事件对象
             * @private
             */
            onMouseOut: function (e) {
                // 隐藏放大镜以及大图
                $(this.helper.getPart('mark'))
                    .css('display', 'none');

                $(this.helper.getPart('big-box'))
                    .css('display', 'none');
            },

            /**
             * 重绘
             *
             * @protected
             * @override
             */
            repaint: painter.createRepaint(
                Control.prototype.repaint,
                {
                    name: ['datasource'],
                    paint: function (conf, datasource) {
                        this.setSrc(datasource);
                    }
                },
                {
                    name: ['offset'],
                    paint: function (conf, offset) {
                        this.setOffset(offset);
                    }
                },
                {
                    name: ['zoomSize'],
                    paint: function (conf, zoomSize) {
                        this.setZoomSize(zoomSize);
                    }
                }
            ),

            /**
             * 设置图片来源
             *
             * @param {Object} datasource 根据datasource设置大图和中图
             * @public
             */
            setSrc: function (datasource) {
                // 每次开始前，先移除图片加载错误的状态
                this.removeState('error');
                this.loadedCount = 0;
                // 设置目标图片src
                $(this.helper.getPart('middle-pic'))
                    .attr('src', datasource.m);
                // 对目标图片进行预加载
                preLoadImg(datasource.m,
                    $.proxy(setTargetPicSize, this),
                    $.proxy(errorCallback, this));
                // 设置大图src
                $(this.helper.getPart('big-pic'))
                    .attr('src', datasource.b);
                // 对大图进行预加载
                preLoadImg(this.datasource.b,
                    $.proxy(setZoomPicSize, this),
                    $.proxy(errorCallback, this));
            },

            /**
             * 设置放大视窗尺寸
             *
             * @param {Object} zoomSize 根据zoomSize设置放大视窗的尺寸
             * @public
             */
            setZoomSize: function (zoomSize) {
                $(this.helper.getPart('big-box')).css(zoomSize);
            },

            /**
             * 根据比例获得放大镜尺寸
             *
             * @private
             */
            updateMarkSize: function () {
                // 获得放大图片的尺寸
                var zoomPicWidth = this.options.zoomPicSize.width;
                var zoomPicHeight = this.options.zoomPicSize.height;

                // 中图与大图的比例
                var scaleX = this.options.targetPicSize.width / zoomPicWidth;
                var scaleY = this.options.targetPicSize.height / zoomPicHeight;

                // 把放大镜的尺寸挂到this.options上
                var markSize = {
                    width: this.options.zoomSize.width * scaleX,
                    height: this.options.zoomSize.height * scaleY
                };
                this.markSize = markSize;
            },

            /**
             * 设置放大视窗与目标元素的偏移量
             *
             * @param {Object} offset 根据offset，设置放大视窗与目标元素的偏移量
             * @public
             */
            setOffset: function (offset) {
                $(this.helper.getPart('big-box')).css({
                    left: offset.x,
                    top: offset.y
                });
            },

            /**
             * 根据放大镜移动的距离，计算大图移动的距离
             *
             * @param  {event} e 事件对象
             * @private
             */
            onLocated: function (e) {
                // 判断是否有图片加载错误状态
                if (this.loadedCount < 2) {
                    return;
                }
                // 鼠标的x,y
                var mouseX = e.pageX;
                var mouseY = e.pageY;

                // main元素的offset
                var offset = $(this.main).offset();
                var mainOffsetX = offset.left;
                var mainOffsetY = offset.top;

                var position = $(this.helper.getPart('middle-pic')).position();
                // 目标元素的offset
                var targetOffsetX = position.left;
                var targetOffsetY = position.top;

                // 放大镜的尺寸
                var markWidth = this.markSize.width;
                var markHeight = this.markSize.height;

                // 放大镜的left和top
                var left = mouseX - mainOffsetX - markWidth / 2;
                var top = mouseY - mainOffsetY - markHeight / 2;
                var targetPicWidth = this.options.targetPicSize.width;
                var targetPicHeight = this.options.targetPicSize.height;
                // 放大镜移动的边界值处理
                if (left < targetOffsetX) {
                    left = targetOffsetX;
                }
                else if (left > (targetPicWidth - markWidth + targetOffsetX)) {
                    left = targetPicWidth - markWidth + targetOffsetX;
                }

                if (top < targetOffsetY) {
                    top = targetOffsetY;
                }
                else if (top > (targetPicHeight - markHeight + targetOffsetY)) {
                    top = targetPicHeight - markHeight + targetOffsetY;
                }

                // 设置放大镜尺寸和位置
                $(this.helper.getPart('mark')).css({
                    width: markWidth,
                    height: markHeight,
                    top: top,
                    left: left
                });

                // 计算放大镜与大图移到的比例关系
                var percentX = (left - targetOffsetX) / (targetPicWidth - markWidth);
                var percentY = (top - targetOffsetY) / (targetPicHeight - markHeight);

                // 设置大图移动的位置
                $(this.helper.getPart('big-pic')).css({
                    top: -percentY * (this.options.zoomPicSize.height - this.zoomSize.height),
                    left: -percentX * (this.options.zoomPicSize.width - this.zoomSize.width)
                });
            },

            /**
             * dispose
             *
             * @private
             */
            dispose: function () {
                var element = '#' + this.helper.getPartId('middle-box');
                this.undelegate(this.main, 'mouseenter', element, this.onMouseOver);
                this.undelegate(this.main, 'mouseleave', element, this.onMouseOut);
                this.undelegate(this.main, 'mousemove', element, this.onLocated);
                this.$parent();
                $(this.main).empty();
            }
        });
        return Magnifier;
    }
);
