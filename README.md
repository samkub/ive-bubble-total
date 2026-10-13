# Live Bubble Total — วิธีติดตั้ง

## 1) Firebase
1. เปิด https://console.firebase.google.com/ แล้วสร้าง Project
2. เพิ่ม Web app (ไอคอน </>) แล้วคัดลอก `firebaseConfig` มาแทนค่าใน `firebase-config.js`
3. Build > Authentication > Sign-in method: เปิด **Anonymous** และ **Email/Password**
4. Authentication > Users > Add user: สร้างบัญชีอีเมลและรหัสผ่านของผู้จัดงาน
5. คัดลอก **User UID** ของบัญชีผู้จัดงานจากหน้า Users ไปแทน `REPLACE_ADMIN_UID` ใน `firestore.rules`
6. Build > Firestore Database > Create database เลือกภูมิภาคที่เหมาะสม และสร้างฐานข้อมูล
7. Firestore Database > Rules: วางเนื้อหาจาก `firestore.rules` และกด Publish

## 2) อัปโหลดเว็บฟรีด้วย Firebase Hosting (แนะนำ)
1. ติดตั้ง Node.js LTS บนคอมพิวเตอร์
2. เปิด Terminal ในโฟลเดอร์นี้แล้วรัน `npm install -g firebase-tools`
3. รัน `firebase login`
4. รัน `firebase init hosting` เลือกโปรเจกต์ที่สร้าง; public directory ใส่ `.`; single-page app ตอบ `N`; GitHub deploy ตอบ `N`; ถ้าถาม overwrite index.html ตอบ `N`
5. รัน `firebase deploy --only hosting`
6. จะได้ลิงก์ `https://YOUR-PROJECT.web.app`

## 3) การใช้งาน
- จอโปรเจกเตอร์: `https://YOUR-PROJECT.web.app/?view=screen`
- มือถือผู้ตอบ: `https://YOUR-PROJECT.web.app/?view=join` (QR อยู่บนหน้าจอโปรเจกเตอร์)
- ผู้จัด: `https://YOUR-PROJECT.web.app/?view=admin`
- กดปุ่มเต็มหน้าจอที่หน้าจอโปรเจกเตอร์

## ข้อจำกัดที่ต้องรู้
- จำกัดหนึ่งคำตอบต่อ **Firebase Anonymous UID** ที่เก็บอยู่ในเบราว์เซอร์ ไม่ใช่การพิสูจน์ว่าเป็นคนเดียวกันจริง ผู้ตอบอาจเปลี่ยนเบราว์เซอร์/ล้างข้อมูล/เปลี่ยนอุปกรณ์เพื่อตอบใหม่ได้
- หากต้องการป้องกันหนึ่งคนตอบซ้ำจริง ๆ ให้ใช้ล็อกอินหรือโค้ดเฉพาะบุคคลที่แจกแยกกัน (ต้องปรับระบบเพิ่ม)
- ทุกคนที่เปิดหน้าเว็บสามารถอ่านชื่อและยอดที่ส่งมาได้ อย่าใช้ข้อมูลส่วนตัวหรือข้อมูลลับ
- ฟองอากาศแสดงสูงสุด 120 รายการล่าสุดเพื่อไม่ให้จอแน่น แต่ยอดรวมและจำนวนคนคิดจากทุกคำตอบ
- กดล้างยอดจะลบคำตอบทั้งหมด การส่งรอบใหม่จากอุปกรณ์เดิมอาจต้องรีเฟรชหน้า Join
- Firestore/Hosting มีโควตาฟรีและอาจมีค่าใช้จ่ายเมื่อใช้งานเกินโควตา
- ระบบต้องออนไลน์ผ่าน HTTPS ไม่ควรเปิดไฟล์ index.html ตรงจากเครื่อง
