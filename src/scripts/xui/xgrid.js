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
        this.options.page.OrderBy = this.options.orderBy;
    };

    XGrid.DEFAULTS = {
        url: '',
        orderBy: '',
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
        height: 'auto',
        cellMinWidth: 50,
        onSuccess: null,
        onError: null,
        template: {
            head: {
                row: '<div class="xgh-row"></div>',
                cell: '<div class="xgh-cell"></div>',
                sort: '<div class="xgh-sort"><a class="asc"><i class="fa-sort-asc"></i></a><a class="desc"><i class="fa-sort-desc"></i></a></div>'
            },
            body: {
                row: '<div class="xgb-row"></div>',
                cell: '<div class="xgb-cell"><div class="xgb-c-content"></div></div>'
            },
            gContainer: '<div class="xg-container"></div>',
            gLeft: '<div class="xg-left"><div class="xg-head">' +
            '<div class="xgh-row"></div></div><div class="hide-scroll"><div class="xg-body"></div></div></div>',
            gRight: '<div class="xg-right"><div class="hide-scroll">' +
            '<div class="xg-head"><div class="xgh-row"></div></div>' +
            '</div><div class="scroll hide-scroll"><div class="xg-body"></div></div></div>',
            page: '<div class="xg-page"><div class="info">显示<b>{{from}}</b>到<b>{{to}}</b>,共<b>{{total}}</b>条</div><ul class="pagination">' +
            '<li><a class="first">&laquo;</a></li><li><a class="prev">&lt;</a></li><li><a class="next">&gt;</a></li>' +
            '<li><a class="last">&raquo;</a></li></ul></div>',
            colResize: '<div class="xg-colResize"></div>'
        }
    };

    XGrid.prototype.init = function () {
        var options = this.options;
        this.gLeft = $(options.template.gLeft);
        this.gRight = $(options.template.gRight);
        this.gContainer = $(options.template.gContainer);
        this.gLeftBody = this.gLeft.find('.xg-body');
        this.gRightBody = this.gRight.find('.xg-body');
        this.gRightHead = this.gRight.find('.xg-head');
        this.scroll = this.gRight.find("div.scroll");

        var lastItem = this.options.colModel[this.options.colModel.length - 1];
        this.cellWidthPercent = typeof lastItem.width === "string" && lastItem.width.indexOf('%') > 0;
        this.$grid.append(
            this.gContainer.append(this.gLeft).append(this.gRight)
        ).addClass('xgrid');

        if (options.width === 'auto') {
            options.width = this.$grid.width() - 2;
        }
        this.buildTable();
    };

    XGrid.prototype.buildTable = function () {
        this.buildHead();
        this.bindEvent();

        if (this.options.autoLoad && this.options.url !== '') {
            this.load(1);
        } else if (this.options.data) {
            this.buildBody();
        }
    };

    XGrid.prototype.buildHead = function () {
        var self = this,
            options = self.options,
            gLeft = self.gLeft,
            gRight = self.gRight,
            gContainer = self.gContainer,
            fixCol = [], col = [];
        $.each(options.colModel, function (i, item) {
            if (item.fix) {
                fixCol.push(item);
            } else {
                col.push(item);
            }
        });
        $.each(fixCol, function (i, item) {
            var $cell = makeCell(item);
            gLeft.find("div.xgh-row").append($cell);
            options.width -= $cell.outerWidth();
        });

        gRight.find('.hide-scroll').andSelf().width(options.width);

        $.each(col, function (i, item) {
            item.width = self.cellWidthPercent ? parseFloat(item.width) * 0.01 * (options.width) : item.width;
            gRight.find('div.xgh-row').append(makeCell(item));
        });

        if (options.height !== 'auto') {
            gContainer.find(".xg-body").parent().height(options.height);
        }

        function makeCell(item) {
            var $cell = $(options.template.head.cell)
                .width(item.width)
                .css("text-align", item.headAlign)
                .html('<span>' + item.display + '</span>')
                .attr("name", item.name);
            if (item.sortable) {
                $cell.append($(options.template.head.sort)).addClass('sortable');
            }
            return $cell;
        }
    };

    XGrid.prototype.buildBody = function () {
        var self = this,
            options = self.options;

        self.gRightBody.empty().width(self.calcRightBodyWidth());
        self.gLeftBody.empty();

        $.each(options.data.rows, function (i, item) {
            var $rowLeft = $(options.template.body.row),
                $rowRight = $(options.template.body.row);
            self.gRightBody.append($rowRight);
            if (options.colModel[0].fix) {
                self.gLeftBody.append($rowLeft);
            }

            for (var j = 0, l = options.colModel.length; j < l; j++) {
                var colModel = options.colModel[j],
                    $cell = $(options.template.body.cell);
                var $row = colModel.fix ? $rowLeft : $rowRight;
                $row.append($cell);
                $cell.css("text-align", item.bodyAlign);
                if (!self.cellContentDiff) {
                    self.cellContentDiff = parseInt($cell.css('padding-left'), 10) * 2 + parseInt($cell.css('border-right-width'), 10);
                }
                $cell.children('.xgb-c-content').html(item[colModel.name]).width(colModel.width - self.cellContentDiff);
            }
        });
        self.buildPage();
        self.buildColReSize();
        self.buildTreeNode();
    };

    XGrid.prototype.buildPage = function () {
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
            $nextli.before("<li><a>" + i + "</a></li>");
        }
        if (end !== pageInfo.pageCount) {
            $nextli.before('<li class="disabled"><a>...</a></li>').before('<li><a>' + (pageInfo.pageCount - 1) + '</a></li>').before('<li><a>' + pageInfo.pageCount + '</a></li>');
        }

        gPage.find('a').each(function () {
            var $this = $(this), $li = $this.parent(), c = $this.attr('class'), page = parseInt($this.text());
            $this.attr('page', page);
            if (page === pageInfo.pageIndex) {
                $li.addClass('active');
            }
            else if (c) {
                if (pageInfo.can[c] === false) {
                    $li.addClass('disabled');
                }
            }
        });
        self.options.page.PageIndex = pageInfo.pageIndex;
        if (self.$grid.find('.xg-page').length === 0) {
            bindEvent();
        }
        self.$grid.find('.xg-page').remove().end().append(gPage);

        function bindEvent() {
            self.$grid.on('click', '.xg-page a:not(.disabled)', function () {
                var $this = $(this), nPage = 0;
                if ($this.hasClass('first')) {
                    nPage = 1;
                } else if ($this.hasClass('prev')) {
                    nPage = pageInfo.pageIndex - 1;
                } else if ($this.hasClass('next')) {
                    nPage = pageInfo.pageIndex + 1;
                } else if ($this.hasClass('last')) {
                    nPage = pageInfo.pageCount;
                } else {
                    nPage = parseInt($this.attr("page"));
                }
                self.load(nPage);
            });
        }
    };

    XGrid.prototype.buildColReSize = function () {
        var self = this,
            options = self.options,
            colResize = $(options.template.colResize),
            gCells = self.gRightHead.children().eq(0).children(":visible"),
            scrollLeft = self.gRight.find('.hide-scroll:eq(0)').scrollLeft(),
            left = -scrollLeft,
            height = self.gRight.height();

        function bindEvent() {
            var info, $document = $(document);
            $document.on('mousedown', 'div.xg-col-drag', function (e) {
                var $this = $(e.target), index = colResize.children().index(e.target);
                info = {
                    startX: e.pageX,
                    target: $this,
                    cell: self.gRightHead.find('.xgh-cell').eq(index),
                    oLeft: parseInt($this.css("left"), 10),
                    n: index,
                    diff: 0
                };
                info.oWidth = info.cell.outerWidth();
                mouseMove();
                mouseUp();
            });
            function mouseUp() {
                $document.on('mouseup.xGridResize', function () {
                    $document.unbind('mousemove.xGridResize');
                    $document.unbind('mouseup.xGridResize');
                    self.gRightBody.width(self.calcRightBodyWidth()).children('.xgb-row').each(function (i, item) {
                        var $bodyCell = $(item).children('.xgb-cell').eq(info.n);
                        $bodyCell.children().outerWidth(info.nWidth - self.cellContentDiff);
                    });
                    colResize.children().not(info.target).each(function () {
                        $(this).css('left', parseInt($(this).css("left"), 10) + info.diff);
                    });
                    self.options.colModel[info.n].width = info.cell.outerWidth();
                });
            }

            function mouseMove() {
                $document.on('mousemove.xGridResize', function (e) {
                    var diff = e.pageX - info.startX,
                        nLeft = info.oLeft + diff,
                        nWidth = info.oWidth + diff;
                    if (nWidth > self.options.cellMinWidth) {
                        info.target.css('left', nLeft);
                        info.cell.outerWidth(nWidth);
                        info.nWidth = nWidth;
                        info.diff = diff;
                    }
                });
            }
        }

        if (self.gRight.find('.xg-colResize').length === 0) {
            self.gRight.prepend(colResize);
            bindEvent();
        }

        colResize = self.gRight.find('.xg-colResize').empty().width(self.gRightHead.outerWidth());

        gCells.each(function () {
            var $cell = $(this), $drag = $('<div class="xg-col-drag"></div>');
            colResize.append($drag);
            left += $cell.outerWidth();
            $drag.css({"left": left - $drag.outerWidth() / 2, "height": height});
        });
    };

    XGrid.prototype.buildTreeNode = function () {
        var self = this,
            options = self.options,
            rows = self.options.data.rows,
            rowsLength = rows.length;
        $.each(options.colModel, function (i, item) {
            if (item.treeNode) {
                self.gRightBody.find('.xgb-row').each(function (j) {
                    var $row = $(this),
                        $cell = $row.children().eq(i),
                        row = self.options.data.rows[j],
                        treeNode = row.treeNode;
                    $cell.addClass('xgb-tree xgb-node-p-' + (treeNode.split('-').length - 1)).attr('treeNode', treeNode);

                    if (j < rowsLength - 1 && rows[j + 1].treeNode.indexOf(treeNode) >= 0) {
                        $cell.addClass('xgb-node-parent').children('.xgb-c-content').prepend("<a class='xgb-node-toggle fa-minus-square'></a>");
                    }
                });
            }
        });
    };

    XGrid.prototype.calcRightBodyWidth = function () {
        var newTotalWidth = this.cellWidthPercent ? 0 : 30;
        this.gRightHead.find(".xgh-row:eq(0)").children(".xgh-cell").each(function () {
            newTotalWidth += $(this).outerWidth();
        });
        return newTotalWidth;
    };

    XGrid.prototype.bindEvent = function () {
        var self = this;
        self.scroll.scroll(function () {
            var $this = $(this);
            self.gRightHead.parent().scrollLeft($this.scrollLeft());
            self.gLeftBody.parent().scrollTop($this.scrollTop());
            self.buildColReSize();
        });

        self.gRightHead.on('click', '.sortable', function () {
            var $this = $(this), $sorts = $this.find('.xgh-sort'), $asc = $sorts.find('.asc'), $desc = $sorts.find('.desc'), sort = '';
            if ($asc.css('visibility') !== "hidden") {
                $asc.css('visibility', 'hidden');
                $desc.css('visibility', 'visible');
                sort = 'desc';
            } else {
                $asc.css('visibility', 'visible');
                $desc.css('visibility', 'hidden');
                sort = 'asc';
            }
            $this.siblings('.sortable').find('.xgh-sort').children().css('visibility', 'visible');
            self.options.page.OrderBy = $this.attr("name") + ' ' + sort;
            self.load();
        });

        self.gRightBody.on('click', 'a.xgb-node-toggle', function () {
            var $this = $(this),
                $cell = $this.closest('.xgb-cell'),
                isOpen = $this.hasClass('fa-minus-square'),
                treeNode = $cell.attr('treeNode'),
                $childRow = self.gRightBody.find('.xgb-cell[treeNode^=' + treeNode + '-]').parent();
            if (isOpen) {
                $this.removeClass('fa-minus-square').addClass('fa-plus-square');
                $childRow.each(function () {
                    if ($(this).css('display') !== 'none') {
                        $(this).hide().data('closedBy', treeNode);
                    }
                });
            } else {
                $this.removeClass('fa-plus-square').addClass('fa-minus-square');
                $childRow.each(function () {
                    if ($(this).data('closedBy') === treeNode) {
                        $(this).show();
                    }
                });
            }
        });
    };

    XGrid.prototype.load = function (pageIndex) {
        var self = this,
            params = self.options.params;
        var param = {
            'PageIndex': pageIndex ? (self.options.page.PageIndex = pageIndex) : self.options.page.PageIndex,
            'PageSize': self.options.page.PageSize,
            'OrderBy': self.options.page.OrderBy
        };
        if (typeof params === "function") {
            params = params();
        }
        if (params.length) {
            $.extend(param, params);
        }
        $.ajax({
            type: 'get',
            url: self.options.url,
            data: param,
            dataType: 'json',
            success: function (data) {
                self.addData(data);
            },
            error: function (XMLHttpRequest, textStatus, errorThrown) {
                try {
                    if (self.options.onError) {
                        self.options.onError(XMLHttpRequest, textStatus, errorThrown);
                    }
                } catch (e) {
                }
            }
        });
    };

    XGrid.prototype.addData = function (data) {
        this.options.data = data;
        this.buildBody();
    };

    function Plugin(option, args) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data('xui.xgrid');
            if (!data) {
                $this.data('xui.xgrid', (data = new XGrid($this, option)));
                data.init();
            }
            if (typeof option === 'string') {
                data[option].call(data, args);
            }
        });
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
