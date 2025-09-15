import * as fs from 'fs';
import * as path from 'path';

export function initConfigCommand() {
  const defaultConfig = {
    backupDir: 'E:\\cold_backups',
    folders: [
      {
        name: 'GoogleDriveDocs',
        path: 'H:\\My Drive\\Docs',
      },
      // More folders go here
    ],
  };

  const configPath = path.resolve(process.cwd(), 'cold-backup-config.json');
  if (fs.existsSync(configPath)) {
    console.error('Configuration file already exists at', configPath);
    process.exit(1);
  }
  fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));
  console.log('Configuration file created at', configPath);
}
