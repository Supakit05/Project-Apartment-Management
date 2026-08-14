# 🏢 Victory Apartment Management System (DevOps Semester Project)

ระบบบริหารจัดการอพาร์ตเมนต์แบบครบวงจร (Full-Stack DevOps) ที่พัฒนาตรงตามข้อกำหนดรายวิชา **Real-World DevOps in Action (30% of Grade)** ด้วย **Spring Boot 3.2.5 (Backend)** + **React 18 / TypeScript (Frontend)** พร้อมระบบ **Docker Compose**, **Kubernetes (Minikube)**, **CI/CD (GitHub Actions)** และ **JUnit 5 Regression Tests**

---

## 📊 ตารางสรุปความสอดคล้องกับ Requirement ของอาจารย์ (Requirement Compliance Table)

| ข้อกำหนดรายวิชา (Syllabus Requirement) | เทคโนโลยีที่ใช้ในโปรเจกต์ | สถานะการทำงาน |
|---|---|:---:|
| **1. Frontend (UX/UI)**<br>*(Usable UX/UI with React/Vue)* | **React 18 + TypeScript + Tailwind CSS**<br>- แผนผัง 24 ห้องพัก (12 ห้อง/ชั้น) แยกสีสถานะ<br>- ออกใบเสร็จ & สัญญาเช่า (พิมพ์และ Save PDF ได้)<br>- ติดตามงานซ่อมบำรุงและตัดสต็อกอะไหล่อัตโนมัติ | 🟢 **ตรงตามโจทย์ 100%** |
| **2. Backend (Spring Boot)**<br>*(RESTful API and business logic)* | **Java 17 + Spring Boot 3.2.5 (Maven)**<br>- REST APIs ครบถ้วนตามมาตรฐานสากล<br>- โลจิกป้องกันการจอง/เช่าซ้อน (Occupancy Conflict Prevention) | 🟢 **ตรงตามโจทย์ 100%** |
| **3. Infrastructure & Containerization**<br>*(Minikube / Kubernetes & Docker)* | **Docker, Docker Compose, Minikube**<br>- มี `Dockerfile` และ `docker-compose.yml`<br>- มีไฟล์ Kubernetes Manifests (`k8s/deployment.yaml`) พร้อมรันบน Minikube | 🟢 **ตรงตามโจทย์ 100%** |
| **4. CI/CD Pipeline**<br>*(Automated build, test, and deploy)* | **GitHub Actions (`.github/workflows/ci-cd.yml`)**<br>- ทดสอบ Automated Test (JUnit 5), Build React และ Build Docker Images อัตโนมัติทุกครั้งที่ Push ขึ้น GitHub | 🟢 **ตรงตามโจทย์ 100%** |
| **5. Testing Strategy**<br>*(Unit & Regression tests)* | **JUnit 5 & Mockito (`backend/src/test`)**<br>- มีการเขียน Automated Tests สำหรับทดสอบ Business Logic หลัก และป้องกัน Regression | 🟢 **ตรงตามโจทย์ 100%** |
| **6. Zero External Dependencies**<br>*(Works 100% locally with no cloud APIs)* | **H2 Local In-Memory / File Database**<br>- รันในเครื่อง 100% ไม่ต้องเชื่อมต่อ Cloud API, Firebase หรือ SaaS ภายนอก | 🟢 **ตรงตามโจทย์ 100%** |

---

## 🧭 ลำดับขั้นตอนการเตรียมเครื่องและการรันใช้งาน (Step-by-Step Execution Guide)

เพื่อความง่ายและไม่สับสน สามารถเลือกรันตามวัตถุประสงค์ได้ 3 รูปแบบตามลำดับก่อน-หลังดังนี้ครับ:

### ⚙️ ขั้นตอนที่ 0: สิ่งที่ควรมีในเครื่อง (Prerequisites)
1. **Docker Desktop** (จำเป็นสำหรับการรัน Container)
2. **Node.js 20+** และ **Java 17 / Maven** (กรณีต้องการรันพัฒนาแบบ Manual)
3. **Minikube** (กรณีต้องการสาธิตการรันบน Kubernetes ให้อาจารย์ดู)

---

### 🐳 วิธีที่ 1: รันด้วย Docker Compose (แนะนำที่สุดสำหรับใช้งานทั่วไป & Showcase)
วิธีนี้ง่ายและเสถียรที่สุด สั่งรันคำสั่งเดียวจะได้ทั้ง Frontend และ Backend พร้อมใช้งานทันที:

```powershell
# 1. สร้างและสั่งรัน Container ทั้งหมด
docker compose up -d --build

# 2. เข้าใช้งานใน Browser:
# Frontend Web UI: http://localhost:3000 (หรือ http://localhost:80)
# Backend API:      http://localhost:8081/api/rooms

# 3. สั่งหยุดการทำงานเมื่อใช้งานเสร็จ:
docker compose stop
```

---

### ☸️ วิธีที่ 2: รันบน Minikube / Kubernetes (เผื่อกรณีอาจารย์ต้องการดูการสาธิต K8s)
หากอาจารย์ต้องการให้สาธิตการทำงานบน **Minikube / Kubernetes Cluster** ให้ทำตามลำดับดังนี้:

```powershell
# สเต็ปที่ 1: เปิดโปรแกรม Docker Desktop ให้เรียบร้อย
# สเต็ปที่ 2: เปิด Minikube ด้วย Docker Driver
minikube start --driver=docker

# สเต็ปที่ 3: Build และ Load อิมเมจเข้า Minikube
docker build -t apartment-backend:latest ./backend
docker build -t apartment-frontend:latest .
minikube image load apartment-backend:latest
minikube image load apartment-frontend:latest

# สเต็ปที่ 4: สั่งส่งไฟล์ Kubernetes Manifests เข้า Cluster
kubectl apply -f k8s/deployment.yaml

# สเต็ปที่ 5: เปิดบริการเพื่อเข้าใช้งานผ่าน Browser
minikube service apartment-frontend-service
```

---

### 💻 วิธีที่ 3: รันแยกพัฒนาเครื่อง (Manual Local Development)
ใช้สำหรับกรณีต้องการแก้ไขโค้ดพัฒนาในเครื่องเป็นหลัก:

#### 1. Backend (Spring Boot API):
```powershell
winget install Apache.Maven #ติดตั้ง maven ก่อน หากยังไม่เจอให้ใช้คำสั่งต่อไปนี้ -> winget source update 
winget search Maven #ดูว่ามี maven ในเครื่องรึยัง
cd backend
dir mvnw* #เช็กว่ามี Maven Wrapper หรือไม่ / ถ้ามีจะะเจอไฟล์ mvnw และ mvnw.cmd
mvn spring-boot:run        # รัน Backend API Server (Port 8085) -> Tomcat started on port 8085 (http) สังเกตุที่ terminal ถ้าขึ้น แสดงว่ารันแบ้คเอนได้แล้ว
```

#### 2. Frontend (React + Vite):
```powershell
#อย่าลืมติดตั้ง Node.js ก่อนนะจ้ะ 
ืnpm -v / node -v >> เช็คเวอร์ชั่นว่ามีมั้ย # แล้วถ้า node ใช้คอมมานผ่าน และ ถ้า npm -v รันไม่ได้ ให้ใช้คำสั่งนี้ก่อน npm.cmd -v เช็คดูว่าขึ้นเลขเวอร์ชั่นมั้ย หลังจากนั้น ใช้คำสั่งนี้  Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned  เพื่อเปลี่ยนมาใช้ npm ถ้ามีให้ขึ้นกด Yes ก็กด  Y ถ้าไม่มีให้ขึ้นก้โอเคแล้ว ปิด powershell แล้วเปิดใหม่ ใช้คอมมานต่อไปได้เลย
npm install
npm run dev   # รัน Frontend Dev Server (Port 3000 / 5173)
```

---

## 🔑 ข้อมูลสำหรับทดสอบเข้าสู่ระบบ (System Credentials)

### 👑 บัญชีผู้ดูแลระบบ (Admin Access)
* **URL หน้า Login**: `http://localhost:3000/login` (หรือตาม URL ของ Minikube)
* **Email / Username**: `admin` *(หรือ `admin@victoryapartment.com`)*
* **Password**: `admin`

### 👤 บัญชีลูกค้า (Customer Access)
* สามารถกดปุ่ม **Sign Up** หน้าเว็บเพื่อสมัครสมาชิกใหม่ด้วยอีเมลใดก็ได้ แล้วล็อกอินเข้าใช้งานระบบลูกค้าได้ทันที

---

## 🧪 การทดสอบระบบและ CI/CD (Automated Testing & CI/CD)

1. **Automated Regression Tests (JUnit 5)**:
   ```powershell
   cd backend
   mvn test
   ```
   *ทดสอบโลจิก `LeaseServiceTest` (ป้องกันเช่าซ้อน) และ `RoomServiceTest` (โครงสร้าง 24 ห้องพัก)*

2. **GitHub Actions CI/CD Pipeline**:
   * ทุกครั้งที่มีการ `git push origin main` ขึ้น GitHub ระบบ CI/CD ในไฟล์ [.github/workflows/ci-cd.yml](file:///.github/workflows/ci-cd.yml) จะทำการตรวจสอบโค้ด รัน JUnit Tests และ Build อิมเมจให้อัตโนมัติ (สถานะ Passed สีเขียว 100%)
