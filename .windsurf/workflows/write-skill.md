---
description: สร้าง Skill ใหม่ที่มีโครงสร้างมาตรฐาน
---

## ขั้นตอนการสร้าง Skill ใหม่

Workflow นี้ใช้สำหรับสร้าง Skill ใหม่ที่มีโครงสร้างที่ชัดเจนและเป็นมาตรฐาน ประกอบด้วยไฟล์ `SKILL.md`, `rules/`, และ `scripts/`

### 1. File Structure (โครงสร้างไฟล์)

โครงสร้างไฟล์มาตรฐานสำหรับ Skill ใหม่มีดังนี้:

```
skills/
└── [skill-name]/
    ├── rules/
    │   └── [skill-name]-[rule-name].md
    ├── scripts/
    │   └── [skill-name]-[script-name].ts
    └── SKILL.md
```

**ข้อกำหนด:**
- ทุก Skill ต้องมี `SKILL.md` หลัก
- ทุก Skill ต้องมีโฟลเดอร์ `rules/` สำหรับเก็บ rules
- ทุก Skill ต้องมีโฟลเดอร์ `scripts/` สำหรับเก็บ scripts

**ขั้นตอนการสร้าง:**

1.  **สร้างโฟลเดอร์หลักสำหรับ Skill:**
    *   ไปที่ไดเรกทอรี `skills/`
    *   สร้างโฟลเดอร์ใหม่สำหรับ Skill โดยใช้ชื่อแบบ `kebab-case` (เช่น `react-performance`)

2.  **สร้างโฟลเดอร์ `rules`:**
    *   ภายในโฟลเดอร์ Skill ที่สร้างขึ้น ให้สร้างโฟลเดอร์ย่อยชื่อ `rules`

3.  **สร้างโฟลเดอร์ `scripts`:**
    *   ภายในโฟลเดอร์ Skill ที่สร้างขึ้น ให้สร้างโฟลเดอร์ย่อยชื่อ `scripts`

4.  **สร้างไฟล์หลัก:**
    *   สร้างไฟล์เปล่า `SKILL.md` ภายในโฟลเดอร์หลักของ Skill

### 2. เขียนเนื้อหา SKILL.md

ไฟล์ `SKILL.md` เป็นไฟล์หลักที่รวบรวมภาพรวมของ Skill ทั้งหมมี มีโครงสร้างดังนี้:

````markdown
# [ชื่อ Skill ที่ชัดเจน]

## Rules by category

### [ชื่อหมวดหมู่ 1]

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `CRITICAL` | `[skill-name]-[rule-name]` | (from rule frontmatter) | (from rule frontmatter) | `[skill-name]-` | [เงื่อนไขการใช้ Rule] |
| 2 | `HIGH` | `[skill-name]-[rule-name]` | (from rule frontmatter) | (from rule frontmatter) | `[skill-name]-` | [เงื่อนไขการใช้ Rule] |

### [ชื่อหมวดหมู่ 2]

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `CRITICAL` | `[skill-name]-[rule-name]` | (from rule frontmatter) | (from rule frontmatter) | `[skill-name]-` | [เงื่อนไขการใช้ Rule] |

## Scripts by category

### [ชื่อหมวดหมู่ 1]

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `CRITICAL` | `[skill-name]-[script-name]` | (from script frontmatter) | (from script frontmatter) | `[skill-name]-` | [เงื่อนไขการใช้ Script] |
| 2 | `HIGH` | `[skill-name]-[script-name]` | (from script frontmatter) | (from script frontmatter) | `[skill-name]-` | [เงื่อนไขการใช้ Script] |

## How to Use

อธิบายโครงสร้างของไฟล์ Rule และ Script แต่ละไฟล์ และวิธีการนำไปใช้

-   อธิบายว่าแต่ละไฟล์ Rule ประกอบด้วยอะไรบ้าง
-   อธิบายว่าแต่ละไฟล์ Script ประกอบด้วยอะไรบ้าง
-   ตัวอย่าง Link ไปยังไฟล์ Rule:
    -   [`./rules/[skill-name]-[rule-name].md`](./rules/[skill-name]-[rule-name].md)
-   ตัวอย่าง Link ไปยังไฟล์ Script:
    -   [`./scripts/[skill-name]-[script-name].ts`](./scripts/[skill-name]-[script-name].ts)
````

### 3. สร้างไฟล์ Rule ย่อย

สำหรับแต่ละ Rule ใน `Quick Reference` ให้สร้างไฟล์ Markdown แยกในโฟลเดอร์ `rules/`

**ข้อกำหนดสำคัญ:** ชื่อไฟล์ของ Rule จะต้องขึ้นต้นด้วยชื่อของ Skill ( `[skill-name]` ) ตามด้วยชื่อของ Rule นั้นๆ คั่นด้วย `-` (เช่น `vue-component-naming.md` สำหรับ skill `vue`)

**ข้อกำหนดสำคัญ:**
- **ค้นคว้าข้อมูลก่อนเขียน:** ก่อนจะเขียนเนื้อหาในไฟล์ Rule ใดๆ ให้ทำการค้นคว้าและสรุปเนื้อหาจากแหล่งข้อมูลต้นฉบับที่น่าเชื่อถือก่อนเสมอ
- **ใช้ AGENTS.md:** หากไฟล์ `AGENTS.md` มีเนื้อหาอยู่แล้ว ให้นำมาใช้เป็นข้อมูลประกอบ
- **เริ่มต้นด้วยไฟล์ว่าง:** ในเบื้องต้น ไฟล์ Rule จะถูกสร้างเป็นไฟล์ว่าง และจะได้รับการอัปเดตเมื่อผู้ใช้ให้ข้อมูล

การเขียนเนื้อหาสำหรับแต่ละ Rule ให้ปฏิบัติตามแนวทางใน Workflow `@/write-rules` อย่างเคร่งครัด

### 4. สร้างไฟล์ Script ย่อย

สำหรับแต่ละ Script ให้สร้างไฟล์ TypeScript แยกในโฟลเดอร์ `scripts/`

**ข้อกำหนดสำคัญ:** ชื่อไฟล์ของ Script จะต้องขึ้นต้นด้วยชื่อของ Skill ( `[skill-name]` ) ตามด้วยชื่อของ Script นั้นๆ คั่นด้วย `-` (เช่น `vue-check-props.ts` สำหรับ skill `vue`)

**ข้อกำหนดสำคัญ:**
- **ค้นคว้าข้อมูลก่อนเขียน:** ก่อนจะเขียนเนื้อหาในไฟล์ Script ใดๆ ให้ทำการค้นคว้าและสรุปเนื้อหาจากแหล่งข้อมูลต้นฉบับที่น่าเชื่อถือก่อนเสมอ
- **เริ่มต้นด้วยไฟล์ว่าง:** ในเบื้องต้น ไฟล์ Script จะถูกสร้างเป็นไฟล์ว่าง และจะได้รับการอัปเดตเมื่อผู้ใช้ให้ข้อมูล

### 5. Example `SKILL.md`

นี่คือตัวอย่างของไฟล์ `SKILL.md` ที่สมบูรณ์สำหรับ Skill `vue-best-practices`:

````markdown
# Vue Best Practices

## Rules by category

### 1. Component Design (การออกแบบ Component)

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `CRITICAL` | `vue-sfc-structure` | Single-File Component Structure | กำหนดโครงสร้างมาตรฐานสำหรับไฟล์ `.vue` | `vue-` | ใช้เมื่อสร้างหรือแก้ไขไฟล์ `.vue` |
| 2 | `HIGH` | `vue-props-declaration` | Props Declaration | แนวทางการประกาศ Props ที่ชัดเจนและ type-safe | `vue-` | ใช้เมื่อ Component มีการรับ Props |

### 2. Reactivity & State Management (การจัดการ State)

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `HIGH` | `vue-computed-properties` | Computed Properties | การใช้ Computed Properties แทน logic ที่ซับซ้อนใน template | `vue-` | ใช้เมื่อมี logic ใน template ที่ขึ้นอยู่กับ state |

## Scripts by category

### 1. Component Validation (การตรวจสอบ Component)

| Priority | Impact | Reference | Name | Description | Prefix | Condition |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `HIGH` | `vue-check-props` | Check Props Usage | ตรวจสอบการใช้ props ว่าถูกต้องตามปฏิบัติ | `vue-` | ใช้เมื่อต้องการตรวจสอบ props |

## How to Use

การเขียนเนื้อหาสำหรับแต่ละ Rule ให้ปฏิบัติตามแนวทางใน Workflow `@/write-rules` อย่างเคร่งครัด

-   [`./rules/vue-sfc-structure.md`](./rules/vue-sfc-structure.md)
-   [`./rules/vue-props-declaration.md`](./rules/vue-props-declaration.md)
-   [`./rules/vue-computed-properties.md`](./rules/vue-computed-properties.md)

การเขียนเนื้อหาสำหรับแต่ละ Script ให้ปฏิบัติตามแนวทางใน Workflow `@/write-scripts` อย่างเคร่งครัด

-   [`./scripts/vue-check-props.ts`](./scripts/vue-check-props.ts)
````
