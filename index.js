#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const ed25519 = require('ed25519');
const { program } = require('commander');
const glob = require('glob');

program
  .name('edsign')
  .version('1.0.0')
  .description('A simple command-line tool for signing files with Ed25519')
  .option('-s, --sign <fileGlob> [comment] [keyPath]', 'Sign files matching the glob pattern with the provided private key')
  .option('-c, --create', 'Create an Ed25519 key pair (private and public keys)')
  .option('-v, --verify <fileOrDirGlob> [publicKeyPath]', 'Verify the signature of files matching the glob pattern with the provided public key (default: ~/.edsign/public.key)')
  .parse(process.argv);

function getEdSignKeyPath() {
  return path.join(os.homedir(), '.edsign', 'private.key');
}

function getEdSignPublicKeyPath() {
  return path.join(os.homedir(), '.edsign', 'public.key');
}

function handleError(error) {
  console.error('Error:', error.message);
  process.exit(1);
}

function validateFilePath(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }
}

function validateDirectoryPath(dirPath) {
  if (!fs.existsSync(dirPath) || !fs.statSync(dirPath).isDirectory()) {
    throw new Error(`Invalid directory: ${dirPath}`);
  }
}

function signFile(filePath, privateKey, comment) {
  try {
    validateFilePath(filePath);
    const fileContents = fs.readFileSync(filePath);
    const signature = ed25519.Sign(fileContents, privateKey);
    const signatureWithComment = comment ? `${signature.toString('base64')} ${comment}` : signature.toString('base64');
    fs.writeFileSync(`${filePath}.sig`, signatureWithComment);
    console.log(`Signed file: ${filePath}`);
  } catch (error) {
    handleError(error);
  }
}

function createKeyPair() {
  try {
    const privateKeyPath = getEdSignKeyPath();
    const publicKeyPath = getEdSignPublicKeyPath();
    const keyPair = ed25519.MakeKeypair();
    fs.mkdirSync(path.dirname(privateKeyPath), { recursive: true });
    fs.writeFileSync(privateKeyPath, keyPair.privateKey);
    fs.writeFileSync(publicKeyPath, keyPair.publicKey); // Write public key to file
    console.log(`Key pair generated successfully.`);
    console.log(`Private key file created: ${privateKeyPath}`);
    console.log(`Public key file created: ${publicKeyPath}`);
  } catch (error) {
    handleError(error);
  }
}

function verifySignature(filePath, publicKeyPath = getEdSignPublicKeyPath()) {
  try {
    validateFilePath(filePath);
    validateFilePath(publicKeyPath);
    const fileContents = fs.readFileSync(filePath);
    const signatureData = fs.readFileSync(`${filePath}.sig`, 'utf-8').split(' ');
    const signature = Buffer.from(signatureData[0], 'base64');
    const publicKey = fs.readFileSync(publicKeyPath);
    const isValid = ed25519.Verify(fileContents, signature, publicKey);
    console.log(`Signature of ${filePath} is ${isValid ? 'valid' : 'invalid'}`);
  } catch (error) {
    handleError(error);
  }
}

function verifyFiles(files, publicKeyPath = getEdSignPublicKeyPath()) {
  files.forEach(file => {
    verifySignature(file, publicKeyPath);
  });
}

function main() {
  if (program.sign) {
    const [fileGlob, comment, keyPath] = program.sign;
    const privateKeyPath = keyPath || getEdSignKeyPath();
    const privateKey = fs.readFileSync(privateKeyPath);
    glob(fileGlob, (err, files) => {
      if (err) {
        handleError(err);
      } else {
        files.forEach(file => {
          signFile(file, privateKey, comment);
        });
      }
    });
  } else if (program.create) {
    createKeyPair();
  } else if (program.verify) {
    const [fileOrDirGlob, publicKeyPath] = program.verify;
    glob(fileOrDirGlob, (err, files) => {
      if (err) {
        handleError(err);
      } else {
        verifyFiles(files, publicKeyPath);
      }
    });
  } else {
    program.help();
  }
}

main();
