# KG Weight Tracker 🏋️

A lightweight, native mobile application for tracking daily weight measurements with ease. Built with NativeScript and Vue.js, this app provides a simple yet powerful way to monitor your fitness progress.

## Features

✨ **Simple & Intuitive UI**
- Clean, distraction-free interface
- One-tap weight entry
- Instant visual feedback

📊 **Track Your Progress**
- Record daily weight measurements
- View complete history with timestamps
- Edit or delete entries anytime

🔒 **Local Storage**
- All data stored locally on your device using SQLite
- No cloud sync required
- Complete privacy control

⚡ **Fast & Responsive**
- Native performance
- Minimal battery drain
- Lightweight footprint

## Getting Started

### Prerequisites
- Node.js 16+
- NativeScript CLI: `npm install -g nativescript`
- Android SDK (for Android builds)
- Xcode (for iOS builds)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/swastik-chatterjee/cautious-umbrella.git
cd cautious-umbrella
```

2. Install dependencies:
```bash
npm install
```

3. Run on Android:
```bash
ns run android
```

4. Run on iOS:
```bash
ns run ios
```

## Project Structure

```
cautious-umbrella/
├── app/
│   ├── app.ts              # Application entry point
│   ├── components/
│   │   └── Home.vue        # Main tracking interface
│   ├── services/
│   │   └── StorageService.ts  # Database management
│   └── styles/
│       └── app.css         # Global styles
├── package.json            # Dependencies
├── tsconfig.json          # TypeScript configuration
└── codemagic.yaml         # CI/CD configuration
```

## Usage

1. **Add a Weight Entry**: Enter your weight in kg and tap "Add Entry"
2. **Edit an Entry**: Select an entry and tap the edit icon to modify it
3. **Delete an Entry**: Tap the delete icon to remove an entry
4. **View History**: Scroll through all your recorded weight measurements

## Technology Stack

- **Framework**: NativeScript 8.6+
- **UI Framework**: Vue.js 3
- **Language**: TypeScript
- **Database**: SQLite
- **Build Tool**: NativeScript Webpack

## Development

### Building for Production

**Android:**
```bash
ns build android --release --no-hmr
```

**iOS:**
```bash
ns build ios --release --no-hmr
```

### Running in Dev Mode

```bash
ns debug android
ns debug ios
```

## Contributing

We welcome contributions! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE.txt](./LICENSE.txt) file for details.

## Third-Party Licenses

See [THIRD_PARTY.md](./THIRD_PARTY.md) for a complete list of third-party libraries and their licenses.

## Support

For issues, questions, or suggestions, please open an issue on [GitHub Issues](https://github.com/swastik-chatterjee/cautious-umbrella/issues).

## Changelog

### Version 1.0.0
- Initial release
- Basic weight tracking functionality
- SQLite local storage
- Edit and delete capabilities
