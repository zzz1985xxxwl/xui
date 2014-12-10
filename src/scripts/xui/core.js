(function($) {
    'use strict';
    var xui = $.xui = {},
        $html = $("html"),
        $win = $(window),
        $doc = $(document);

    xui.utils = {};
    xui.utils.template = function(str, data) {
        var tokens = str.replace(/\n/g, '\\n').replace(/\{\{\{\s*(.+?)\s*\}\}\}/g, "{{!$1}}").split(/(\{\{\s*(.+?)\s*\}\})/g),
            i = 0,
            toc, cmd, prop, val, fn, output = [],
            openblocks = 0;

        while (i < tokens.length) {

            toc = tokens[i];

            if (toc.match(/\{\{\s*(.+?)\s*\}\}/)) {
                i = i + 1;
                toc = tokens[i];
                cmd = toc[0];
                prop = toc.substring(toc.match(/^(\^|\#|\!|\~|\:)/) ? 1 : 0);

                switch (cmd) {
                    case '~':
                        output.push("for(var $i=0;$i<" + prop + ".length;$i++) { var $item = " + prop + "[$i];");
                        openblocks++;
                        break;
                    case ':':
                        output.push("for(var $key in " + prop + ") { var $val = " + prop + "[$key];");
                        openblocks++;
                        break;
                    case '#':
                        output.push("if(" + prop + ") {");
                        openblocks++;
                        break;
                    case '^':
                        output.push("if(!" + prop + ") {");
                        openblocks++;
                        break;
                    case '/':
                        output.push("}");
                        openblocks--;
                        break;
                    case '!':
                        output.push("__ret.push(" + prop + ");");
                        break;
                    default:
                        output.push("__ret.push(escape(" + prop + "));");
                        break;
                }
            } else {
                output.push("__ret.push('" + toc.replace(/\'/g, "\\'") + "');");
            }
            i = i + 1;
        }

        fn = [
            'var __ret = [];',
            'try {',
            'with($data){', (!openblocks ? output.join('') : '__ret = ["Not all blocks are closed correctly."]'), '};',
            '}catch(e){__ret = [e.message];}',
            'return __ret.join("").replace(/\\n\\n/g, "\\n");',
            "function escape(html) { return String(html).replace(/&/g, '&amp;').replace(/\"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');}"
        ].join("\n");

        var func = new Function('$data', fn);
        return data ? func(data) : func;
    };


})(jQuery);
