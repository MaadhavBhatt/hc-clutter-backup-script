# StashCLI

A TypeScript-based CLI tool for backing up and restoring important folders with AES-256 encryption. Perfect for creating encrypted cold storage backups of your critical data.

I made this tool to manage external backups of important folders on my computer.

## Features

- Backup folders to a specified directory with AES-256-CBC encryption
- Restore folders from backups
- JSON-based configuration for managing multiple folders
- CLI based on Commander.js
- Cross-Platform

## Installation

1. Clone the repository:
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run `npm run dev` to start the application in development mode. This is the only mode available as of now.

## Project Structure

```
hc-clutter-backup-script/
├── src/
│   ├── index.ts              # Main CLI entry point and command definitions
│   └── lib/
│       ├── backup.ts         # Handles backup command
│       ├── backupLogic.ts    # Core backup/restore logic with encryption
│       ├── config.ts         # Configuration file reading and password prompts
│       ├── initConfig.ts     # Initializes configuration
│       └── restore.ts        # Handles restore command
├── cold-backup-config.json   # User configuration file (created after init)
├── package.json
├── tsconfig.json             # TypeScript configuration
├── LICENSE
└── README.md                 # This file
```

## License

This project is open source. See the [LICENSE](LICENSE) file for details.

## Acknowledgments

This project was created as part of [Hack Club's](https://hackclub.com/) [Clutter](https://clutter.hackclub.com/) You-Ship-We-Ship Programme.
