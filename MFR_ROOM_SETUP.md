# MFR Room Setup and Diagnostics

This guide helps you create and verify the three MFR MUC rooms.

## Prerequisites: Prosody Server Configuration

**IMPORTANT:** Before running any room creation scripts, you must configure Prosody to support persistent, public MUC rooms.

### Required Configuration

Add or update the file `/etc/prosody/conf.d/conference.cfg.lua`:

```lua
Component "conference.tensegrity.it" "muc"
    modules_enabled = { "muc_mam" }

    -- CRITICAL: These settings are required for MFR rooms to persist
    muc_room_default_persistent = true
    muc_room_default_public = true
    muc_room_default_members_only = false

    -- Optional: Allow all users to create rooms
    restrict_room_creation = false
```

### Apply Configuration

After editing the configuration file, restart Prosody:

```bash
sudo systemctl restart prosody
```

Verify the configuration loaded correctly:

```bash
prosodyctl check
```

**Note:** The exact configuration file location may vary:
- `/etc/prosody/conf.d/conference.cfg.lua` (recommended - component-specific)
- `/etc/prosody/prosody.cfg.lua` (global configuration)

If rooms still don't persist after creation, verify that `muc_room_default_persistent = true` is set in the correct configuration file and that Prosody has been restarted.

## Environment Configuration

Before starting the MFR system, ensure your `.env` file is properly configured with API keys.

### Required Configuration

Create or update `.env` file in the project root:

```bash
# Copy from example if needed
cp .env.example .env
```

Edit `.env` and set:

```bash
# REQUIRED: Mistral AI API Key
MISTRAL_API_KEY=your_actual_mistral_api_key

# OPTIONAL: Semem Authentication (system works without this)
# SEMEM_AUTH_TOKEN=your-semem-token
```

**Getting API Keys:**
- Mistral API Key: https://console.mistral.ai/
- Semem is optional - MFR system will skip this agent if not configured

**Important:** The `start-all.sh` script automatically loads `.env` file. If you see warnings about missing API keys, check that:
1. `.env` file exists in the project root
2. `MISTRAL_API_KEY` is set to your actual key (not the placeholder value)
3. You're running the script from the project root directory

## Quick Start

### Step 1: Diagnose Current State

First, check what's currently happening with the rooms:

```bash
node src/examples/diagnose-mfr-rooms.js
```

This will:
- List all rooms on your conference service
- Check if MFR rooms are in the server list
- Try to join each MFR room
- Report detailed errors if rooms don't exist or aren't accessible

**Expected Output if Rooms Don't Exist:**
```
=== Checking MFR Rooms in Server List ===

❌ mfr-construct@conference.tensegrity.it - NOT in server list
❌ mfr-validate@conference.tensegrity.it - NOT in server list
❌ mfr-reason@conference.tensegrity.it - NOT in server list

=== Diagnosing: mfr-construct@conference.tensegrity.it ===

✅ Connected
📡 Attempting to join room...
📥 Presence from: mfr-construct@conference.tensegrity.it/diagnostic, type: error
❌ Error joining room:
   Type: cancel
   Condition: item-not-found

💡 Room does NOT exist (item-not-found)
```

### Step 2: Create Rooms with Verification

Use the improved creation script:

```bash
node src/examples/create-mfr-rooms-verified.js
```

This script:
1. Creates each room
2. **Leaves the room completely**
3. **Rejoins to verify it persists**
4. Only reports success if verification passes

**Expected Output:**
```
=== Create MFR Rooms with Verification ===

Processing: mfr-construct@conference.tensegrity.it
  ✅ Connected
  📡 Joining room...
  ✅ Joined room
  🎉 Room created (status 201)
  ⚙️  Configuring room...
  ✅ Room configured
  👋 Leaving room...
  👋 Left room
  🔄 Rejoining to verify...
  ✅ Successfully rejoined!
  ✓ Room verified to persist
  ✅ mfr-construct@conference.tensegrity.it - Complete

[... similar for other rooms ...]

=== Summary ===

✅ mfr-construct@conference.tensegrity.it - Created and verified
✅ mfr-validate@conference.tensegrity.it - Created and verified
✅ mfr-reason@conference.tensegrity.it - Created and verified

Success rate: 3/3

✅ All MFR rooms created and verified!
```

### Step 3: Verify Again

Run the diagnostic again to confirm:

```bash
node src/examples/diagnose-mfr-rooms.js
```

**Expected Output if Successful:**
```
=== Checking MFR Rooms in Server List ===

✅ mfr-construct@conference.tensegrity.it - Found in server list
   Name: mfr-construct
✅ mfr-validate@conference.tensegrity.it - Found in server list
   Name: mfr-validate
✅ mfr-reason@conference.tensegrity.it - Found in server list
   Name: mfr-reason

=== Summary ===

mfr-construct@conference.tensegrity.it:
  Exists: ✅ Yes
  Joinable: ✅ Yes

[... similar for other rooms ...]

=== Recommendations ===

✅ All MFR rooms exist and are joinable!

   Next: Start the MFR system with:
   ./start-all.sh mfr
```

## Common Issues

### Issue 1: Rooms Report as Created But Don't Persist

**Symptom:**
```
✅ Room created (status 201)
✅ Room configured
```
But when you run diagnostic:
```
❌ item-not-found
```

**Cause:** Prosody is configured to destroy empty rooms

**Solution:** Configure Prosody to persist rooms (see Prerequisites section above for full configuration):

```lua
-- In /etc/prosody/conf.d/conference.cfg.lua (or /etc/prosody/prosody.cfg.lua)
Component "conference.tensegrity.it" "muc"
    modules_enabled = { "muc_mam" }
    muc_room_default_persistent = true
    muc_room_default_public = true
    muc_room_default_members_only = false
```

Then restart:
```bash
sudo systemctl restart prosody
```

### Issue 2: "forbidden" or "not-authorized" Errors

**Symptom:**
```
❌ Error joining room:
   Type: auth
   Condition: forbidden
```

**Cause:** User doesn't have permission to create rooms

**Solution:** Grant admin privileges:

```lua
-- In prosody.cfg.lua
admins = { "admin@tensegrity.it" }
```

Or allow all users to create rooms:
```lua
Component "conference.tensegrity.it" "muc"
    restrict_room_creation = false
```

### Issue 3: "registration-required" Error

**Symptom:**
```
❌ Error joining room:
   Condition: registration-required

💡 Room exists but is members-only
```

**Cause:** Room was created as members-only

**Solution:** Delete and recreate:

```bash
prosodyctl mod_muc delete_room mfr-construct@conference.tensegrity.it
node src/examples/create-mfr-rooms-verified.js
```

### Issue 4: Timeout - No Response

**Symptom:**
```
⏱️  Timeout - no response from room
```

**Cause:**
- Prosody not running
- Network connectivity issue
- MUC component not loaded

**Solution:**

1. Check Prosody is running:
```bash
prosodyctl status
```

2. Check MUC component is configured:
```bash
prosodyctl check
```

Look for:
```
Component "conference.tensegrity.it" "muc"
```

3. Test connectivity:
```bash
nc -zv tensegrity.it 5222
```

## Script Comparison

### Old Script: `create-mfr-rooms.js`
❌ Creates rooms
❌ Configures rooms
❌ Sends test message
❌ **Reports success immediately**
❌ **Doesn't verify persistence**
❌ **Can report success when rooms don't actually persist**

### New Script: `create-mfr-rooms-verified.js`
✅ Creates rooms
✅ Configures rooms
✅ **Leaves rooms completely**
✅ **Rejoins to verify persistence**
✅ **Only reports success if rejoin works**
✅ **Catches non-persistent rooms**

### Diagnostic: `diagnose-mfr-rooms.js`
✅ Lists all rooms on server
✅ Checks if MFR rooms exist
✅ Attempts to join each room
✅ Shows detailed error information
✅ Provides actionable recommendations

## Integration Test

For CI/CD or automated verification, use the integration test:

```bash
./test-mfr-rooms.sh
```

This runs a comprehensive three-phase test:
1. Creates rooms
2. Verifies with a different user
3. Queries room information

## Manual Verification (Using Prosody CLI)

You can also check rooms directly with Prosody:

```bash
# List all rooms
prosodyctl mod_muc rooms conference.tensegrity.it

# Get room info
prosodyctl mod_muc room_info mfr-construct@conference.tensegrity.it

# Delete a room if needed
prosodyctl mod_muc delete_room mfr-construct@conference.tensegrity.it
```

## Recommended Workflow

1. **First time setup:**
   ```bash
   node src/examples/diagnose-mfr-rooms.js
   node src/examples/create-mfr-rooms-verified.js
   node src/examples/diagnose-mfr-rooms.js
   ```

2. **After Prosody restart:**
   ```bash
   node src/examples/diagnose-mfr-rooms.js
   # If rooms missing, create them again
   ```

3. **Before starting MFR system:**
   ```bash
   node src/examples/diagnose-mfr-rooms.js
   # Ensure all 3 rooms are joinable
   ./start-all.sh mfr
   ```

4. **Troubleshooting:**
   ```bash
   node src/examples/diagnose-mfr-rooms.js
   # Read the recommendations
   # Fix Prosody config if needed
   # Delete and recreate rooms if needed
   ```

## Success Criteria

Rooms are ready when:
- ✅ All 3 rooms appear in server room list
- ✅ All 3 rooms are joinable (no item-not-found)
- ✅ All 3 rooms persist after creator leaves
- ✅ All 3 rooms are accessible by different users
- ✅ Room information is queryable via disco#info

Run `diagnose-mfr-rooms.js` - if it says "All MFR rooms exist and are joinable!", you're ready to go!
