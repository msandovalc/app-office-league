var graphQlBean = __.newBean('com.enonic.app.officeleague.graphql.GraphQlBean');

exports.createSchema = function (schema) {
    return graphQlBean.createSchema(__.toScriptValue(schema));
};

exports.createType = function (name, schema) {
    return graphQlBean.createType(name, __.toScriptValue(schema));
};

exports.list = function (type) {
    return graphQlBean.list(type);
};


exports.scalar = function (type) {
    return graphQlBean.scalar(type);
};

exports.execute = function (schema, request) {
    return __.toNativeObject(graphQlBean.execute(schema, request));
};