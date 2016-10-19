/**
 * @file 测试case
 * @author sunwei11
 */

define(function (require) {
    var $ = require('jquery');
    var Magnifier = require('ui/Magnifier');
    var magnifier;
    beforeEach(function () {
        document.body.insertAdjacentHTML(
            'beforeEnd', ''
                + '<div id="magnifier"></div>'
        );

        magnifier = new Magnifier({
            main: $('#magnifier'),
            datasource: {
                m: './img/02.jpg',
                b: './img/01.jpg'
            }

        });
        magnifier.render();
    });


    afterEach(function () {
        magnifier.dispose();
        $('#magnifier').remove();
    });

    describe('基本接口', function () {

        it('控件类型', function () {
            expect(magnifier.type).toBe('Magnifier');
        });


        it('datasource', function () {
            expect(magnifier.datasource.m).not.toBe(null);
            expect(magnifier.datasource.b).not.toBe(null);
        });
        it('offset', function () {
            expect(magnifier.offset.x).not.toBe(null);
            expect(magnifier.offset.y).not.toBe(null);
        });
        it('setSrc 设置图片来源', function () {
            var datasource = {
                m: 'http://placehold.it/310x252',
                b: 'http://placehold.it/750x610'
            };
            magnifier.setSrc(datasource);
            var middle = $('.ui-magnifier-middle-pic').attr('src');
            var big = $('.ui-magnifier-big-pic').attr('src');

            expect(middle).toBe(datasource.m);
            expect(big).toBe(datasource.b);
        });
        it('setOffset 设置放大视窗的位置', function () {
            expect(magnifier.offset.x).not.toBe(null);
            expect(magnifier.offset.y).not.toBe(null);

            var offset = {

                x: 338,

                y: 0
            };

            magnifier.setOffset(offset);

            var bOffsetX = $('.ui-magnifier-big-box').css('left');
            var bOffsetY = $('.ui-magnifier-big-box').css('top');

            expect(parseInt(bOffsetX, 10)).toBe(offset.x);
            expect(parseInt(bOffsetY, 10)).toBe(offset.y);

        });
        it('setOffset 设置放大视窗的尺寸', function () {
            expect(magnifier.zoomSize.width).not.toBe(null);
            expect(magnifier.zoomSize.height).not.toBe(null);

            var zoomSize = {
                width: 400,
                height: 400
            };

            magnifier.setZoomSize(zoomSize);

            var bSizeW = $('.ui-magnifier-big-box').width();
            var bSizeH= $('.ui-magnifier-big-box').height();

            expect(bSizeW).toBe(zoomSize.width);
            expect(bSizeH).toBe(zoomSize.height);

        });
        it('事件接口', function (done) {
            var datasource = {
                m: './img/02.jpg',
                b: './img/01.jpg'
            };
            var img = new Image();
            img.src = './img/01.jpg';
            img.onload = function () {
                img = new Image();
                img.src = './img/02.jpg';
                img.onload = function () {

                    var targetBox = $('.ui-magnifier-middle-box');
                    var mark = $('.ui-magnifier-mark');
                    var bigBox = $('.ui-magnifier-big-box');
                    var bigPic = $('.ui-magnifier-big-pic');
                    $(targetBox).trigger('mouseover');
                    expect($(mark).css('display')).toBe('block');
                    expect($(bigBox).css('display')).toBe('block');

                    $(targetBox).trigger('mouseout');
                    expect($(mark).css('display')).toBe('none');
                    expect($(bigBox).css('display')).toBe('none');

                    $(targetBox).trigger('mousemove');
                    $(mark).css('left', 30);
                    $(mark).css('top', 30);
                    expect($(bigPic).css('top')).toBe('9.68254');
                    expect($(bigPic).css('left')).toBe('-60.4839');
                    done();
                };
            };


        });

    });
})
