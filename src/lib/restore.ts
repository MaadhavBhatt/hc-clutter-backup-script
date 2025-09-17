import { getConfig, getPasswordForFolder } from './config.js';
import { restoreFolder } from './backupLogic.js';

export async function restoreCommand(
  folderName: string,
  options: { target?: string }
) {
  const config = getConfig();
  const folder = config.folders.find((f: any) => f.name === folderName);
  if (!folder) {
    console.error('Folder not found in config.');
    process.exit(1);
  }
  const password = await getPasswordForFolder(folder.name);
  await restoreFolder(folder, password, options.target);
  console.log('Restore complete.');
}
