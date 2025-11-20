# 🔧 Troubleshooting Guide

## Error: EMFILE: too many open files

This is a common macOS issue where the file watcher limit is too low for Metro bundler.

### Quick Fix (Temporary - lasts until restart)

Run these commands in your terminal:

```bash
# Increase file descriptor limits
ulimit -n 10240

# Then start Expo again
npx expo start
```

### Permanent Fix (Recommended)

1. **Create or edit the limit configuration file:**

```bash
# Create the file
sudo nano /Library/LaunchDaemons/limit.maxfiles.plist
```

2. **Paste this content:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>Label</key>
    <string>limit.maxfiles</string>
    <key>ProgramArguments</key>
    <array>
      <string>launchctl</string>
      <string>limit</string>
      <string>maxfiles</string>
      <string>65536</string>
      <string>200000</string>
    </array>
    <key>RunAtLoad</key>
    <true/>
    <key>ServiceIPC</key>
    <false/>
  </dict>
</plist>
```

3. **Save and exit** (Ctrl+X, then Y, then Enter)

4. **Set permissions and load:**

```bash
# Set correct permissions
sudo chown root:wheel /Library/LaunchDaemons/limit.maxfiles.plist
sudo chmod 644 /Library/LaunchDaemons/limit.maxfiles.plist

# Load the configuration
sudo launchctl load -w /Library/LaunchDaemons/limit.maxfiles.plist
```

5. **Restart your terminal** (or restart your computer)

6. **Verify the change:**

```bash
ulimit -n
# Should show 65536 or higher
```

### Alternative: Use Watchman

Watchman is more efficient at file watching:

```bash
# Install Watchman via Homebrew
brew install watchman

# Start Expo (it will automatically use Watchman)
npx expo start
```

---

## Other Common Issues

### Fonts Not Loading

**Symptom:** Warning about fonts or text appears in system font

**Solution:**
```bash
# Clear cache and restart
npx expo start -c
```

### Metro Bundler Won't Start

**Symptom:** Port already in use or bundler crashes

**Solution:**
```bash
# Kill any existing Metro processes
killall node

# Or find and kill the specific process
lsof -ti:8081 | xargs kill

# Restart with cache clear
npx expo start -c
```

### TypeScript Errors

**Symptom:** Cannot find module 'react' or similar

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules
npm install

# Restart
npx expo start -c
```

### Simulator Won't Open

**Symptom:** iOS simulator doesn't launch

**Solution:**
```bash
# Open Xcode and ensure simulators are installed
# Xcode > Preferences > Components

# Or manually open simulator
open -a Simulator

# Then press 'i' in Expo terminal
```

### Android Emulator Issues

**Symptom:** Android emulator doesn't launch

**Solution:**
1. Open Android Studio
2. Tools > AVD Manager
3. Create/start an emulator
4. Then press 'a' in Expo terminal

### Cache Issues

**Symptom:** Changes not reflecting or weird behavior

**Solution:**
```bash
# Nuclear option - clear everything
rm -rf node_modules
npm install
npx expo start -c
```

### Can't Connect from Phone

**Symptom:** QR code scanned but won't connect

**Solution:**
1. Ensure phone and computer on same WiFi
2. Try tunnel mode: `npx expo start --tunnel`
3. Disable VPN if running
4. Check firewall settings

---

## Still Having Issues?

1. Check [Expo troubleshooting docs](https://docs.expo.dev/troubleshooting/overview/)
2. Search [Expo forums](https://forums.expo.dev/)
3. Check if your issue is in the [known issues](https://github.com/expo/expo/issues)

## Useful Commands

```bash
# Clear all caches
npx expo start -c

# Reset Metro bundler
npx react-native start --reset-cache

# Check Expo doctor for issues
npx expo-doctor

# Update Expo CLI
npm install -g expo-cli@latest

# Check versions
npx expo --version
```

