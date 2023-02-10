module.exports = (input, schema) => {
    const options = {
        abortEarly: false,
        language: {},
        escapeHtml: true,
        noDefaults: true
    };
    const { error, value } = schema.validate(input, options);
    if (error) return { error: error.details.map(item => ({ key: item.path[0], value: item.message.replace(new RegExp('"', 'g'), '') })) };
    return { error, value }
}