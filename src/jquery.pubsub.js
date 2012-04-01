/**
 * Copyright (c) 2012 Joseph Zimmerman http://joezimjs.com
 * 
 * This script is licensed under the 
 * GNU General Public License, version 3 (GPL-3.0)
 * http://www.opensource.org/licenses/gpl-3.0.html
 *
 */

/**
 * Joe Zim's jQuery Pub/Sub Plugin
 * Version: 1.3
 * Supported jQuery Versions: 1.4.3+
 * 
 * This script adds publish and subscribe functionality to jQuery's utility
 * function arsenal. There are numerous plugins that bring in this functionality
 * but this plugin brings in the idea from jQuery's event binding functions to
 * allow you to subscribe to multiple topics just by separating the topic names
 * with a space. See the examples below.
 *
 * EXAMPLES
 * 
 * Subscribing:
 *	// Subscribe to a single topic called 'foo'
 *	// The callback function receives two arguments: 
 *	//   data: any data that the publisher sent
 *	//   topic: the topic that was published to that called the function
 *	// Note: $.subscribe returns a 'handle' that can be used to unsubscribe easily
 *	var handle = $.subscribe("foo", function (topic, data) {
 *		console.log(data, topic);
 *	});
 *
 *
 *	// Subscribe to multiple topics at once
 *	// 'foo', 'bar', and 'baz' are three different topics
 *	var handle = $.subscribe("foo bar baz", function (topic, data) {
 *		console.log(data, topic);
 *	});
 *
 *
 *	// Subscribe with a context
 *	// Callback now has its this variable assigned to the specified object
 *	var obj = {
 *		data: 0,
 *		func: function (topic, data) {
 *			console.log(data, topic, this.data);
 *		}
 *	}
 *	var handle = $.subscribe("foo", obj.func, obj);
 *
 *
 * Unsubscribing:
 *	// Unsubscribe using the handle gained from calling $.subscribe.
 *	// The callback that was sent into the $.subscribe call that you retrieved the
 *	// handle from will be unsubscribed from all of the topics subscribed to
 *	$.unsubscribe(handle);
 *
 *
 *	// Unsubscribe by specifying the topics, callback, and context (if one was
 *	// when subscribed).
 *	// Note: if you use an anonymous in the $.subscribe call, you can retrieve a
 *	// reference to the callback from the handle's 'callback' property
 *	$.unsubscribe("foo bar", callback_reference, obj);
 *	// or
 *	$.unsubscribe("foo bar", handle.callback);
 *
 *	// Using the second syntax is useful if you used an anonymous function and got
 *	// the handle, but don't want to unsubscribe from all of the topics.
 *
 *
 *	// Unsubscribe all callbacks from 1+ topics
 *	// If you skip giving a callback as a parameter, it'll unsubscribe all functions
 *	// from the topic(s) given
 *	$.unsubscribe("foo bar");
 *
 *
 * Publishing:
 *	// Publish to a topic (or topics)
 *	// When you publish, you may send data to the subscribers, or you can leave the
 *	// parameter empty if you have no particular data to send. The data does not have
 *	// a particular format that it must be in, giving you the flexibility to use it
 *	// in whatever way is appropriate for your application
 *	$.publish("foo bar", "This is some data");
 *
 *
 * GENERAL NOTES
 *
 * Topics:
 *	Topics can use any name that can also be used as a property name. Since the
 *	topic is always retrieved using the bracket notation (e.g. object["prop"]), as
 *	opposed to the dot notation (e.g. object.prop), you are allowed to use a large
 *	numbers of characters that aren't legal for variable names, such as slashes ("/")
 *	or periods ("."). You cannot, however, use a space (" ") because this is the 
 *	character that separates multiple topics.
 *	All three functions (subscribe, unsubscribe, and publish) are able to take one
 *	or multiple topics (separated by a space).
 *	
 * Callback Context:
 *	When a callback function is invoked, it is called in the context of the jQuery
 *	object. This means that this === jQuery inside of your function. If this is
 *	not desirable, you can use $.proxy to create function that always runs in the
 *	specified context: http://api.jquery.com/jQuery.proxy/
 *
 * Handle:
 *	The handle that is returned from the $.subscribe function is simply an object
 *	with two properties, named "topics" and "callback", that correspond to the two
 *	parameters that you sent in:
 *	handle = {
 *		topics : "the topics you sent in",
 *		callback : function () { 
 *			// this is the callback function you sent in
 *		},
 *		context : contextObjYouSentIn || {}
 *	};
 *
 * Callback Topic Argument:
 *	The first argument that the callback receives is the topic in which the
 *	function was subscribed and invoked from. This will always be a string
 *	containing only one topic, even if the $.publish function is called with
 *	multiple topics because the callback will be run once for each individual
 *	topic that is published.
 */

(function ($) {
	'use strict';

	var subscriptions = {},
		ctx = {},
		publishing = false;

	/**
	 * jQuery.subscribe( topics, callback[, context] )
	 * - topics (String): 1 or more topic names, separated by a space, to subscribe to
	 * - callback (Function): function to be called when the given topic(s) is published to
	 * - context (Object): an object to call the function on
	 * returns: { "topics": topics, "callback": callback } or null if invalid arguments
	 */
	$.subscribe = function (topics, callback, context) {
		var topicArr, 
			usedTopics = {};

		// If no context was set, assign an empty object to the context
		context = context || ctx;
		
		// Make sure that each argument is valid
		if ($.type(topics) !== "string" || !$.isFunction(callback)) {
			// If anything is invalid, return null
			return null;
		}

		// Split space-separated topics into an array of topics
		topicArr = topics.split(" ");

		// Iterate over each topic and individually subscribe the callback function to them
		$.each(topicArr, function (i, topic) {
			// If the topic is an empty string, skip it. This may happen if there is more than one space between topics
			// Also skip if this is a repeat topic (e.g. someone entered "topic1 topic1"). Otherwise mark it as used.
			if (topic === "" || usedTopics[topic]) {
				return true; // continue
			} else {
				// Mark the topic as used
				usedTopics[topic] = true;
			}

			// If the topic does not exist, create it
			if (!subscriptions[topic]) {
				subscriptions[topic] = [];
			}

			// Add the callback function to the end of the array of callbacks assigned to the specified topic
			subscriptions[topic].push([callback,context]);
		});

		// Return a handle that can be used to unsubscribe
		return { topics: topics, callback: callback, context:context };
	};

	/**
	 * jQuery.unsubscribe( topics[, callback[, context]] )
	 * - topics (String): 1 or more topic names, separated by a space, to unsubscribe from
	 * - callback (Function): function to be removed from the topic's subscription list. If none is supplied, all functions are removed from given topic(s)
	 * - context (Object): object that was used as the context in the jQuery.subscribe() call.
	 */
	$.unsubscribe = function (topics, callback, context) {
		// If someone is trying to unsubscribe while we're publishing, put it off until publishing is done
		if (publishing) {
			$.unsubscribe.queue.push([topics, callback, context]);
			return $;
		}
	
		var topicArr,
			usedTopics = {};
			
		// topics must either be a string, or have a property named topics that is a string
		if (!topics || ($.type(topics) !== "string" && (!topics.topics || $.type(topics.topics) !== "string"))) {
			// If it isn't valid, return null
			return $;
		}

		// If the handler was used, then split the handle object into the two arguments
		if (topics.topics) {
			callback = callback || topics.callback;
			context = context || topics.context;
			topics = topics.topics;
		}
		
		// If no context was provided, then use the default context
		context = context || ctx;

		// Split space-separated topics into an array of topics
		topicArr = topics.split(" ");

		// Iterate over each topic and individually unsubscribe the callback function from them
		$.each(topicArr, function (i, topic) {
			var currTopic = subscriptions[topic];

			// If the topic is an empty string or doesn't exist in subscriptions, or is a repeat topic, skip it.
			// Otherwise mark the topic as used
			if (topic === "" || !currTopic || usedTopics[topic]) {
				return true; // continue
			} else {
				usedTopics[topic] = true;
			}

			// If no callback is given, then remove all subscriptions to this topic
			if (!callback || !$.isFunction(callback)) {
				delete subscriptions[topic];
			} else {
				// Otherwise a callback is specified; iterate through this topic to find the correct callback			
				$.each(currTopic, function (i, subscription) {
					if (subscription[0] === callback && subscription[1] === context) {
						currTopic.splice(i, 1);
						return false; // break
					}
				});
			}
		});
		
		return $;
	};
	
	$.unsubscribe.queue = [];
	$.unsubscribe.resume = function() {
		// If we're still publishing, do nothing
		if (publishing) {
			return;
		}
		
		// Go through the queue and run unsubscribe again
		var e;
		while (e = $.unsubscribe.queue.shift()) {
			console.log('retry unsubscribe ', e);
			$.unsubscribe(e[0], e[1], e[2]);
		}
		
	};

	/**
	 * jQuery.publish( topics[, data] )
	 * - topics (String): the subscription topic(s) to publish to
	 * - data: any data (in any format) you wish to give to the subscribers
	 */
	$.publish = function (topics, data) {
		// Let the plugin know we're publishing so that we don't do any unsubscribes until we're done
		publishing = true;
	
		// Return null if topics isn't a string
		if (!topics || $.type(topics) !== "string") {
			return $;
		}

		// Split the topics up into an array of topics
		var topicArr = topics.split(" ");

		// Iterate over the topics and publish to each one
		$.each(topicArr, function (i, topic) {
			// If the topic is blank, skip to the next one
			if (topic === "") {
				return true; // continue
			}

			if (subscriptions[topic]) {
				// Iterate over each subscriber and call the callback function
				$.each(subscriptions[topic], function (i, subscription) {
					subscription[0].call(subscription[1], topic, data);
				});
			}
		});
		
		// Now that we're done publishing, we need to resume any unsubscribes that were called during publishing
		publishing = false;
		$.unsubscribe.resume();
		
		return $;
	};

}(jQuery));