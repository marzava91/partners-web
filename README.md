# MIJI Markets – Partners Web (Admin Panel & POS)

Frontend web para **socios comerciales de MIJI Markets**.  
Esta aplicación funciona como **Panel Administrativo + Punto de Venta (POS)** para tiendas asociadas, con soporte **offline**, enfoque **multi-tenant** y arquitectura escalable.

📍 Dominio objetivo: **https://partners.mijimarkets.com**

---

## 🎯 Objetivo del Proyecto

Proveer a los socios de MIJI Markets una plataforma web para:

- Gestionar productos, precios e inventario
- Operar ventas mediante POS web
- Administrar pedidos y estados
- Configurar tienda, horarios y preferencias
- Operar **offline-first** en entornos con conectividad limitada
- Sincronizar datos con el Core Platform API

Este frontend **NO contiene lógica de negocio crítica**; consume APIs del backend central.

---

## 🧱 Arquitectura General

┌─────────────────────────────┐
│ partners.mijimarkets.com │
│ (Next.js App Router) │
└───────────────▲─────────────┘
│ HTTP / WS
┌───────────────┴─────────────┐
│ Core Platform API (NestJS) │
│ PostgreSQL + Prisma │
└─────────────────────────────┘


---

## 🛠️ Stack Tecnológico

### Frontend
- **Next.js 16** (App Router)
- **React + TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **lucide-react** (iconografía)

### Estado & Datos
- **TanStack Query** → server state
- **Zustand** → UI & local state
- **React Hook Form + Zod** → formularios y validación

### Offline & PWA
- **PWA (next-pwa)**
- **IndexedDB (Dexie)** para cache y operación offline
- Estrategia *offline-first + sync posterior*

### Backend (referencia)
- **NestJS**
- **PostgreSQL**
- **Prisma**
- Arquitectura multi-tenant

---

## 📁 Estructura del Proyecto

```txt

app/                        # App Router (layouts y routes)
├── (auth)/                 # Login, recuperación, etc.
├── (partner)/              # Área protegida del socio
├── layout.tsx
├── page.tsx
└── globals.css

src/
├── modules/
│   ├── auth/
│   ├── inventory/
│   ├── orders/
│   ├── pos/
│   ├── products/
│   └── settings/
└── shared/
    ├── api/
    ├── hooks/
    ├── types/
    ├── ui/
    └── utils/


src/
├── modules/                # Dominios funcionales
│   ├── auth/
│   ├── products/
│   ├── inventory/
│   ├── orders/
│   ├── pos/
│   └── settings/
│
├── shared/                 # Código reutilizable
│   ├── api/                # Clients HTTP / fetchers
│   ├── ui/                 # Componentes UI base
│   ├── hooks/              # Hooks compartidos
│   ├── types/              # Tipos globales
│   └── utils/              # Helpers
│
public/                     # Assets estáticos
