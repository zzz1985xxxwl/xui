/* ========================================================================
 * Bootstrap: nav.js v3.3.0
 * http://getbootstrap.com/javascript/#nav
 * ========================================================================
 * Copyright 2011-2014 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */

(function($) {
    'use strict';

    // NAV CLASS DEFINITION
    // ======================

    var dismiss = '[data-dismiss="nav"]';
    var Nav = function() {

    };

    Nav.VERSION = '3.3.0';

    Nav.TRANSITION_DURATION = 150;

    Nav.prototype.init = function(el) {
        var $el = $(el);
        $el.on("click", "a", function() {
            var $this = $(this),
                $li = $this.parent("li"),
                $sub = $li.find("ul.sub"),
                $arrow = $li.find("i.fa-angle-left"),
                $nav = $this.closest(".nav");
            if ($nav.hasClass("nav-tree-closed")) {
                if ($sub.length === 0) {
                    $this.closest("li.parent").addClass("active").siblings().removeClass("active");
                };
                return;
            }
            if ($sub.length > 0) {
                if ($sub.css("display") === "none") {
                    $sub.slideDown(Nav.TRANSITION_DURATION);
                    $li.addClass("active");
                    $arrow.addClass("a-rotate-neg-90");
                } else {
                    $sub.slideUp(Nav.TRANSITION_DURATION);
                    $li.removeClass("active");
                    $arrow.removeClass("a-rotate-neg-90");
                }
            } else {
                $nav.find("li").removeClass("on");
                $li.addClass("on");
            }
        });

    };


    // Nav PLUGIN DEFINITION
    // =======================

    function Plugin() {
        return this.each(function() {
            var $this = $(this);
            Nav.prototype.init($this);
        });
    }

    var old = $.fn.nav;

    $.fn.nav = Plugin;
    $.fn.nav.Constructor = Nav;


    // Nav NO CONFLICT
    // =================

    $.fn.nav.noConflict = function() {
        $.fn.nav = old;
        return this;
    };


    // Nav DATA-API
    // ==============
    $(document).ready(function() {
        Nav.prototype.init($(dismiss));
    });
})(jQuery);
