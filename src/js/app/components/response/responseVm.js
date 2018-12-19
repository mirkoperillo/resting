define(['knockout','jquery','hjls','app/clipboard'],function(ko,$,hjls,clipboard) {

  return function ResponseVm(params) {

    const appVm = params.appVm;
    const response = params.response;

    const callDuration = response.callDuration;
    const callStatus = response.callStatus;
    const headers = response.headers;
    const content = response.content;

    const showHeaders = ko.observable(false);
    const showBody = ko.observable(true);
    const useFormattedBody = ko.observable(true);
    const useRawBody = ko.observable(false);
    const body = ko.observable('');

   const headersPanel = () => {
      showHeaders(true);
      showBody(false);

      // close jquery accordion
      $('#collapseOne').collapse('hide');
    };

    const bodyPanel = () => {
      showBody(true);
      showHeaders(false);
    };

    const formattedBody = () => {
      useFormattedBody(true);
      useRawBody(false);
      if(content().length === 0) {
        body('');
      } else {
        body(JSON.stringify(content(),null,2));
      }
      _highlight();
    };

    const rawBody = () => {
      useFormattedBody(false);
      useRawBody(true);
       if(content().length === 0) {
        body('');
      } else {
        body(JSON.stringify(content()));
      }
      _unhighlight();
    };

    content.subscribe( newValue => {
     if(newValue.length === 0) {
        body('');
     }else if(useFormattedBody()) {
        body(JSON.stringify(newValue,null,2));
        _highlight();
      } else {
        body(JSON.stringify(newValue));
      }
    });

   const _unhighlight = () => {
      $('#highlighted-response').removeClass('hljs');
    };

    const _highlight = () => {
      $('#highlighted-response').each(function(i, block) {
      hljs.highlightBlock(block);
      });
    };

  $(() => {

    clipboard.bindOn('div.copy-n-paste');
    clipboard.copyFrom('#highlighted-response');
    clipboard.onCopy(function() {
      $('.alert').removeClass('hide');
      setTimeout(function () { $('.alert').addClass('hide'); }, 2000);
    });
  });

    return {
      headersPanel,
      bodyPanel,
      rawBody,
      formattedBody,
      showHeaders,
      showBody,
      useFormattedBody,
      useRawBody,

      // response fields
      body,
      callDuration,
      callStatus,
      headers,
    };

  }
});
