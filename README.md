# JZ Publish/Subscribe

## NO LONGER UNDER DEVELOPMENT

**This library is no longer supported. If you're looking for an amazing alternative, try [Postal](https://github.com/postaljs/postal.js). It does everything I ever hoped this library would do and more and is a far more robust solution.**

![JZ Publish/Subscribe jQuery Plugin Logo](http://www.joezimjs.com/wp-content/uploads/pub_sub_logo.png "JZ Publish/Subscribe jQuery Plugin Logo")

jQuery has been accused of making us bad JavaScript programmers because it makes it so easy to just throw a plethora of anonymous functions in as callbacks to a plethora of event handlers. This plugin was made in response to those accusers and is offering a means to start being a good JavaScript programmer again by making it simple to use common design patterns to decouple and organize our code. The design pattern this specifically simplifies is the Publish/Subscribe pattern which is essentially equivalent to the Observer pattern. This implementation is very lightweight, simple, and powerful. Use it to your advantage. If you experience any bugs, please [report them as an issue on GitHub](https://github.com/joezimjs/JZ-Publish-Subscribe-jQuery-Plugin/issues "Issue Reporting").

## Table of Contents

- [Download](#download)
- [Dependencies](#dependencies)
- [$.subscribe()](#subscribe)
- [$.unsubscribe()](#unsubscribe)
- [$.publish()](#publish)
- [General Notes](#general-notes)
- [Version History](#version-history)

## Download

JZ Publish/Subscribe is currently on version 1.3\. You can [view the version history here](#versio-history). You may use Github's built in links to download and view the tests or simply clone the repo.

## Dependencies

JZ Publish/Subscribe is dependent on only one thing, and that's jQuery itself. You must be using jQuery version 1.4.3 or higher, which really really shouldn't be a problem.

## $.subscribe()

**`jQuery.subscribe( topics, callback(topic, data)[, context] )`**

- `topics`: A string containing the names of one or more topics to subscribe to, separated by a space.
- `callback(topic, data)`: A function that will be executed when a topic that is subscribed to get published to. `topic` is the topic that was published to that called this callback function. `data` is the data that the publisher provides.
- `context`: Optional object that the callback function will be called on. Inside the callback the `this` keyword will refer to this context object.
- Returns a "handle" that can be used to easily unsubscribe. You can read more about it in the [General Notes](#general-notes).

The subscribe method is quite simple. All you need to do is give the function a topic and a callback. If the topic that you specified gets published to, the callback will be executed (in the context of an empty object or the specified `context`, meaning `this` refers to `{}` or the specified context object). You may include more than one topic to subscribe the callback to just by adding a space and listing another topic. If there are multiple callbacks subscribed to one topic, they will be executed in the order that they were subscribed. See below for example usage of $.subscribe():

```js
// Subscribe to a single topic called 'foo'
var handle = $.subscribe("foo", function (topic, data) {
    console.log(data, topic);
});

// Subscribe to multiple topics at once
// 'foo', 'bar', and 'baz' are three different topics
var handle = $.subscribe("foo bar baz", function (topic, data) {
    console.log(data, topic);
});

// Subscribe with a context
// Callback now has its this keyword assigned to the specified object
var obj = {
    data: 0,
    func: function (topic, data) {
        console.log(data, topic, this.data);
    }
}
var handle = $.subscribe("foo", obj.func, obj);
```

## $.unsubscribe()

**`jQuery.unsubscribe( handle )`**

- `handle`: The handle object gained from a previous `subscribe` call.
- Returns `jQuery`

**`jQuery.unsubscribe( topics[, callbackReference[, context]] )`**

- `topics`: A string containing the names of one or more topics to unsubscribe from, separated by a space.
- `callbackReference`: The reference to a callback that was previous subscribed
- `context`: object that was used as the context in the `$.subscribe()` call
- Returns `jQuery`

`$.unsubscribe` is a little more difficult to explain due to the number of options you have. The first option allows you to just use the handle that you received from calling `$.subscribe` as the only parameter. This will unsubscribe everything that was subscribed in the call that you received the handle from.

Our second option is to specify the topic(s), a reference to a callback that had been previously subscribed, and if a context was used in the subscription you need to specify that same context as well. If you used an anonymous function as the callback for the subscription, then you can retrieve a reference to the callback from the handle: `handle.callback`. The topics are listed in the exact same way they are listed when you subscribe. The space character is the separator between each topic.

The final option for unsubscribing is to just include the topic(s). This will remove every single subscription to those topics in one swoop.

As a final note: since `$.unsubscribe` returns the jQuery object, calls to unsubscribe can be chained together.

```js
// Unsubscribe using the handle gained from calling $.subscribe.
$.unsubscribe(handle);

// Unsubscribe by specifying the topics and callback
$.unsubscribe("foo bar", callback_reference);
// or
$.unsubscribe("foo bar", handle.callback);

// Unsubscribe exactly as above, except with context (if a context was supplied during subscribe)
$.unsubscribe("foo bar", callback_reference, context_obj);
// or
$.unsubscribe("foo bar", handle.callback, handle.context);

// Unsubscribe all callbacks from 1+ topics
$.unsubscribe("foo bar");
```

## $.publish()

**`jQuery.publish( topics[, data] )`**

- `topics`: A string containing the names of one or more topics to publish to, separated by a space.
- `data`: The data to be sent to the subscriber(s)
- Returns `jQuery`

`$.publish` is the function that makes the ability to subscribe useful. Any and all callbacks subscribed to the topic(s) that you publish to will be executed in the order they were subscribed. Optionally you may include a `data` parameter, which is any variable or piece of data that you want your subscribers to have in order for them to do their job properly. This can be in any format - number, string, boolean, object, function, etc - you want it to be, as long as it all fits in one variable. See below for some example code.

```js
// Publish to some topics without any data
$.publish("foo bar");

// Publish to a single topic with some data
$.publish("foo", );
```

## General Notes

**Topics:**
Topics can use any name that can also be used as a property name. Since the topic is always retrieved using the bracket notation (e.g. object["prop"]), as opposed to the dot notation (e.g. object.prop), you are allowed to use a large numbers of characters that aren't legal for variable names, such as slashes ("/") or periods ("."). You cannot, however, use a space (" ") because this is the character that separates multiple topics.

All three functions (subscribe, unsubscribe, and publish) are able to take one or multiple topics (separated by a space).

**Handle:**
The handle that is returned from the $.subscribe function is simply an object with three properties, named "topics", "callback", and "context" that correspond to the three parameters that you sent in (or context will be a blank object if no context was provided):

```js
handle = {
    topics : "the topics you sent in",
    callback : function () {
        // this is the callback function you sent in
    },
    context : contextObjYouSentIn or {}
};
```

**Callback Topic Argument:**
The first argument that the callback receives is the topic in which the function was subscribed and invoked from. This will always be a string containing only one topic, even if the $.publish function is called with multiple topics because the callback will be run once for each individual topic that is published.

## Version History

- **Version 1.4**: ([July 23, 2012 Announcement](http://www.joezimjs.com/news/jz-publish-subscribe-updated-to-1-4/ "JZ Publish/Subscribe Updated to 1.4"))
  - _Bug Fix:_ The feature added in 1.3 for preventing abnormalities during publishing never got applied to `$.subscribe`. The new solution described below solves for both `$.subscribe` and `$.unsubscripe`.
  - _Change:_ The feature specified in the previously listed bug fix was removed. The implementation was sound but ended up being more complicated than necessary. Instead, $.publish will now just clone the array of subscriptions that it is publishing to so that it is not affected by changes to the real subscriptions array.
- **Version 1.3**: ([April 2, 2012 Announcement](http://www.joezimjs.com/news/jz-publishsubscribe-jquery-plugin-version-1-3-released/ "JZ Publish/Subscribe jQuery Plugin Version 1.3 Released"))
  - _Feature:_ Context parameter added to `$.unsubscribe`
  - _Bug Fix:_ `$.unsubscribe` would unsubscribe a subscription if the topic and callback matched, regardless of whether the context was correct. It now checks the context too.
  - _Feature:_ Previously, if a callback unsubscribed something from a topic that was still being published, there would be an error because the subscriptions array shrank but the loop still tried to iterate over an array that still had the old length. Now, when `$.unsubscribe` is called while still publishing, it will queue up the unsubscription to be executed after publishing is finished.
  - _Feature:_ Handle returned from `$.subscribe` now includes a `context` property.
- **Version 1.2**: ([February 4, 2012 Announcement](http://www.joezimjs.com/news/jz-publishsubscribe-version-1-2-released/ "JZ Publish/Subscribe Version 1.2 Released"))
  - _Feature:_ Now `$.subscribe` can be passed an optional context parameter, which will be the object that the callback is called on. If no context is specified, `{}` will be used as the context.
- **Version 1.1.1**
  - _Bug Fix:_ Now `$.unsubscribe` and `$.publish` will always return the jQuery object. Previously they returned `null` when they received invalid arguments.
- **Version 1.1**
  - _Bug Fix:_ When you had multiple copies of the same topic in the string for the `topics` argument, it will no longer subscribe/unsubscribe/publish that topic for each copy.
  - _Feature:_ `$.unsubscribe` and `$.publish` now return the jQuery object to allow chaining.
- **Version 1.0**: ([January 7, 2012 Announcement](http://www.joezimjs.com/javascript/new-jquery-plugin-publish-subscribe/ "New jQuery Plugin: Publish/Subscribe"))
  - Original Release.
