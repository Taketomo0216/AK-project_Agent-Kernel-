import { readFileSync } from 'fs';
import { join } from 'path';
import { IdentityBundle } from './types';

const identityDir = join(process.cwd(), 'identity');

export function loadIdentityBundle(): IdentityBundle {
  const config = JSON.parse(readFileSync(join(identityDir, 'config.json'), 'utf8')) as Omit<IdentityBundle, 'documents'>;

  return {
    ...config,
    documents: {
      identity: readFileSync(join(identityDir, 'IDENTITY.md'), 'utf8').trim(),
      soul: readFileSync(join(identityDir, 'SOUL.md'), 'utf8').trim(),
      constitution: readFileSync(join(identityDir, 'CONSTITUTION.md'), 'utf8').trim(),
      operatingProtocol: readFileSync(join(identityDir, 'OPERATING_PROTOCOL.md'), 'utf8').trim(),
      memoryPolicy: readFileSync(join(identityDir, 'MEMORY_POLICY.md'), 'utf8').trim(),
      responseSpec: readFileSync(join(identityDir, 'RESPONSE_SPEC.md'), 'utf8').trim()
    }
  };
}
