// This sample demonstrates handling intents from an Alexa skill using the Alexa Skills Kit SDK (v2).
// Please visit https://alexa.design/cookbook for additional examples on implementing slots, dialog management,
// session persistence, api calls, and more.
const Alexa = require('ask-sdk-core');
const Service = require('./service.js');

let mangaList = [];
let lastMangaRecommended;
let waitingForDescriptionConfirm = false;

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    async handle(handlerInput) {
        let speakOutput = 'Benvenuto! Puoi chiedermi di suggerirti un manga casuale, oppure di uno specifico genere.';
        waitingForDescriptionConfirm = false;
        try {
            mangaList = await Service.getMangaList();
        } catch (err) {
            console.error(err);
            speakOutput = 'Benvenuto! Scusa ma non mi sento molto bene oggi. Puoi tornare più tardi?'
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Come posso aiutarti? Puoi chiedermi di suggerirti un manga casuale, oppure di uno specifico genere.';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Alla prossima!';
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse();
    }
};

// Custom intents
const CourtesySentenceHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'HowAreYouIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'ThanksIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomAnimeIntent');
    },
    handle(handlerInput) {
        const speakOutput = Alexa.getIntentName(handlerInput.requestEnvelope) === 'HelloIntent' ? 'Ciao da Scopri Manga!' : (
            Alexa.getIntentName(handlerInput.requestEnvelope) === 'HowAreYouIntent' ? 'Io sto benissimo, grazie!' : (
                Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomAnimeIntent' ? 'Oops, ti posso suggerire soltanto manga, non anime. Gomenasai.' :
                    'È un piacere aiutarti!')); // thanks
        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
}

const MangaRecommendationHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomMangaIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomMangaWithFilterIntent');
    },
    handle(handlerInput) {
        let list = mangaList;
        let speakOutput = '';

        if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'RandomMangaWithFilterIntent') {
            const slot = Alexa.getSlot(handlerInput.requestEnvelope, 'genre');
            const filter = slot && slot.resolutions && slot.resolutions.resolutionsPerAuthority && slot.resolutions.resolutionsPerAuthority[0] &&
                slot.resolutions.resolutionsPerAuthority[0].values && slot.resolutions.resolutionsPerAuthority[0].values[0] &&
                slot.resolutions.resolutionsPerAuthority[0].values[0].value && slot.resolutions.resolutionsPerAuthority[0].values[0].value.name;
            if (filter) {
                list = list.filter(el => el.c.find(category => category.toLowerCase() === filter.toLowerCase()));
            } else {
                list = [];
            }
        }


        if (list.length > 0) {
            const randomIndex = Math.floor(Math.random() * list.length);
            lastMangaRecommended = list[randomIndex];
            waitingForDescriptionConfirm = true;

            const genres = lastMangaRecommended.c.map(el => Service.getTranslatedGenre(el));

            speakOutput = `Ti suggerisco il manga: "${lastMangaRecommended.t}"! Il suo genere è: ${genres.join(', ')}. ` +
                'Vuoi che ti legga la trama?';

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        } else {
            speakOutput = 'Non ho trovato nessun manga per il genere specificato, mi spiace.'
            return handlerInput.responseBuilder
                .speak(speakOutput)
                .getResponse();
        }
    }
}

const ConfirmDenyIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfirmIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'DenyIntent');
    },
    async handle(handlerInput) {
        let speakOutput = '';
        if (waitingForDescriptionConfirm) {
            if (Alexa.getIntentName(handlerInput.requestEnvelope) === 'ConfirmIntent') {
                try {
                    const mangaId = lastMangaRecommended.i;
                    const info = await Service.getMangaInfo(mangaId);
                    const { title, description } = info;

                    let italianDescription = description;

                    // check if translation is in the correct language
                    const lang = await Service.getLanguage(description);
                    if (lang !== 'it') {
                        italianDescription = await Service.getItalianTranslation(description);
                    }

                    waitingForDescriptionConfirm = false;
                    speakOutput = `Ecco la trama di ${title}: "${italianDescription}"`;

                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .getResponse();
                } catch (err) {
                    console.error(err);
                    speakOutput = 'Qualcosa è andato storto... puoi ripetere?';

                    return handlerInput.responseBuilder
                        .speak(speakOutput)
                        .reprompt(speakOutput)
                        .getResponse();
                }
            } else { // deny intent
                speakOutput = 'Ok, fa niente allora.'

                return handlerInput.responseBuilder
                    .speak(speakOutput)
                    .getResponse();
            }
        } else {
            speakOutput = 'Scusa, non ho capito. Puoi ripetere?';

            return handlerInput.responseBuilder
                .speak(speakOutput)
                .reprompt(speakOutput)
                .getResponse();
        }


    }
}

// The intent reflector is used for interaction model testing and debugging.
// It will simply repeat the intent the user said. You can create custom handlers
// for your intents by defining them above, then also adding them to the request
// handler chain below.
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};

// Generic error handling to capture any syntax or routing errors. If you receive an error
// stating the request handler chain is not found, you have not implemented a handler for
// the intent being invoked or included it in the skill builder below.
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        console.log(`~~~~ Error handled: ${error.stack}`);
        const speakOutput = `Scusa non ho capito bene. Potresti ripetere?`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

// The SkillBuilder acts as the entry point for your skill, routing all request and response
// payloads to the handlers above. Make sure any new handlers or interceptors you've
// defined are included below. The order matters - they're processed top to bottom.
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
        CourtesySentenceHandler,
        MangaRecommendationHandler,
        ConfirmDenyIntentHandler,
        IntentReflectorHandler, // make sure IntentReflectorHandler is last so it doesn't override your custom intent handlers
    )
    .addErrorHandlers(
        ErrorHandler,
    )
    .lambda();
