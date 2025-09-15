#! /usr/bin/env node
import { program } from 'commander';
import { backupCommand } from './lib/backup';
import { restoreCommand } from './lib/restore';
import { initConfigCommand } from './lib/initConfig';

program
  .name('cold-backup-cli')
  .description('CLI tool to back up folders to encrypted cold storage')
  .version('0.1.0');

program
  .command('init')
  .description('Initialize a config file')
  .action(initConfigCommand);

program
  .command('backup')
  .description('Run backup for all configured folders')
  .option('-f, --full', 'Force a full backup (not incremental)')
  .action(backupCommand);

program
  .command('restore <folderName>')
  .description('Restore a folder from backup')
  .option('-t, --target <path>', 'Target directory for restore')
  .action(restoreCommand);

program.parse(process.argv);
