# bamboo [![Build Status](https://travis-ci.org/defunctzombie/bamboo.png?branch=master)](https://travis-ci.org/defunctzombie/bamboo)

A model library for client side javascript making it easy to load and persist javascript-object like data structures to/from a backend (typically over ajax) and use them in view/template bindings.

## overview

One problem common to many web apps is the need to create and load document like resources whether it be posts, events, users, etc. These resources typically have a predefined schema and url routs. Using raw ajax requests for all of these CRUD operations leads to repeating lots of boilerplate code and complexity. However, we also don't want to sacrifice working with these loaded resources in idomatic javascript when possible; this is where bamboo is used.

To accomplish this, you define a basic schema for your models and provide a sync function to use. The schema is used to define which properties will emit change events when changed. This plays nicely with view/template libraries that can bind to such events.

Additionally, bamboo Models instances behave as much like native javascript objects as possible. You can set and get properties defined by the schema or ad-hoc.

Complete documentation can be found on the [wiki] and a simple getting started example is outlined below.

## getting started

### Setup a basic model using a schema

Before using the model to load or save resources, you must define the properties of the model. This schema will specify how the model reacts when you set these properties.

```javascript
var Model = require('bamboo/model');
var ajax = require('bamboo/sync/ajax');

var Post = Model({
    title: String,
    author: {
        name: String,
        email: String
    }
}, { sync: ajax, url_root: '/posts' });
```

See the [sync][wiki-sync] wiki page for an overview of how models are persisted

### Instantiate a new model

Create a Post instance on the client and persist to the server.

```javascript
var post = Post(); // you can also do `new Post()`;

post.title = 'my first post';
post.author = {
    name = 'Edgar Poe';
};
post.author.name = 'Fannie Poe';

// the above will cause the `post` object to emit events
// 'change title';
// 'change author';
// 'change author.name';
```

See the [Emitter][wiki-emitter] wiki page to learn more about how models emit events. All models are instances of an event emitter.

### Persist the model

Bamboo persists and loads all models via a configured `sync` function. Bamboo ships with a working ajax function you can use, or you can wrap your favorite ajax library. See the [options][wiki-options] wiki page for details.

In our example post, we used the bamboo provided ajax `sync` function to persist our models over ajax. Bamboo avoids using globals or state and leaves this up to you to dictate how to build your app; You will need to specify the sync option for every Model you build and wish to persist (not every instance).

```javascript
// before a new post is saved, is_new() will return true
// this means the post has no `.id` property
// post.is_new() === true

// this will make a POST request to '/posts' (the url root)
// the respons is expected to be an object with an `id` field
// ideally the full saved object is copied back to us
post.save(function(err) {
    // if no error then the following is true
    // post.id is now set
    // the model is now saved to the server
});
```

See the [sync][wiki-sync] wiki page for details on writing a sync function.

### Fetch a persisted model

Our first model has been persisted to the server; we could load it on another page assuming we know the id of the post we want.

```javascript
Post.get(id, function(err, post) {
    // post will be an instanceof Post if found
});
```

Or, if we need to get a list of posts

```javascript
Post.find(function(err, posts) {
    // posts will be an array with instanceof Post items
});
```

## documentation

See the [wiki] pages and examples for more exotic uses and how a post can contain an array of comments.

## install

```shell
npm install bamboo
```

## view/template libraries

Bamboo can play nice with many view/template libraries. Some cool ones to consider:

* [reactive](https://github.com/component/reactive)
* [ractive.js](http://www.ractivejs.org/)

Using bamboo with another view/template lib? Let me know!

## inspiration

Bamboo draws heavy inspiration from [backbone models](http://backbonejs.org/#Model).

## license

MIT

[wiki]: https://github.com/defunctzombie/bamboo/wiki
[wiki-emitter]: https://github.com/defunctzombie/bamboo/wiki/Emitter
[wiki-sync]: https://github.com/defunctzombie/bamboo/wiki/sync
[wiki-options]: https://github.com/defunctzombie/bamboo/wiki/Model#options
