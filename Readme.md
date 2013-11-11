# bamboo

A simple model/schema library for client side javascript making it easy to load and persist simple *document* like data structures to/from a backend (typically ajax) and use them in view/template bindings.

## basic idea

The basic idea behind bamboo is that loading and persisting basic object-ish resources should be easy AND that once the resource is loaded, it should be usable like a simple javascript object.

To accomplish this, you define a basic schema for your models and provide an ajax function to use. The schema is used to define which properties will emit change events when changed. This plays nicely with view/template libraries that can bind to such changes.

Complete documentation can be found on the [wiki] and a simple getting started example is outlined below.

## getting started

### Setup a basic model using a schema

Before using the model to load or save resources, you must define the properties of the model. This schema will specify how the model reacts when you set these properties.

```javascript
var Model = require('bamboo/model');

var Post = Model({
    title: String,
    author: {
        name: String,
        email: String
    }
});
```

### Set a base url

This will be the basepath for url resources. Typically it will be the `plural` of whatever noun used for the model.

```javascript
Post.url_root = '/posts';
```

See the [REST resources] wiki page for an overview of how these routes are used.

### instantiate a new model

Create a post on the client and persist to the server.

```javascript
var post = Post(); // you can also do `new Post()`;

post.title = 'my first post';
post.author.name = 'Edgar Poe';

// the above will cause the `post` object to emit events
// 'change title';
// 'change author.name';
```

See the [Emitter] wiki page to learn more about how models emit events. All models are instances of an event emitter.

### Persist the model

Bamboo persists and loads all models via a configured `ajax` function. Bamboo ships with a working ajax function you can use, or you can wrap your favorite ajax library easily. See the [ajax] wiki page for details.

```javascript
var bamboo = require('bamboo');
bamboo.ajax = require('bamboo/ajax');
```

The above only has done be done ONCE for your entire app (usually in some sort of early setup routine).

See the [ajax] wiki page for details.

### Actually persist the model

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

### reload a persisted model

Our first model has been persisted to the server; we could load it on another page assuming we know the id of the post we want.

```javascript
Post.get(id, function(err, post) {
    // post will be set if found
});
```

Or, if we need a post object before it has been loaded

```javascript
var post = Post();

// we could pass the post to some view/template library //

// now actually fetch a post into this object
post.load(id, function(err) {
    // if no error, then post is loaded
});
```

### Done

See the [wiki] pages and examples for more exotic uses and how a post can contain an array of comments.

## install

```shell
npm install bamboo
```

## inspiration

Bamboo draws heavy inspiration from [backbone models](http://backbonejs.org/#Model).

## license

MIT


[wiki]: wiki
[Emitter]: emitter
[REST resources]: wiki-rest-resouces
[ajax]: config:ajax
