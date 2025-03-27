{
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
    "xmppServer": {
        "service": "xmpps://xmpp.hyperdata.it",
            "domain": "xmpp.hyperdata.it",
                "username": "danja@xmpp.hyperdata.it",
                    "password": "ClaudioPup_123",
                        "resource": "botservice",
                            "errorReply": "Oops, something went wrong :(",
                                "rooms": [
                                    {
                                        "id": "shed@conference.xmpp.hyperdata.it",
                                        "password": null
                                    }
                                ]
    }
}

