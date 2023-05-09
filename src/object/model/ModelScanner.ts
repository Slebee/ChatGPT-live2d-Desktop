import {
  readDir,
  BaseDirectory,
  FileEntry,
  readTextFile,
} from '@tauri-apps/api/fs';

function processEntries(entries: FileEntry[]) {
  for (const entry of entries) {
    console.log(`Entry: ${entry.path}`);
    if (entry.children) {
      processEntries(entry.children);
    }
  }
}

function transformEntriesToFiles(entries: FileEntry[], flat = false): File[] {
  const files: File[] = [];

  if (flat) {
    for (const entry of entries) {
      if (entry.children) {
        files.push(...transformEntriesToFiles(entry.children));
      } else {
        files.push(new File([entry.path], entry.name!));
      }
    }
    return files;
  } else {
    for (const entry of entries) {
      if (entry.children) {
        files.push(
          new File(transformEntriesToFiles(entry.children, true), entry.name!),
        );
      } else {
        files.push(new File([entry.path], entry.name!));
      }
    }
    return files;
  }
}
export class ModelScanner {
  static async scan() {
    const entries = await readDir('', {
      dir: BaseDirectory.App,
      recursive: true,
    });
    return entries;
  }

  static async getModels() {
    const appFolder = await this.scan();
    const modelsFolder = appFolder.find((folder) => folder.name === 'models');
    if (modelsFolder) {
      return transformEntriesToFiles(modelsFolder.children! ?? []);
    }
    return [];
  }
}
