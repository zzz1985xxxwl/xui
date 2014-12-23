/* ========================================================================
 * Bootstrap: xgrid.js v3.3.0
 * Copyright 2011-2014 XueWenlong, Inc.
 * Licensed under MIT
 * ======================================================================== */

(function ($) {
    'use strict';

    // XGrid CLASS DEFINITION
    // ======================

    var XGrid = function ($this, options) {
        this.$grid = $this;
        this.options = $.extend({}, XGrid.DEFAULTS, options);
    };

    XGrid.DEFAULTS = {
        url: "",
        params: {},
        data: null,//{rows:[],page:1,total:100}
        colModel: [],//{ display: '列1', headAlign: 'center', bodyAlign:'left',name: 'Col1', sortable: true, treeNode: true,fix:true},
        page: {
            PageIndex: 1,
            OrderBy: '',
            PageSize: 10,
            RecordCount: 0,
            show: true
        },
        autoLoad: true,
        width: 'auto',
        height: 200,//or auto
        onSuccess: null,
        onError: null,
        template: {
            head: {
                row: '<div class="xgh-row"></div>',
                cell: '<div class="xgh-cell"></div>'
            },
            body: {
                row: '<div class="xgb-row"></div>',
                cell: '<div class="xgb-cell"></div>'
            },
            gContainer: '<div class="xg-container"></div>',
            gLeft: '<div class="xg-left"><div class="xg-head">' +
                '<div class="xgh-row"></div></div><div class="hide-scroll"><div class="xg-body"></div></div></div>',
            gRight: '<div class="xg-right"><div class="hide-scroll">' +
                '<div class="xg-head"><div class="xgh-row"></div></div>' +
                '</div><div class="scroll hide-scroll"><div class="xg-body"></div></div></div>',
            page: '<div class="xg-page"><div class="info">显示<b>{{from}}</b>到<b>{{to}}</b>,共<b>{{total}}</b>条</div><ul class="pagination">' +
                '<li><a class="first">&laquo;</a></li><li><a class="prev">&lt;</a></li><li><a class="next">&gt;</a></li><li><a class="last">&raquo;</a></li></ul></div>'
        }
    };

    XGrid.prototype.init = function () {
        var options = this.options;
        this.gLeft = $(options.template.gLeft);
        this.gRight = $(options.template.gRight);
        this.gContainer = $(options.template.gContainer);
        this.$grid.append(
            this.gContainer.append(this.gLeft).append(this.gRight)
        ).addClass('xgrid');

        if (options.width === 'auto') {
            options.width = this.$grid.width() - 2;
        }
        this.drawTable();

    };

    XGrid.prototype.drawTable = function () {
        var self = this,
            options = this.options,
            gLeft = this.gLeft,
            gLeftBody = gLeft.find('.xg-body'),
            gRight = this.gRight,
            gRightBody = gRight.find('.xg-body'),
            gRightHead = gRight.find('.xg-head'),
            gContainer = this.gContainer,
            scroll = gRight.find("div.scroll");

        drawHead();

        drawBody();

        bindEvent();

        function drawHead() {
            var fixCol = [], col = [], rowWidth = 0;

            $.each(options.colModel, function (i, item) {
                item.fix ? fixCol.push(item) : col.push(item);
            });
            $.each(fixCol, function (i, item) {
                var $cell = makeCell(item);
                gLeft.find("div.xgh-row").append($cell);
                options.width -= $cell.outerWidth();
            });

            gRight.find('.hide-scroll').width(options.width);

            $.each(col, function (i, item) {
                item.width = typeof item.width === "string" && item.width.indexOf('%') > 0 ? parseFloat(item.width) * 0.01 * (options.width) : item.width;
                gRight.find('div.xgh-row').append(makeCell(item));
                rowWidth += item.width;
            });

            gRightBody.width(rowWidth);
            gRightHead.width(rowWidth + 30);

            if (options.height !== 'auto') {
                gContainer.find(".xg-body").parent().height(options.height);
            }

            function makeCell(item) {
                return $(options.template.head.cell)
                    .width(item.width)
                    .css("text-align", item.headAlign)
                    .html(item.display)
                    .attr("name", item.name);
            }
        }

        function drawBody() {
            gRightBody.empty();
            gLeftBody.empty();
            $.each(options.data.rows, function (i, item) {
                var $rowLeft = $(options.template.body.row)
                    , $rowRight = $(options.template.body.row);
                gRightBody.append($rowRight);
                if (options.colModel[0].fix) {
                    gLeftBody.append($rowLeft);
                }

                for (var j = 0, l = options.colModel.length; j < l; j++) {
                    var colModel = options.colModel[j],
                        $cell = $(options.template.body.cell);
                    var $row = colModel.fix ? $rowLeft : $rowRight;
                    $cell.html(item[colModel.name]).css("text-align", item.bodyAlign).width(colModel.width);
                    $row.append($cell);
                }
            });
            self.drawPage();
        }

        function bindEvent() {
            scroll.scroll(function () {
                gRightHead.parent().scrollLeft($(this).scrollLeft());
                gLeftBody.parent().scrollTop($(this).scrollTop());
            });
        }

        XGrid.prototype.drawTable.drawBody = drawBody;

    };

    XGrid.prototype.drawPage = function () {
        if (!this.options.page.show) {
            return;
        }
        var self = this,
            options = self.options,
            pageInfo = {
                from: (options.data.page - 1) * options.page.PageSize + 1,
                to: options.data.page * options.page.PageSize,
                total: options.data.total,
                pageIndex: options.data.page,
                pageCount: Math.floor(options.data.total / options.page.PageSize)

            },

            prevCount = 3,
            start = 1,
            end = pageInfo.pageCount,
            gPage = $($.xui.utils.template(options.template.page, pageInfo)),
            $nextli = gPage.find("a.next").parent();
        pageInfo.can = {
            first: pageInfo.pageIndex > 1,
            prev: pageInfo.pageIndex > 1,
            last: pageInfo.pageIndex < pageInfo.pageCount,
            next: pageInfo.pageIndex < pageInfo.pageCount
        };
        if ((pageInfo.pageIndex - prevCount) > 3) {
            $nextli.before('<li><a>1</a></li>').before('<li><a>2</a></li>').before('<li><a>3</a></li>').before('<li><a class="disabled">...</a></li>');
            start = pageInfo.pageIndex - prevCount;
        }
        if ((pageInfo.pageIndex + prevCount) + 2 < end) {
            end = pageInfo.pageIndex + prevCount;
        }
        for (var i = start; i <= end; i++) {
            $nextli.before("<li><a page='" + i + "'>" + i + "</a></li>");
        }
        if (end != pageInfo.pageCount) {
            $nextli.before('<li class="disabled"><a>...</a></li>').before('<li><a>' + (pageInfo.pageCount - 1) + '</a></li>').before('<li><a>' + pageInfo.pageCount + '</a></li>');
        }

        gPage.find('a').each(function () {
            var $this = $(this), $li = $this.parent(),c=$this.attr('class'),text=$this.text();
            if (text == pageInfo.pageIndex) {
                $li.addClass('active');
            }
            else if(c){
                if(pageInfo.can[c]===false){
                    $li.addClass('disabled');
                }
            }
        });
        this.$grid.append(gPage);
    };


    XGrid.prototype.reload = function () {

    };

    XGrid.prototype.addData = function (data) {
        this.options.data = data;
        this.drawTable.drawBody();
    };

    function Plugin(option, args) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('xui.xgrid');
            if (!data) {
                $this.data('xui.xgrid', (data = new XGrid($this, option)));
                data.init();
            }
            if (typeof option == 'string') {
                data[option].call(data, args);
            }
        })
    }

    var old = $.fn.xgrid;

    $.fn.xgrid = Plugin;


    // XGrid NO CONFLICT
    // =================

    $.fn.xgrid.noConflict = function () {
        $.fn.xgrid = old;
        return this;
    };

})(jQuery);
