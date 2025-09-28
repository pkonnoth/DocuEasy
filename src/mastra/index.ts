import { Mastra } from '@mastra/core';

// Disable telemetry globally to avoid configuration issues
declare global {
  var ___MASTRA_TELEMETRY___: boolean;
}
globalThis.___MASTRA_TELEMETRY___ = true;

// Minimal Mastra configuration - empty to avoid build issues
const mastra = new Mastra({});

export { mastra };
export default mastra;
