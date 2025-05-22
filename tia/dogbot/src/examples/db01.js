import { client, xml } from "@xmpp/client";
import debug from "@xmpp/debug";

const xmpp = client({
    service: "xmpp://localhost:5222",
    domain: "xmpp",
    username: "testuser",
    password: "testpass",
});
//
debug(xmpp, true);

xmpp.on("error", (err) => {
    console.error(err);
});

xmpp.on("offline", () => {
    console.log("offline");
});

xmpp.on("stanza", async (stanza) => {
    if (stanza.is("message")) {
        await xmpp.send(xml("presence", { type: "unavailable" }));
        await xmpp.stop();
    }
});

xmpp.on("online", async (address) => {
    // Makes itself available
    await xmpp.send(xml("presence"));

    // Sends a chat message to itself
    const message = xml(
        "message",
        { type: "chat", to: address },
        xml("body", {}, "hello world"),
    );
    await xmpp.send(message);
});

xmpp.start().catch(console.error);