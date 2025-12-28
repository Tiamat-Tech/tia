# MFR Room Creation Testing

Status: maintained; review after major changes.

## Problem

The original `src/examples/create-mfr-rooms.js` script reports success when rooms are created, but doesn't actually verify that the rooms persist and are functional. The script:

1. Joins/creates the room
2. Sends a configuration message
3. Sends a test message
4. Exits and reports success

**Issue**: The script assumes success based on receiving presence stanzas, but doesn't verify:
- The room actually persists after the script exits
- Other users can join the room
- The room is properly configured
- The room information is queryable

## Solution

Created a comprehensive integration test (`test/integration/mfr-room-creation.test.js`) that:

### Phase 1: Room Creation
- Connects as admin user
- Attempts to create/join each MFR room
- Configures rooms as instant rooms (publicly accessible)
- Sends test messages
- Captures status codes to confirm creation (status 201)

### Phase 2: Verification
- Connects as a **different test user**
- Attempts to join each room
- Verifies rooms are accessible by non-admin users
- Detects "item-not-found" errors (room doesn't exist)
- Confirms presence stanzas (room exists and is joinable)

### Phase 3: Information Query
- Queries room disco#info for each room
- Retrieves room identities and features
- Confirms rooms are discoverable and queryable
- Provides detailed room metadata

## Usage

### Quick Test

```bash
./test-mfr-rooms.sh
```

### Manual Test

```bash
# With default credentials
node --test test/integration/mfr-room-creation.test.js

# With custom credentials
XMPP_USERNAME=admin \
XMPP_PASSWORD=yourpass \
XMPP_TEST_USERNAME=testuser \
XMPP_TEST_PASSWORD=testpass \
node --test test/integration/mfr-room-creation.test.js
```

## Test Output

### Successful Test

```
=== MFR Room Creation Integration Test ===

Creating room: mfr-construct@conference.tensegrity.it
  Connected as admin@tensegrity.it
  ✅ Joined room: mfr-construct@conference.tensegrity.it
  🎉 Room created (status 201): mfr-construct@conference.tensegrity.it
  ✅ Room configured: mfr-construct@conference.tensegrity.it
  ✅ Room creation completed

[... similar for other rooms ...]

=== Verification Phase ===

Verifying room: mfr-construct@conference.tensegrity.it
  ✅ Verified room exists: mfr-construct@conference.tensegrity.it

[... similar for other rooms ...]

=== Room Information Query ===

Querying room info: mfr-construct@conference.tensegrity.it
  ✅ Room info retrieved
     Identities: 1
     Features: 10+

[... similar for other rooms ...]

=== Test Summary ===

Room Creation:
  ✅ mfr-construct@conference.tensegrity.it: Created
  ✅ mfr-validate@conference.tensegrity.it: Created
  ✅ mfr-reason@conference.tensegrity.it: Created

Room Verification:
  ✅ mfr-construct@conference.tensegrity.it: Exists
  ✅ mfr-validate@conference.tensegrity.it: Exists
  ✅ mfr-reason@conference.tensegrity.it: Exists

Room Information:
  ✅ mfr-construct@conference.tensegrity.it: Available
  ✅ mfr-validate@conference.tensegrity.it: Available
  ✅ mfr-reason@conference.tensegrity.it: Available

=== Test Result ===
All rooms created: ✅ YES
All rooms verified: ✅ YES
All rooms queryable: ✅ YES

✅ Integration test PASSED - All MFR rooms exist and are functional
```

### Failed Test

If rooms don't exist:

```
Room Verification:
  ❌ mfr-construct@conference.tensegrity.it: Not found
  ...

=== Test Result ===
All rooms created: ✅ YES
All rooms verified: ❌ NO
All rooms queryable: ❌ NO

AssertionError: All MFR rooms should be verified to exist
```

## What the Test Checks

### 1. Room Creation (Admin User)
- ✅ Connection successful
- ✅ Presence stanza received (joined room)
- ✅ Status code 201 received (room created)
- ✅ Configuration IQ result received (room configured)
- ✅ Test message sent successfully

### 2. Room Verification (Test User)
- ✅ Test user can connect
- ✅ Test user can join the room
- ✅ Presence stanza received (room is accessible)
- ❌ "item-not-found" error NOT received (room exists)

### 3. Room Information Query
- ✅ Disco#info query successful
- ✅ Room identities retrieved (conference, text)
- ✅ Room features retrieved (muc features)
- ✅ Room is discoverable in server listings

## Troubleshooting

### Rooms Not Persisting

**Symptom**: Test shows rooms created but verification fails

**Possible Causes**:
1. **Memory-only rooms**: Prosody configured to not persist rooms
2. **Room destruction**: Rooms destroyed when last occupant leaves
3. **Configuration issue**: Room not properly configured as persistent

**Solutions**:

1. Check Prosody MUC configuration in `/etc/prosody/conf.d/conference.cfg.lua` (or `/etc/prosody/prosody.cfg.lua`):
```lua
Component "conference.tensegrity.it" "muc"
    modules_enabled = { "muc_mam" }

    -- CRITICAL: These settings are required for MFR rooms to persist
    muc_room_default_persistent = true
    muc_room_default_public = true
    muc_room_default_members_only = false
```

2. Restart Prosody:
```bash
sudo systemctl restart prosody
```

3. Verify configuration loaded:
```bash
prosodyctl check
```

### Authentication Failures

**Symptom**: "not-authorized" errors

**Solutions**:
1. Ensure admin user exists:
```bash
prosodyctl adduser admin@tensegrity.it
```

2. Ensure test user exists:
```bash
prosodyctl adduser testuser@tensegrity.it
```

3. Check passwords match environment variables

### Connection Timeouts

**Symptom**: Test times out waiting for stanzas

**Solutions**:
1. Verify Prosody is running:
```bash
prosodyctl status
```

2. Check network connectivity:
```bash
nc -zv tensegrity.it 5222
```

3. Check TLS settings match server configuration

### Room Creation Fails

**Symptom**: Room creation returns error stanza

**Possible Errors**:
- `forbidden`: User doesn't have permission to create rooms
- `not-allowed`: MUC room creation disabled
- `conflict`: Room already exists with different configuration

**Solutions**:
1. Grant admin privileges in Prosody config:
```lua
admins = { "admin@tensegrity.it" }
```

2. Enable room creation:
```lua
restrict_room_creation = false
```

3. Delete existing rooms if needed:
```bash
prosodyctl mod_muc delete_room mfr-construct@conference.tensegrity.it
```

## Integration with CI/CD

Add to test suite:

```json
{
  "scripts": {
    "test": "node --test",
    "test:integration": "node --test test/integration/*.test.js",
    "test:mfr-rooms": "./test-mfr-rooms.sh"
  }
}
```

Run before starting MFR system:

```bash
# In start-mfr-system.sh
echo "Verifying MFR rooms..."
./test-mfr-rooms.sh || {
  echo "❌ MFR rooms not available. Creating rooms..."
  node src/examples/create-mfr-rooms.js
}
```

## Comparison: Old vs New

### Old Script (create-mfr-rooms.js)
- ✅ Creates rooms
- ✅ Configures rooms
- ❌ Doesn't verify persistence
- ❌ Doesn't test accessibility
- ❌ Single user perspective
- ❌ Reports success prematurely

### New Test (mfr-room-creation.test.js)
- ✅ Creates rooms
- ✅ Configures rooms
- ✅ Verifies persistence
- ✅ Tests accessibility with different user
- ✅ Multi-phase verification
- ✅ Queries room information
- ✅ Comprehensive error detection
- ✅ Detailed reporting

## Recommendations

1. **Always run the integration test** after creating rooms
2. **Use the test as source of truth** for room existence
3. **Update create-mfr-rooms.js** to use same verification logic
4. **Add test to CI/CD pipeline** for automated verification
5. **Monitor test output** for degradation over time

## Future Enhancements

Potential improvements to the test:

1. **Concurrent Join Test**: Multiple users join simultaneously
2. **Message Persistence**: Verify MAM (Message Archive Management)
3. **Room Discovery**: Test service discovery for room list
4. **Configuration Verification**: Query and validate room config
5. **Occupant List**: Verify occupant tracking
6. **Affiliation Test**: Test admin/owner/member affiliations
7. **Performance**: Measure room creation time
8. **Cleanup**: Option to delete rooms after test
