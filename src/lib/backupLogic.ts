import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import archiver from 'archiver';
import extract from 'extract-zip';

function getAllFiles(dir: string, fileList: string[] = []): string[] {
  const files = fs.readdirSync(dir);
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllFiles(filePath, fileList);
    } else {
      fileList.push(filePath);
    }
  });
  return fileList;
}

function encryptFile(inputPath: string, outputPath: string, password: string) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(password, salt, 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise<void>((resolve, reject) => {
    output.write(Buffer.concat([salt, iv]), (err) => {
      if (err) return reject(err);
      input.pipe(cipher).pipe(output);
    });
    output.on('finish', () => resolve());
    output.on('error', reject);
    input.on('error', reject);
  });
}

function decryptFile(inputPath: string, outputPath: string, password: string) {
  const HEADER_LEN = 16 + 16; // salt (16 bytes) + iv (16 bytes)

  const fd = fs.openSync(inputPath, 'r');
  const headerBuf = Buffer.alloc(HEADER_LEN);
  fs.readSync(fd, headerBuf, 0, HEADER_LEN, 0);
  fs.closeSync(fd);

  const salt = headerBuf.slice(0, 16);
  const iv = headerBuf.slice(16, 32);
  const key = crypto.scryptSync(password, salt, 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const input = fs.createReadStream(inputPath, { start: HEADER_LEN });
  const output = fs.createWriteStream(outputPath);

  return new Promise<void>((resolve, reject) => {
    input.pipe(decipher).pipe(output);
    output.on('finish', () => resolve());
    output.on('error', (err) => handleDecryptionError(err, reject));
    input.on('error', reject);
    decipher.on('error', (err) => handleDecryptionError(err, reject));
  });

  function handleDecryptionError(err: any, reject: (err: any) => void) {
    if (
      err.code === 'ERR_OSSL_BAD_DECRYPT' ||
      (err.message && err.message.includes('bad decrypt'))
    ) {
      console.error('Decryption failed: Incorrect password or corrupted file.');
      process.exitCode = 2;
      return;
    }
    reject(err);
  }
}

export async function backupFolder(
  folder: any,
  backupDir: string,
  password: string,
  full?: boolean
) {
  const files = getAllFiles(folder.path);

  const backupName = `${folder.name}_${Date.now()}.zip`;
  const tempZip = path.join(process.cwd(), backupName);
  const output = fs.createWriteStream(tempZip);
  const archive = archiver('zip');

  archive.pipe(output);
  files.forEach((file) => {
    const relative = path.relative(folder.path, file);
    archive.file(file, { name: relative });
  });
  await archive.finalize();

  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const encryptedPath = path.join(backupDir, `${backupName}.enc`);
  await encryptFile(tempZip, encryptedPath, password);

  fs.unlinkSync(tempZip);

  // TODO: Log entry
}

export async function restoreFolder(
  folderName: string,
  backupDir: string,
  password: string,
  target?: string
) {
  const files = fs
    .readdirSync(backupDir)
    .filter((f) => f.startsWith(folderName) && f.endsWith('.zip.enc'))
    .sort();

  if (!files.length) throw new Error('No backups found');
  const latest = files[files.length - 1] || '';
  const encryptedPath = path.join(backupDir, latest);

  const tempZip = path.join(process.cwd(), latest?.replace('.enc', ''));
  await decryptFile(encryptedPath, tempZip, password);

  await extract(tempZip, {
    dir: target ? path.resolve(target) : process.cwd(),
  });

  fs.unlinkSync(tempZip);

  // TODO: Log entry
}
