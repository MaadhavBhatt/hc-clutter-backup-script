import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline-sync';

export function getConfig() {
  const configPath = path.resolve(process.cwd(), 'cold-backup-config.json');
  if (!fs.existsSync(configPath)) {
    console.error(
      `Config file not found at ${configPath}. Run cold-backup-cli init first.`
    );
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
}

export async function getPasswordForFolder(
  folderName: string
): Promise<string> {
  return readline.question(`Enter password for folder "${folderName}": `, {
    hideEchoBack: true,
  });
}
