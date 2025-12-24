
  1. Find the Prosody container name:

  docker ps --filter name=xmpp --format '{{.Names}}'

tbox-xmpp-1

  2. Register a user non-interactively (avoid the password prompt):

  # replace <ctr> with the name from step 1, set your password
  docker exec tbox-xmpp-1 prosodyctl register bot xmpp yourpass

docker exec tbox-xmpp-1 prosodyctl register danja xmpp sasha

docker exec tbox-xmpp-1 prosodyctl register danbri xmpp canary

  If you need an admin account, use a different username and the same command.

  3. Verify the user:

  docker exec tbox-xmpp-1  prosodyctl user list xmpp

  4. Create the room (if not already present):

  NODE_TLS_REJECT_UNAUTHORIZED=0 XMPP_SERVICE="xmpp://tensegrity.it:5222" XMPP_DOMAIN="xmpp" \
    node src/examples/create-muc-room.js

  5. Start the TIA Mistral bot pointing at tensegrity.it (in this repo):

  cat > .env <<'EOF'
  XMPP_SERVICE=xmpp://tensegrity.it:5222
  XMPP_DOMAIN=xmpp
  MUC_ROOM=general@conference.xmpp
  NODE_TLS_REJECT_UNAUTHORIZED=0
  LINGUE_ENABLED=true
  EOF

  # Set the XMPP username/password in config/agents/mistral.ttl and
  # config/agents/secrets.json (gitignored).

  ./start-mistral-bot.sh

  - Send: MistralBot, hello there or an IBIS-style prompt.

  If the prosodyctl register still fails, share the exact error and we’ll adjust.
› tbox.sh isn't releasing the command line - when I do ctrl-c it shuts down the container

  # allow client-to-server
  sudo ufw allow 5222/tcp

  # allow server-to-server (optional)
  sudo ufw allow 5269/tcp

  # optional BOSH/HTTPS admin ports if you use them
  sudo ufw allow 5280/tcp
  sudo ufw allow 5281/tcp

    NODE_TLS_REJECT_UNAUTHORIZED=0 \
  XMPP_SERVICE=xmpp://tensegrity.it:5222 \
  XMPP_DOMAIN=xmpp \
  node src/client/repl.js danja sasha


    NODE_TLS_REJECT_UNAUTHORIZED=0 \
  XMPP_SERVICE=xmpp://tensegrity.it:5222 \
  XMPP_DOMAIN=xmpp \
  node src/client/repl.js bot yourpass

    # 1) Verify container name
  docker ps --filter name=xmpp --format '{{.Names}}'

  # 2) List users for the xmpp domain
  docker exec tbox-xmpp-1 prosodyctl listusers xmpp

  # 3) (Re)create the account to be sure
  docker exec tbox-xmpp-1 prosodyctl register bot xmpp newpass123

  # 4) Confirm again
  docker exec tbox-xmpp-1 prosodyctl listusers xmpp

  docker exec tbox-xmpp-1 ls /var/lib/prosody/xmpp/accounts
