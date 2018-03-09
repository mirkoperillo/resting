define(function(){
  
  const makeResponse = ({content = {}, headers = [],status,duration = 0}) => ({content,headers,status,duration});
  
  const parseHeaders = headers =>
      headers.trim().split('\n')
        .map(header =>
          header.split(':')
            .map(h => h.trim()))
        .map(headerFields => ({ name: headerFields[0], value: headerFields[1] }));
  
  
  return {
    makeResponse: makeResponse,
    parseHeaders: parseHeaders,
  }
})
