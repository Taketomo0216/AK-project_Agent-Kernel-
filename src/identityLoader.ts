import { readFileSync } from 'fs';
import { join } from 'path';
import { IdentityBundle, IdentityDocuments, IdentityLoadResult } from './types';

const identityDir = join(process.cwd(), 'identity');
const identityFiles = {
  identity: 'IDENTITY.md',
  soul: 'SOUL.md',
  constitution: 'CONSTITUTION.md',
  operatingProtocol: 'OPERATING_PROTOCOL.md',
  memoryPolicy: 'MEMORY_POLICY.md',
  responseSpec: 'RESPONSE_SPEC.md'
} satisfies Record<keyof IdentityDocuments, string>;

let cachedIdentityLoad: IdentityLoadResult | undefined;

function freezeIdentityBundle(bundle: IdentityBundle): Readonly<IdentityBundle> {
  Object.freeze(bundle.documents);
  return Object.freeze(bundle);
}

function loadFromDisk(): IdentityLoadResult {
  const loadedFiles = ['config.json'];
  const config = JSON.parse(readFileSync(join(identityDir, 'config.json'), 'utf8')) as Omit<IdentityBundle, 'documents'>;

  const documents = Object.entries(identityFiles).reduce((accumulator, [key, fileName]) => {
    loadedFiles.push(fileName);
    return {
      ...accumulator,
      [key]: readFileSync(join(identityDir, fileName), 'utf8').trim()
    };
  }, {} as IdentityDocuments);

  return {
    bundle: freezeIdentityBundle({
      ...config,
      documents
    }),
    identityLoaded: true,
    loadedFiles,
    fromCache: false
  };
}

export function loadIdentityBundleWithMeta(): IdentityLoadResult {
  if (cachedIdentityLoad) {
    return {
      ...cachedIdentityLoad,
      loadedFiles: [...cachedIdentityLoad.loadedFiles],
      fromCache: true
    };
  }

  cachedIdentityLoad = loadFromDisk();
  return {
    ...cachedIdentityLoad,
    loadedFiles: [...cachedIdentityLoad.loadedFiles]
  };
}

export function loadIdentityBundle(): Readonly<IdentityBundle> {
  return loadIdentityBundleWithMeta().bundle;
}

export function resetIdentityBundleCache(): void {
  cachedIdentityLoad = undefined;
}
