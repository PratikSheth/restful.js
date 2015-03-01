'use strict';

var endpoint = require('./endpoint'),
    entity = require('./entity'),
    resource = require('./resource');

function collection(name, parent) {
    var refEndpoint = endpoint([parent.url(), name].join('/'), parent()),
        model = resource(refEndpoint);

    model.get = function(id, params, headers) {
        var member = parent.factory(name, id, parent); // We use this way to avoid circular dependencies

        // Configure the endpoint
        // We do it this way because the entity must have a member which inherits from this collection config
        member()
            .headers(refEndpoint.headers())
            .responseInterceptors(refEndpoint.responseInterceptors())
            .requestInterceptors(refEndpoint.requestInterceptors());

        return refEndpoint
            .get(id, params, headers)
            .then(function(response) {
                return entity(
                    id,
                    response,
                    member
                );
            });
    };

    model.getAll = function(params, headers) {
        return refEndpoint
            .getAll(params, headers)
            .then(function(response) {
                return response.data.map(function(data) {
                    response = JSON.parse(JSON.stringify(response));
                    response.data = data;

                    var member = parent.factory(name, data.id, parent); // We use this way to avoid circular dependencies

                    // Configure the endpoint
                    // We do it this way because the entity must have a member which inherits from this collection config
                    member()
                        .headers(refEndpoint.headers())
                        .responseInterceptors(refEndpoint.responseInterceptors())
                        .requestInterceptors(refEndpoint.requestInterceptors());

                    return entity(
                        data.id,
                        response,
                        member
                    );
                });
            });
    };

    model.post = function(data, headers) {
        return refEndpoint.post(data, headers);
    };

    model.put = function(id, data, headers) {
        return refEndpoint.put(id, data, headers);
    };

    model.patch = function(id, data, headers) {
        return refEndpoint.patch(id, data, headers);
    };

    model.head = function(id, data, headers) {
        return refEndpoint.head(id, data, headers);
    };

    model.delete = function(id, headers) {
        return refEndpoint.delete(id, headers);
    };

    model.url = function() {
        return [parent.url(), name].join('/');
    };

    return model;
};

module.exports = collection;
