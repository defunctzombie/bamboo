
/// create dom element(s) for a given element(s) spec
/// handler is an optional function to use the node
/// handler(parent, element_spec, node
module.exports = function render(element, parent, handler) {

    // if given an array of elements
    // wrap each one just like any other
    if (Array.isArray(element)) {
        element.forEach(function(element) {
            render(element, parent, handler);
        });

        return parent;
    }

    switch (element.type) {
    case 'tag':
        var node = document.createElement(element.name);

        var attributes = element.attributes;
        Object.keys(attributes).forEach(function(name) {
            node.setAttribute(name, attributes[name]);
        });

        // handler can return a new node instead of the one we created
        // or the handler can return no node to take over fully?
        if (handler) {
            node = handler(parent, element, node);
        }

        // this widget is now the parent
        render(element.children || [], node, handler);

        if (parent && !node.parentNode) {
            parent.appendChild(node);
        }

        return node;
    case 'text':
        parent.insertAdjacentHTML('beforeend', element.data);
        return;
    case 'comment':
        return;
    };

    throw new Error('unandled type: ' + element.type);
};

