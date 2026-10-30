import {lstat, readFile, readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {cvePattern, validateImplementation} from './cve-content.mjs';
const root = fileURLToPath(new URL('../', import.meta.url));
try {
  if (!process.env.CRADLE_LIBRARY) throw new Error('Set CRADLE_LIBRARY to a cradle-lib checkout');
  const library = path.resolve(process.env.CRADLE_LIBRARY);
  const builtins = new Set(['linux-routing', 'win-routing']);
  for (const entry of await readdir(root, {withFileTypes: true})) {
    if (!cvePattern.test(entry.name)) continue;
    const manifest = await validateImplementation(path.join(root, entry.name), entry.name);
    for (const name of manifest.configs) {
      if (builtins.has(name)) continue;
      const filename = path.join(library, 'configs', name, 'ansible', `${name}.j2`);
      if (!(await lstat(filename)).isFile() || !(await readFile(filename, 'utf8')).trim()) throw new Error(`${entry.name}: missing implied config ${name}`);
    }
  }
  console.log('All manifest-implied configuration templates exist. Templates were not rendered or executed.');
} catch (error) {console.error(error.message); process.exitCode = 1;}
