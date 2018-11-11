define(['jquery'], function($) {
    var handlers = [];

    function bindOn(selector) {
        $(selector).on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            document.execCommand('copy');
        });        
    }

    function copyClipboardHandler(selector) {
        return function(event) {
            if ($(selector).length === 0) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            var response = $(selector).text();
            if (!response) {
                return;
            }

            event.clipboardData.setData('text/plain', response);
            notify();
        };
    }

    function copyFrom(selector) {
        document.addEventListener('copy', copyClipboardHandler(selector));
    }

    function onCopy(handler) {
        handlers.push(handler);
    }

    function notify() {
        handlers.forEach(function(handler) {
            handler();
        });
    }
 
    return {
        bindOn: bindOn,
        copyFrom: copyFrom,
        onCopy: onCopy
    };
});