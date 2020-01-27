"use strict";

exports.handler = async (event) => {
    // webclient made for passwordless auth only
    if (event.callerContext.clientId === 'client-id') {
        event.response.autoConfirmUser = true;
        event.response.autoVerifyEmail = true;
    }
    return event;
};

