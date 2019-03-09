define(['jquery'], function($) {
    var handlers = [];

    function bindOn(selector) {
        $(selector).on('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            document.execCommand('copy');
        });        
    }

    function copyClipboardHandler(contentSelector, copyButtonClass) {
        return function(event) {
            if (!$(event.target).hasClass(copyButtonClass)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            var response = $(contentSelector).text();
            if (!response) {
                return;
            }

            event.clipboardData.setData('text/plain', response);
            notify();
        };
    }

    function copyFrom(contentSelector, copyButtonClass) {
        document.addEventListener('copy', copyClipboardHandler(contentSelector, copyButtonClass));
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