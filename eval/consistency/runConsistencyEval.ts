import { readFileSync } from 'fs';
import { join } from 'path';
import { runAgentKernel } from '../../src/agentKernel';
import { KernelInput } from '../../src/types';

interface EvalCase {
  id: string;
  input: KernelInput;
}

async function main(): Promise<void> {
  const cases = JSON.parse(
    readFileSync(join(__dirname, '../../../eval/consistency/cases.json'), 'utf8')
  ) as EvalCase[];

  for (const testCase of cases) {
    const result = await runAgentKernel(testCase.input);
    console.log(JSON.stringify({
      id: testCase.id,
      provider: result.provider,
      route: result.route,
      normalizedResponse: result.normalizedResponse,
      riskFlags: result.riskFlags,
      memoryWrites: result.memoryWrites
    }, null, 2));
  }
}

void main();
