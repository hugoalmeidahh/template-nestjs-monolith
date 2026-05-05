import { GlobalTestsInfra } from './global-before-all';
import { teardownFullRuntime } from './e2e-runtime/runtime';

const GLOBAL = global as unknown as GlobalTestsInfra;

export default async () => teardownFullRuntime(GLOBAL);
