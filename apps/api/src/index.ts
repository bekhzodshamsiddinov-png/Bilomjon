import { catalog } from '@bilim/content';
import { readFlags } from '@bilim/core';
import { createApp } from './app';
import { importSessionKey } from './session';

const flags = readFlags(process.env);
const sessionKey = importSessionKey(process.env.TUTOR_SESSION_SECRET);

export const app = createApp({ catalog, demoContent: flags.demoContent, sessionKey });
export default app;
