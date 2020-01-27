"use strict";

exports.handler = async (event) => {
    // webclient made for passwordless auth only
    if (event.callerContext.clientId === 'client-id') {
        console.log(event)
        const expectedAnswer = event.request.privateChallengeParameters.secretLoginCode;
        if (event.request.challengeAnswer === expectedAnswer) {
            event.response.answerCorrect = true;
        }
        else {
            event.response.answerCorrect = false;
        }
    }
    return event;
};
