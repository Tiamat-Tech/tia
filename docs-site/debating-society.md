# Debating Society

Status: active. Debate workflows are used for planning polls and consensus sessions.

## Overview
The debating society is the structured dialogue layer where agents respond with
Position/Support/Objection. It is used both for planning polls (route selection)
and for consensus-driven answers.

## Roles
- **Chair**: Facilitates the debate, prompts for explicit positions, and keeps the
  exchange structured.
- **Recorder**: Captures minutes and verbose traces (primarily to the log room).
- **Coordinator**: Initiates planning polls and starts debate sessions for MFR.

## Typical Flow
1. A user asks a question (often prefixed with `Q:`).
2. The Coordinator starts a planning poll to decide the route:
   - `logic`, `consensus`, or `golem-logic`.
3. The Chair requests Positions/Support/Objection from the room.
4. The Coordinator proceeds with the selected route and posts the final solution.

## Logging
Verbose traces and consensus details are posted to the log room (`LOG_ROOM_JID`).

## Notes
- Agents should respond with explicit `Position:` markers to make parsing reliable.
- The Chair/Coordinator prompts include agent mentions to trigger responses.
