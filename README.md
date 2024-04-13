# Edsign

Edsign is a simple command-line tool for signing files with Ed25519.

## Installation

You can install Edsign via npm:

```bash
npm install -g edsign
```

## Usage

```
Usage: edsign [options]

Options:
  -V, --version                        output the version number
  -s, --sign <fileGlob> [comment] [keyPath]  Sign files matching the glob pattern with the provided private key
  -c, --create                         Create an Ed25519 key pair (private and public keys)
  -v, --verify <fileOrDirGlob> [publicKeyPath]  Verify the signature of files matching the glob pattern with the provided public key (default: ~/.edsign/public.key)
  -h, --help                           display help for command
```

### Signing Files

To sign files, you can use the `-s` or `--sign` option. You need to provide a file glob pattern, and optionally a comment and a custom key path. If no key path is provided, the tool will use the default private key path (`~/.edsign/private.key`).

Example:
```bash
edsign -s "path/to/files/*.txt" "Signed with Edsign" "custom/private/key/path"
```

### Creating Key Pair

To create an Ed25519 key pair, use the `-c` or `--create` option. This will generate a private key and its corresponding public key, saving them in the default key pair directory (`~/.edsign/`). 

Example:
```bash
edsign -c
```

### Verifying Signatures

To verify the signatures of files, you can use the `-v` or `--verify` option. Provide a file or directory glob pattern, and optionally the path to the public key file. If no public key path is provided, the default public key path (`~/.edsign/public.key`) will be used.

Example:
```bash
edsign -v "path/to/files/*.txt" "custom/public/key/path"
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
