# jQuery Version Detector - Chrome Extension

Chrome extension for detecting jQuery library on web pages with color-coded version indicators.

## ✨ Features

- **🔍 Automatic Detection** of jQuery on every visited webpage
- **🎨 Color-Coded Indicators** based on jQuery version:
  - 🔴 **Red** - jQuery 1.x (older version)
  - 🟠 **Orange** - jQuery 2.x
  - 🟢 **Green** - jQuery 3.x+ (latest version)
  - 🔵 **Blue** - jQuery detected but version unknown
  - ⚫ **Gray** - No jQuery found
- **📊 Detailed Information** about version and jQuery source
- **🔗 Source URLs** showing where jQuery is loaded from
- **🏷️ Badge Indicator** with version number on extension icon

## 🚀 Installation

### Manual Installation (Development)

1. **Download or clone** this repository
2. **Open Google Chrome**
3. **Navigate to** `chrome://extensions/`
4. **Enable** "Developer mode" in the top-right corner
5. **Click on** "Load unpacked"
6. **Select the folder** containing this extension
7. **Done!** The icon will appear in your toolbar

### Chrome Web Store (Coming Soon)

The extension will be available on Chrome Web Store after review approval.

## 🧪 Testing

To test the extension features:

1. **Open test page**: `test-page.html`
2. **Or visit** any website with jQuery (e.g., jquery.com)
3. **Watch the icon change** based on detected jQuery version
4. **Click the icon** to view detailed information

## 🎨 Color Indicators

The extension automatically changes icon color based on detected jQuery version:

| Version | Color       | Description                                    |
| ------- | ----------- | ---------------------------------------------- |
| 1.x     | 🔴 Red      | Older jQuery version, update recommended       |
| 2.x     | 🟠 Orange   | Intermediate jQuery version                    |
| 3.x+    | 🟢 Green    | Latest jQuery version                          |
| Unknown | 🔵 Blue     | jQuery detected but version cannot be determined |
| None    | ⚫ Gray     | No jQuery found on the page                    |

## 📁 File Structure

```
├── manifest.json           # Extension configuration
├── background.js           # Background script for icons
├── content.js              # Content script for detection
├── popup.html              # HTML interface
├── popup.js                # Popup logic
├── icons/                  # Extension icons
    ├── icon16.png          # 16x16 base icon
    ├── icon48.png          # 48x48 base icon
    ├── icon128.png         # 128x128 base icon
    ├── icon16-red.png      # jQuery 1.x
    ├── icon16-orange.png   # jQuery 2.x
    ├── icon16-green.png    # jQuery 3.x+
    ├── icon16-blue.png     # Version unknown
    ├── icon16-gray.png     # No jQuery
    └── ... (additional sizes)
```

## 🔒 Privacy

This extension does not collect, store, or transmit any user data. All detection happens locally in your browser. See [Privacy Policy](PRIVACY_POLICY.md) for details.

## 📝 License

MIT License - feel free to use and modify.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Contact

For issues or questions, please open an issue on GitLab.