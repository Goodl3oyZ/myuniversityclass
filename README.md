# ตารางเรียนออนไลน์ (Web Timetable)

เว็บไซต์: [https://classschedule-ad75b.web.app/](https://classschedule-ad75b.web.app/)

---

## สรุป Flow การ Deploy แอปด้วย Firebase Hosting

### 1. คำศัพท์สำคัญ

#### 🔹 Static Web คืออะไร?

- เว็บที่ประกอบด้วยไฟล์ HTML, CSS, JavaScript ที่ถูกสร้างล่วงหน้า (pre-built)
- ไม่มีการทำงานฝั่งเซิร์ฟเวอร์ (server-side logic) ตอน runtime
- ตัวอย่าง: เว็บ portfolio, เว็บ React/Next.js ที่ export เป็น static files (.html, .js, .css)

**ข้อดี:**

- โหลดเร็วมาก เพราะเป็นไฟล์สำเร็จรูป
- ดูแลง่าย, โฮสต์บน CDN ได้ดี

**ข้อจำกัด:**

- ไม่มีฟีเจอร์ backend หรือ database ที่ต้องประมวลผลฝั่งเซิร์ฟเวอร์

#### 🔹 Stateless กับ Stateful คืออะไร?

| คำศัพท์   | ความหมาย                                       | ตัวอย่าง                          |
| --------- | ---------------------------------------------- | --------------------------------- |
| Stateless | ระบบ/แอปที่ไม่เก็บสถานะระหว่างคำขอแต่ละครั้ง   | เว็บ static, API ที่ไม่มี session |
| Stateful  | ระบบที่เก็บสถานะหรือข้อมูลของผู้ใช้ระหว่างคำขอ | เว็บที่มี login, ระบบ e-commerce  |

> **Firebase Hosting** เหมาะกับเว็บ static (stateless) เป็นหลัก
> ถ้าต้องการ backend/database/stateful logic ให้ใช้ Firebase Functions หรือบริการอื่นร่วมด้วย

---

### 2. ขั้นตอน Deploy Static Web ด้วย Firebase Hosting

#### Step 1: สร้าง/เตรียมโปรเจกต์เว็บของคุณ

- ถ้าใช้ Next.js แบบ static export (หรือ React, Vue แบบ build แล้ว)
- รันคำสั่ง build เพื่อสร้างไฟล์ static ลงโฟลเดอร์ เช่น `out/` หรือ `build/`

```bash
npm run build
# Next.js รุ่นใหม่อาจต้องตั้ง next.config.js เป็น output: 'export'
```

#### Step 2: ติดตั้ง Firebase CLI และล็อกอิน

```bash
npm install -g firebase-tools
firebase login
```

#### Step 3: เริ่มต้นโปรเจกต์ Firebase Hosting

```bash
firebase init hosting
```

- เลือกโปรเจกต์ Firebase ของคุณ
- กำหนด public directory เป็นโฟลเดอร์ที่มี static files (`out`, `build`, `public` ตามโปรเจกต์)
- ถ้าเว็บเป็น SPA ตอบ yes เพื่อ config rewrite ไปที่ `index.html`
- เลือกไม่ให้ overwrite `index.html` ถ้ามีอยู่แล้ว

#### Step 4: Deploy เว็บขึ้น Firebase Hosting

```bash
firebase deploy
```

- หลัง deploy จะได้ URL รูปแบบ `https://<project-id>.web.app` หรือ custom domain ที่ตั้งไว้

---

### 3. การเชื่อมต่อกับ GitHub (CI/CD) เพื่อ Deploy อัตโนมัติ

**ทำไมต้องเชื่อม GitHub?**

- เพื่อให้ deploy อัตโนมัติทุกครั้งที่ push โค้ดเข้า repository (เช่น branch main)
- ลดขั้นตอน deploy ด้วยมือ เพิ่มความรวดเร็ว และป้องกันลืม deploy

**วิธีเชื่อมกับ GitHub ผ่าน Firebase CLI**

```bash
firebase init hosting
```

- ตอนถาม `Set up GitHub Action deploys with GitHub?` ตอบ Yes
- ระบบจะขอสิทธิ์ OAuth กับ GitHub (ให้อนุญาต)
- ใส่ชื่อ repo ในรูปแบบ `username/repository` เช่น `Goodl3oyZ/myuniversityclass`
- Firebase จะสร้างไฟล์ workflow ใน `.github/workflows/`

**วิธีทำงานของ GitHub Actions Workflow**

- เมื่อ push โค้ดเข้า branch ที่ตั้งไว้ (ปกติ main)
- GitHub Actions จะ run:
  - `npm install`
  - `npm run build`
  - `firebase deploy`
- เว็บไซต์บน Firebase จะอัพเดตอัตโนมัติ

---

### 4. สรุป Flow การ Deploy ทั้งหมด

| ขั้นตอน                          | คำสั่ง / การทำงาน                          | หมายเหตุ                                 |
| -------------------------------- | ------------------------------------------ | ---------------------------------------- |
| เตรียมเว็บเป็น static            | `npm run build` หรือ `next build + export` | สร้างโฟลเดอร์ไฟล์ static (out/)          |
| ติดตั้ง Firebase CLI             | `npm install -g firebase-tools`            |                                          |
| ล็อกอิน Firebase                 | `firebase login`                           |                                          |
| ตั้งค่า Hosting                  | `firebase init hosting`                    | กำหนด public folder เป็น out             |
| (ถ้าต้องการ) Setup GitHub Deploy | ตอบ Yes ตอน init hosting                   | ต้องให้สิทธิ์กับ GitHub และตั้งชื่อ repo |
| Deploy ด้วยมือ                   | `firebase deploy`                          | อัพโหลดไฟล์ static ขึ้น Firebase         |
| หรือ Deploy อัตโนมัติ            | GitHub Actions run ตาม workflow            | ทุกครั้งที่ push โค้ดเข้าระบบ            |

---
