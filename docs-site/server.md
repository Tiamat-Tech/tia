# Server Setup (systemd)

Status: maintained; review after major changes.

This describes how to run the agents as a systemd service that starts on boot and restarts after crashes.

## Unit file
`misc/tia-agents.service` is provided. Key points:
- `WorkingDirectory=/home/danny/hyperdata/tia`
- `EnvironmentFile=/home/danny/hyperdata/tia/.env` (optional; holds XMPP creds/API keys)
- `ExecStart=/home/danny/hyperdata/tia/start-all-agents.sh`
- `Restart=on-failure` with `RestartSec=5`
- `User=danny`
- `WantedBy=multi-user.target`
- Ensure `logs/` exists and is writable by the service user (start scripts default to per-agent log files).

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
- Set `LOG_ROOM_JID` explicitly and ensure the log room exists on the XMPP server.
- Ensure `start-all-agents.sh` is executable.
- Create `logs/` and set ownership (e.g., `mkdir -p /home/danny/hyperdata/tia/logs && chown -R danny:danny /home/danny/hyperdata/tia/logs`).
- If your XMPP server doesn’t support multiple resources on one account, use distinct accounts per agent in `config/agents/{mistral,semem,demo}.ttl` and restart the service.
