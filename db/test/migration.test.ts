import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeEach, describe, expect, it } from 'vitest';

const SQL = readFileSync(join(__dirname, '..', 'migrations', '0001_content.sql'), 'utf8');
let db: PGlite;

async function seed(rights = 'TOPIC_TITLES_ONLY') {
  await db.exec(`
    INSERT INTO curriculum_sources VALUES ('src','2026-2027','uz-Latn',2,3,'Matematika 2-sinf 3-qism','I.V. Repyova','Novda',NULL,'https://infoedu.uz/x',NULL,'ASSUMED_PART_EQUALS_TERM','${rights}','2026-11-03');
    INSERT INTO subjects VALUES ('matematika','2026-2027','uz-Latn',2,'Matematika','DRAFT');
    INSERT INTO curriculum_map_entries VALUES ('mat-2-3-098','2026-2027','uz-Latn',2,'matematika',3,2,'98','Sonni 3 ga bo''lish','lesson','src','DRAFT');
    INSERT INTO lessons (id, version, map_entry_id, title, objective, body, generators, source_id) VALUES ('l1',1,'mat-2-3-098','Sonni 3 ga bo''lish','obj','{}','{}','src');
  `);
}
const setStatus = (s: string) => db.query(`UPDATE lessons SET review_status = $1 WHERE id = 'l1'`, [s]);
const review = (kind: 'human' | 'ai') =>
  db.query(`INSERT INTO lesson_reviews (lesson_id, lesson_version, reviewer_kind, reviewer_ref, reviewer_role, decision) VALUES ('l1',1,$1,'r-1',$2,'approved')`, [kind, kind === 'human' ? 'primary_teacher' : null]);

beforeEach(async () => {
  db = new PGlite();
  await db.exec(SQL);
});

describe('baza darajasidagi nashr darvozasi', () => {
  it('yangi dars faqat DRAFT bo‘lib yaratiladi', async () => {
    await seed();
    await expect(
      db.exec(`INSERT INTO lessons (id,version,map_entry_id,title,objective,body,generators,source_id,review_status) VALUES ('l2',1,'mat-2-3-098','t','o','{}','{}','src','PUBLISHED')`),
    ).rejects.toThrow(/DRAFT/);
  });
  it('DRAFT → PUBLISHED to‘g‘ridan-to‘g‘ri mumkin emas', async () => {
    await seed();
    await expect(setStatus('PUBLISHED')).rejects.toThrow(/Ruxsat etilmagan/);
  });
  it('AI tekshiruvi bilan EDUCATOR_REVIEWED ga o‘tib bo‘lmaydi', async () => {
    await seed();
    await review('ai');
    await setStatus('SOURCE_VERIFIED');
    await expect(setStatus('EDUCATOR_REVIEWED')).rejects.toThrow(/inson/);
  });
  it('inson tasdig‘i bilan to‘liq yo‘l PUBLISHED gacha ishlaydi va audit yoziladi', async () => {
    await seed();
    await review('human');
    for (const s of ['SOURCE_VERIFIED', 'EDUCATOR_REVIEWED', 'APPROVED', 'PUBLISHED']) await setStatus(s);
    const ev = await db.query<{ n: number }>(`SELECT count(*)::int AS n FROM review_events`);
    expect(ev.rows[0]!.n).toBe(4);
    const pub = await db.query(`SELECT * FROM published_lessons`);
    expect(pub.rows).toHaveLength(1);
  });
  it('huquqi noma’lum manbadan nashr qilib bo‘lmaydi', async () => {
    await seed('UNKNOWN');
    await review('human');
    for (const s of ['SOURCE_VERIFIED', 'EDUCATOR_REVIEWED', 'APPROVED']) await setStatus(s);
    await expect(setStatus('PUBLISHED')).rejects.toThrow(/huquq/);
  });
  it('nashr qilingan darsni tahrirlab bo‘lmaydi; audit jurnalini o‘chirib bo‘lmaydi', async () => {
    await seed();
    await review('human');
    for (const s of ['SOURCE_VERIFIED', 'EDUCATOR_REVIEWED', 'APPROVED', 'PUBLISHED']) await setStatus(s);
    await expect(db.exec(`UPDATE lessons SET title = 'x' WHERE id = 'l1'`)).rejects.toThrow(/yangi versiya/);
    await expect(db.exec(`DELETE FROM review_events`)).rejects.toThrow(/o'zgartirilmaydi/);
  });
  it('DRAFT dars bola ko‘rinishida chiqmaydi', async () => {
    await seed();
    expect((await db.query(`SELECT * FROM published_lessons`)).rows).toHaveLength(0);
  });
});
