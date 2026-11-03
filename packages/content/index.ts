import type { Catalog } from '@bilim/core';
import raw from './generated/catalog.json';

/** Build vaqtida validatsiyadan o'tgan katalog (packages/content/scripts/build.ts). */
export const catalog = raw as unknown as Catalog;
export default catalog;
