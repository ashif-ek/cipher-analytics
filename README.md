# 🔐 Cipher Analytics  
### Privacy-Preserving Data Analytics using Homomorphic Encryption

> **Compute on encrypted data. Never expose raw values.**

Cipher Analytics is a secure data processing platform that enables analysis of sensitive numeric datasets **without decrypting them on the server**.

It demonstrates applied use of **Homomorphic Encryption (HE)** in a real backend system.

---

## 🚨 Problem

Traditional systems require:
- Decrypting data before computation
- Processing plaintext in memory

This introduces:
- Critical security vulnerabilities
- High risk of data exposure

---

## ✅ Solution

Cipher Analytics ensures:
- Data is encrypted before storage
- Encrypted data is persisted securely
- Backend avoids handling raw numeric values directly

> Goal: move toward computation on encrypted data (CKKS-based design)

---

## 🧠 Core Idea

### Traditional Flow
```
Encrypt → Store → Decrypt → Compute ❌
```

### Cipher Analytics
```
Encrypt → Store → Compute (Encrypted Domain) ✅
```

---

## 🏗 Architecture

```
Frontend (React)
    ↓
API Layer (Django REST Framework)
    ↓
Processing Layer (Pandas / NumPy)
    ↓
Encryption Layer (TenSEAL - CKKS)
    ↓
Storage (PostgreSQL + Encrypted Files)
```

---

## ⚙️ Tech Stack

### Backend
- Python 3.x
- Django 5 + DRF
- PostgreSQL
- TenSEAL (Homomorphic Encryption)
- Pandas, NumPy
- SimpleJWT (Authentication)
- python-decouple (.env)

### Frontend
- React 19 + Vite
- React Router v7
- Axios

---

## 🔐 Encryption Details

### Scheme: CKKS (Cheon-Kim-Kim-Song)

- Supports approximate arithmetic on encrypted data
- Suitable for analytics and ML workloads

### Configuration
- Poly Modulus Degree: `8192`
- Coeff Modulus: `[60, 40, 40, 60]`
- Scale: `2^40`

### Tradeoffs
- Approximate (not exact precision)
- Computationally expensive
- Large memory footprint

---

## 📂 Project Structure

### `accounts/`
Authentication layer:
- Custom user model (email-based)
- JWT login & registration

---

### `datasets/` (Core Module)

| File | Responsibility |
|-----|--------------|
| models.py | Dataset metadata |
| views.py | REST API |
| serializers.py | Validation |
| services.py | Processing + encryption |
| encryption.py | CKKS implementation |

---

## 🔄 Data Flow

```
User uploads CSV
    ↓
Backend validates file
    ↓
Pandas extracts numeric columns
    ↓
Rows converted to vectors
    ↓
Encrypted using CKKS
    ↓
Serialized (.pkl)
    ↓
Stored + metadata saved
```

---

## 🔑 Design Decisions

### Why CKKS?
- Enables computation on encrypted data
- Supports floating-point numbers

### Why TenSEAL?
- Python-friendly wrapper over Microsoft SEAL
- Efficient vector encryption

### Why service layer?
- Keeps views clean
- Improves maintainability and testability

---

## 📡 API

| Endpoint | Method | Description | Auth |
|--------|-------|------------|------|
| /api/accounts/register/ | POST | Register user | No |
| /api/accounts/login/ | POST | Get JWT | No |
| /api/datasets/ | GET | List datasets | Yes |
| /api/datasets/ | POST | Upload & encrypt | Yes |
| /api/datasets/{id}/ | GET | Dataset detail | Yes |
| /api/datasets/{id}/ | DELETE | Delete dataset | Yes |

---

## 🚀 Setup

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

pip install -r requirements.txt

python manage.py migrate
python manage.py runserver
```

---

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## ⚠️ Current Limitations

- No true encrypted computation API yet (aggregation not implemented)
- Encryption context stored locally (not production-secure)
- No client-side encryption (server still trusted)
- Supports only numeric datasets

---

## 🔮 Future Improvements

- Encrypted aggregation (sum, mean)
- Client-side encryption (zero-trust model)
- Secure key management (KMS / Vault)
- Background processing (Celery)
- Large dataset handling (chunking / streaming)

---

## 🧠 Key Insights

- Homomorphic encryption is significantly slower than plaintext computation
- CKKS introduces approximation errors
- Encrypted data size is much larger than raw data
- Key management is the hardest problem in secure systems

---

## 💡 Why This Project Matters

This is not a CRUD application.

It demonstrates:
- Applied cryptography
- Secure system design
- Backend architecture discipline
- Privacy-first thinking

---

## ⭐ Final Thought

> Systems that require decryption to function are inherently vulnerable.

Cipher Analytics challenges that assumption.
