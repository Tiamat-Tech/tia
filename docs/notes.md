npm pack

  Then from your test project (/home/danny/hyperdata/tia-test):

  npm install ../tia/tia-agents-0.3.0.tgz

npm install @mistralai/mistralai

 If you want the history store size or any other provider options to be 100%
  config‑driven too, we can add those to the profile and wire them in the
  provider config.

systemctl restart tia-agents

claude mcp add tia-chat node /home/danny/hyperdata/tia/src/mcp/servers/tia-mcp-server.js

codex mcp add tia-chat node /home/danny/hyperdata/tia/src/mcp/servers/tia-mcp-server.js

src/mcp/servers/tia-mcp-server.js

  If you want, I can add tunable env vars for reconnect delays/retry caps or logging around reconnect attempts.
    
    1. If you want history per room or per user, I can add a keyed history manager that
     uses roomJid/from to select a store.
  2. If you want file persistence, we can implement a file-backed store that shares
     the same interface.
     
RUN_SEMEM_BOT_TEST=true NODE_TLS_REJECT_UNAUTHORIZED=0 npm run test:integration

node src/examples/semem-direct-test.js "Glitch is a canary" "What is Glitch?"

systemctl stop tia-agents


prosodyctl adduser semem@tensegrity.it
prosodyctl adduser mistral@tensegrity.it
prosodyctl adduser demo@tensegrity.it

prosodyctl adduser prolog@tensegrity.it

 sudo prosodyctl register mistral-analyst tensegrity.it analystpass???

 sudo prosodyctl adduser mistral-analyst@tensegrity.it analystpass
  sudo prosodyctl adduser mistral-creative@tensegrity.it creativepass
  sudo prosodyctl adduser mcp-loopback@tensegrity.it loopbackpass
---

npm install @xmpp/client @xmpp/debug

https://platform.openai.com/docs/quickstart?context=node

npm install --save openai

in ~/.bash_profile :

export OPENAI_API_KEY='your-api-key-here'

source ~/.bash_profile
echo $OPENAI_API_KEY

https://github.com/nioc/xmpp-bot

npm install log4js
