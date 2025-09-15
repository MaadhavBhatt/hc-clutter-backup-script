import { getConfig, getPasswordForFolder } from './config';
import { backupFolder } from './backupLogic';

export async function backupCommand(options: { full?: boolean }) {
  const config = getConfig();
  for (const folder of config.folders) {
    const password = await getPasswordForFolder(folder.name);
    await backupFolder(folder, password, options.full);
  }
  console.log('Backup completed.');
}
