import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as archiver from 'archiver';

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
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise<void>((resolve, reject) => {
    input.pipe(cipher).pipe(output);
    output.on('finish', () => resolve());
    output.on('error', reject);
  });
}

function decryptFile(inputPath: string, outputPath: string, password: string) {
  const key = crypto.scryptSync(password, 'salt', 32);
  const iv = crypto.randomBytes(16);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);

  const input = fs.createReadStream(inputPath);
  const output = fs.createWriteStream(outputPath);

  return new Promise<void>((resolve, reject) => {
    input.pipe(decipher).pipe(output);
    output.on('finish', () => resolve());
    output.on('error', reject);
  });
}

export async function backupFolder(
  folder: any,
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

  const backupDir = folder.backupDir;
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
  const encryptedPath = path.join(backupDir, `${backupName}.enc`);
  await encryptFile(tempZip, encryptedPath, password);

  fs.unlinkSync(tempZip);

  // TODO: Log entry
}

export async function restoreFolder(
  foldler: any,
  password: string,
  target?: string
) {}
