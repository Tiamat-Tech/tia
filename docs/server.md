# Server Setup (systemd)

This describes how to run the agents as a systemd service that starts on boot and restarts after crashes.

## Unit file
`misc/tia-agents.service` is provided. Key points:
- `WorkingDirectory=/home/danny/hyperdata/tia`
- `EnvironmentFile=/home/danny/hyperdata/tia/.env` (optional; holds XMPP creds/API keys)
- `ExecStart=/home/danny/hyperdata/tia/start-all-agents.sh`
- `Restart=on-failure` with `RestartSec=5`
- `User=danny`
- `WantedBy=multi-user.target`

## Install & enable
```bash
sudo cp /home/danny/hyperdata/tia/misc/tia-agents.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable tia-agents.service   # start on boot
sudo systemctl start tia-agents.service    # start now
```

## Check status/logs
```bash
systemctl status tia-agents.service
journalctl -u tia-agents.service -f
```

## Prereqs
- Populate `/home/danny/hyperdata/tia/.env` (or per-agent configs in `config/agents/`) with XMPP credentials/resources and any API keys/tokens.
- Ensure `start-all-agents.sh` is executable.
- If your XMPP server doesn’t support multiple resources on one account, use distinct accounts per agent in `config/agents/{mistral,semem,demo}.json` and restart the service.
