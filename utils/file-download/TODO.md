# TODO

- [ ] /comparison: เทียบโครงสร้างปัจจุบันกับ /follow-bun (แยก responsibilities, entrypoints)
- [ ] /make-real: ปรับโครงสร้าง src/ ให้เป็น
  - services/ (side effects)
  - types/ (schemas/types)
  - utils/ (pure helpers)
  - index.ts (public/entry)
- [ ] ย้าย/ลบโค้ดซ้ำ: พิจารณาไฟล์ src/download-github.ts (CLI แยก) ว่าควรรวมเป็น bin หรือถอดออก
- [ ] ปรับ package.json ให้เป็น Bun-first ตามมาตรฐานใน repo
  - engines.bun
  - scripts: dev, build, lint, format, test, test:ui (ถ้ามี), verify
  - exports/files/bin ให้ชัด
- [ ] Validate: refactor รอบสุดท้าย + run lint/test
