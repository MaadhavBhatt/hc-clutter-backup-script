import { getConfig, getPasswordForFolder } from './config.js';
import { backupFolder } from './backupLogic.js';

export async function backupCommand(options: { full?: boolean }) {
  const config = getConfig();
  for (const folder of config.folders) {
    const password = await getPasswordForFolder(folder.name);
    await backupFolder(folder, config.backupDir, password, options.full);
  }
  console.log('Backup completed.');
}
