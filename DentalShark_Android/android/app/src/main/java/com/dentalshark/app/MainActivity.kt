package com.dentalshark.app

import com.getcapacitor.BridgeActivity

/**
 * Entry point for the native Android shell. Capacitor's BridgeActivity
 * does the real work — creating the WebView, wiring up the JS bridge, and
 * loading the app from android/app/src/main/assets/public (the built
 * React app). This class only needs to exist so the manifest has an
 * Activity to launch; there's nothing else to add unless you're
 * registering a native Capacitor plugin.
 */
class MainActivity : BridgeActivity()
