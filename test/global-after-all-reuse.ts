import { GlobalTestsInfra } from './global-before-all';
import { teardownReuseRuntime } from './e2e-runtime/runtime';

const GLOBAL = global as unknown as GlobalTestsInfra;

export default async () => teardownReuseRuntime(GLOBAL);
