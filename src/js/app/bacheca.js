define([],function() {
  let subscribers = {};

  const subscribe = (channel, listener) => {
    if(!subscribers[channel]) {
      subscribers[channel] = [];
    }
    subscribers[channel].push(listener);
  };

  const publish = (channel, data = {}) => {
    const publishedOnChannel = subscribers[channel];
    if(publishedOnChannel) {
      publishedOnChannel.forEach(listener => listener(data));
    }
  };

  return {
    subscribe,
    publish
  };

});
