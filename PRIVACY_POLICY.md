# Privacy Policy for Tab Search - Cross Window

**Last Updated:** March 17, 2025

## Overview

Tab Search - Cross Window ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we handle data in our Chrome extension.

## Data Collection and Use

### What Data We Collect

This extension accesses the following data **locally on your device only**:

- **Tab Information**: Titles and URLs of open browser tabs
- **Tab Metadata**: Favicon URLs and tab status (active/audible)

### What We Do NOT Collect

We do **NOT** collect:
- Personal identifiable information (name, email, address)
- Login credentials or passwords
- Financial information
- Health information
- Location data
- Browsing history (past visits)
- Content from web pages you visit
- Any data transmitted to external servers

### How We Use Data

The tab information is used solely for:
1. Displaying a searchable list of your open tabs
2. Enabling quick navigation between tabs
3. Filtering tabs based on your search query

**All data processing happens locally on your device.** No data is transmitted to our servers or any third parties.

## Data Storage

- **Local Storage Only**: Tab access times are stored locally using `chrome.storage.local` for the time-based sorting feature
- **No Cloud Sync**: Your tab information never leaves your browser
- **No Permanent History**: We only track the last access time of currently open tabs, not your browsing history
- **Data Removal**: Access time data is removed when tabs are closed

## Data Sharing

We do **NOT** share, sell, or transfer any data to third parties.

## Permissions Justification

- **`tabs`**: Required to list and switch between open tabs, read tab titles/URLs for search
- **`windows`**: Required to group tabs by window and switch between windows when jumping to a tab
- **`storage`**: Required to store tab last access times for the time-based sorting feature

## Changes to This Policy

We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated date.

## Contact Us

If you have any questions about this Privacy Policy, please contact us through the Chrome Web Store support channel.

## Compliance

This extension complies with:
- Chrome Web Store Developer Program Policies
- GDPR (General Data Protection Regulation) principles
- CCPA (California Consumer Privacy Act) requirements

---

**Summary**: Tab access times are stored locally on your device for the time-based sorting feature. No data is transmitted to external servers or shared with third parties.