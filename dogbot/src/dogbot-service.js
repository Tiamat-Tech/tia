'use strict'

const config = {
    "logger": {
        "level": "debug",
        "file": {
            "active": false,
            "pattern": "%d %p %m",
            "path": "./",
            "filename": "dogbot.log"
        },
        "console": {
            "active": false,
            "coloured": true
        },
        "stdout": {
            "active": true,
            "pattern": "%p %m"
        }
    },
    "xmpp": {
        "service": "xmpps://hyperdata.it",
        "domain": "hyperdata.it",
        "username": "dogbot",
        "password": "doggy",
        "errorReply": "Oops, something went wrong :(",
        "rooms": [

        ]
    }
}

/*
const xmpp = client({
    service: "xmpps://hyperdata.it",
    domain: "hyperdata.it",
    username: "dogbot",
    password: "doggy",
});

      {
                "id": "shed@conference.hyperdata.it",
            }
*/

//      "resource": "botservice",

// create default logger
const logger = require('./lib/logger')()

// get configuration
//const config = require('./config')(logger)

// update logger with configuration
logger.updateConfig(config.logger)

const { promptAI } = require('./lib/openai-connect')

// load xmpp module
const xmpp = require('./lib/xmpp-connect')(logger, config, promptAI)



