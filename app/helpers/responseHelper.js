const boom = require('boom');

const get = (res, resData, message) => {
    return res.json({
        success: true,
        code: 200,
        message: message,
        data: resData
    });
}

const post = (res, resData,message) => {
    return res.json({
        success: true,
        code: 200,
        message: message,
        data: resData
    });
}

const del = (res, resData , message) => {
    return res.json({
        success: true,
        code: 200,
        message: message,
        data: resData
    });
}

const put = (res, resData , message) => {
    return res.json({
        success: true,
        code: 200,
        message: message,
        data: resData
    });
}
const Error = (res, resData, message) => {
    return res.status(400).json({
        success: false,
        code: 400,
        message: message,
        data: resData
    });
}

const getError = (message) => {
    return {
        success: false,
        code: 400,
        message: message,
        data: {}
    };
}

const unauthorized = (res, message) => {
    return res.status(401).json({
        success: false,
        code: 401,
        message: 'User is Unauthorized',
        data: {}
    });
}

const onError = (res, err, message) => {
    console.log(err);
    console.log(boom.badRequest(message));
    console.log(getError(message));
    return res.status(400).json(getError(message));
}

module.exports = {
    get,
    post,
    put,
    del,
    onError,
    unauthorized,
    Error
}
