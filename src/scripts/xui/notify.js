/* ========================================================================
 * Bootstrap: notify.js v3.3.0
 * http://getbootstrap.com/javascript/#notify
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function($) {
    'use strict';

    // Notify CLASS DEFINITION
    // ======================

    var Notify = function(options) {

        this.options = $.extend({}, Notify.DEFAULTS, options);

        this.$html = $($.xui.utils.template(this.options.template, {
            type: this.options.type,
            text: this.options.text
        }));

        this.isTop = this.options.position.indexOf("top") >= 0;
    };

    Notify.DEFAULTS = {
        position: "top-center",
        duration: 4000,
        type: "info",
        text: "",
        template: "<div class='notify-wrap'><div class='alert alert-{{type}} alert-dismissible' role='alert'>" +
            "<button type='button' class='close' data-dismiss='alert'><span aria-hidden=true>&times;</span><span class=sr-only>Close</span></button>" +
            "{{text}}</div></div>"
    };

    Notify.VERSION = '3.3.0';

    Notify.prototype.show = function() {
        var $body = $("body"),
            options = this.options,
            notifyClass = "notify-" + options.position,
            $container = $body.children("div." + notifyClass),
            height;

        if ($container.length === 0) {
            $container = $("<div class='notify " + notifyClass + "'></div>");
            $body.append($container);
        }
        $container[this.isTop ? "prepend" : "append"](this.$html.css({
            "opacity": 0,
            "position": "absolute",
            "left": "-3000px"
        }));

        height = this.$html.height();
        this.$html.css({
            "position": "static",
            "height": 0
        }).animate({
            "opacity": 1,
            "height": height
        }, 500);

        this.autoClose();
    };

    Notify.prototype.autoClose = function() {
        function settimer(t) {
            timer = setTimeout($.proxy(t.close, t), t.options.duration);
        }

        var timer, self = this;
        settimer(self);
        self.$html.on("mouseover", function() {
            clearTimeout(timer);
        }).on("mouseout", function() {
            settimer(self);
        });
    };

    Notify.prototype.close = function() {
        var $html = this.$html;
        $html.animate({"opacity":0,"height":0}, 500);
    };

    function Plugin(option) {
        var data = new Notify(option);
        data.show();
    }

    var old = $.notify;

    $.notify = Plugin;


    // Notify NO CONFLICT
    // =================

    $.notify.noConflict = function() {
        $.notify = old;
        return this;
    };

})(jQuery);
