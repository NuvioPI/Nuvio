# 📁 Nuvio - Project Structure

*Generated on: 6/9/2026, 7:50:43 PM*

## 📋 Quick Overview

| Metric | Value |
|--------|-------|
| 📄 Total Files | 90 |
| 📁 Total Folders | 38 |
| 🌳 Max Depth | 6 levels |
| 🛠️ Tech Stack | React, Next.js, TypeScript, CSS, Node.js |

## ⭐ Important Files

- 🟡 🚫 **.gitignore** - Git ignore rules
- 🔵 🔍 **eslint.config.mjs** - ESLint config
- 🟡 ▲ **next.config.ts** - Next.js config
- 🟡 🔒 **package-lock.json** - Dependency lock
- 🔴 📦 **package.json** - Package configuration
- 🔴 📖 **README.md** - Project documentation
- 🟡 🔷 **tsconfig.json** - TypeScript config
- 🟡 🔒 **package-lock.json** - Dependency lock

## 📊 File Statistics

### By File Type

- ⚛️ **.tsx** (React TypeScript files): 41 files (45.6%)
- 📄 **.php** (Other files): 23 files (25.6%)
- ⚙️ **.json** (JSON files): 6 files (6.7%)
- 🔷 **.ts** (TypeScript files): 4 files (4.4%)
- 🖼️ **.png** (PNG images): 3 files (3.3%)
- 📄 **.mjs** (Other files): 2 files (2.2%)
- 🎨 **.svg** (SVG images): 2 files (2.2%)
- 📄 **.lock** (Other files): 1 files (1.1%)
- 📄 **.phar** (Other files): 1 files (1.1%)
- 🚫 **.gitignore** (Git ignore): 1 files (1.1%)
- 🖼️ **.jpg** (JPEG images): 1 files (1.1%)
- 🖼️ **.jpeg** (JPEG images): 1 files (1.1%)
- 📖 **.md** (Markdown files): 1 files (1.1%)
- 🖼️ **.ico** (Icon files): 1 files (1.1%)
- 🎨 **.css** (Stylesheets): 1 files (1.1%)
- 📄 **.sql** (Other files): 1 files (1.1%)

### By Category

- **React**: 41 files (45.6%)
- **Other**: 28 files (31.1%)
- **Assets**: 8 files (8.9%)
- **Config**: 6 files (6.7%)
- **TypeScript**: 4 files (4.4%)
- **DevOps**: 1 files (1.1%)
- **Docs**: 1 files (1.1%)
- **Styles**: 1 files (1.1%)

### 📁 Largest Directories

- **root**: 90 files
- **nuvio-front**: 62 files
- **nuvio-front\src**: 44 files
- **nuvio-front\src\components**: 28 files
- **nuvio-back**: 26 files

## 🌳 Directory Structure

```
Nuvio/
├── 📂 nuvio-back/
│   ├── ⚙️ composer.json
│   ├── 📄 composer.lock
│   ├── 📄 composer.phar
│   ├── ⚙️ config/
│   │   ├── 📄 database.php
│   │   └── 📄 jwt.php
│   ├── 📂 controllers/
│   │   ├── 📄 AuthController.php
│   │   ├── 📄 CategoriaController.php
│   │   ├── 📄 RespostaController.php
│   │   ├── 📄 SlaController.php
│   │   └── 📄 TicketController.php
│   ├── 📂 middleware/
│   │   └── 📄 auth.php
│   ├── 📂 models/
│   │   ├── 📄 Administrador.php
│   │   ├── 📄 Anexo.php
│   │   ├── 📄 AvaliacaoTicket.php
│   │   ├── 📄 Categoria.php
│   │   ├── 📄 RespostaTicket.php
│   │   ├── 📄 SLA.php
│   │   ├── 📄 Tecnico.php
│   │   ├── 📄 Ticket.php
│   │   ├── 📄 TipoUsuario.php
│   │   └── 📄 usuario.php
│   ├── 🌐 public/
│   │   ├── 📄 index.php
│   │   └── 📂 uploads/
│   ├── 📂 routes/
│   │   └── 📄 api.php
│   ├── 📂 services/
│   │   └── 📄 JwtService.php
│   └── 🔧 utils/
│   │   ├── 📄 helpers.php
│   │   └── 📄 response.php
├── 📂 nuvio-front/
│   ├── 🟡 🚫 **.gitignore**
│   ├── ⚙️ components.json
│   ├── 🔵 🔍 **eslint.config.mjs**
│   ├── 🔷 next-env.d.ts
│   ├── 🟡 ▲ **next.config.ts**
│   ├── 🟡 🔒 **package-lock.json**
│   ├── 🔴 📦 **package.json**
│   ├── 📄 postcss.config.mjs
│   ├── 🌐 public/
│   │   ├── 🖼️ 2199615.jpg
│   │   ├── 🖼️ arrow-cursor-outline.png
│   │   ├── 🖼️ balls.jpeg
│   │   ├── 🖼️ google-icon.png
│   │   ├── 🎨 N.svg
│   │   ├── 🎨 procurar.svg
│   │   └── 🖼️ sidebar.png
│   ├── 🔴 📖 **README.md**
│   ├── 📁 src/
│   │   ├── 🚀 app/
│   │   │   ├── 📂 (app)/
│   │   │   │   ├── 📂 dashboard/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   ├── ⚛️ layout.tsx
│   │   │   │   ├── 📂 nChamados/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   └── 📂 settings/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 (public)/
│   │   │   │   ├── 📂 login/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   └── 📂 NotFoundPage/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 📂 admin/
│   │   │   │   ├── 📂 dashboard/
│   │   │   │   │   ├── ⚛️ layout.tsx
│   │   │   │   │   ├── ⚛️ page.tsx
│   │   │   │   │   └── 📂 RegisterUsers/
│   │   │   │   │   │   └── ⚛️ page.tsx
│   │   │   │   └── 📂 login/
│   │   │   │   │   └── ⚛️ page.tsx
│   │   │   ├── 🖼️ favicon.ico
│   │   │   ├── 🎨 globals.css
│   │   │   ├── ⚛️ layout.tsx
│   │   │   └── ⚛️ page.tsx
│   │   ├── 🧩 components/
│   │   │   ├── 📂 admin/
│   │   │   │   ├── ⚛️ button.tsx
│   │   │   │   ├── ⚛️ inputPassword.tsx
│   │   │   │   └── ⚛️ inputUser.tsx
│   │   │   ├── 📂 animate-ui/
│   │   │   │   ├── 📂 icons/
│   │   │   │   │   ├── ⚛️ bell.tsx
│   │   │   │   │   ├── ⚛️ chart-spline.tsx
│   │   │   │   │   ├── ⚛️ icon.tsx
│   │   │   │   │   ├── ⚛️ layers.tsx
│   │   │   │   │   ├── ⚛️ layout-dashboard.tsx
│   │   │   │   │   ├── ⚛️ log-out.tsx
│   │   │   │   │   ├── ⚛️ message-square-text.tsx
│   │   │   │   │   ├── ⚛️ moon.tsx
│   │   │   │   │   ├── ⚛️ panel-left-close.tsx
│   │   │   │   │   ├── ⚛️ panel-left-open.tsx
│   │   │   │   │   ├── ⚛️ plus.tsx
│   │   │   │   │   ├── ⚛️ settings.tsx
│   │   │   │   │   ├── ⚛️ sun.tsx
│   │   │   │   │   └── ⚛️ users-round.tsx
│   │   │   │   └── 📂 primitives/
│   │   │   │   │   └── 📂 animate/
│   │   │   │   │   │   └── ⚛️ slot.tsx
│   │   │   ├── 📂 dashboard/
│   │   │   │   └── 🎨 ui/
│   │   │   │   │   ├── ⚛️ actions.tsx
│   │   │   │   │   ├── ⚛️ card.tsx
│   │   │   │   │   ├── ⚛️ recents.tsx
│   │   │   │   │   └── ⚛️ table.tsx
│   │   │   ├── 📂 header/
│   │   │   │   ├── ⚛️ Header.tsx
│   │   │   │   └── 🎨 ui/
│   │   │   │   │   ├── ⚛️ notifications.tsx
│   │   │   │   │   ├── ⚛️ profile.tsx
│   │   │   │   │   ├── ⚛️ searchBar.tsx
│   │   │   │   │   └── ⚛️ toggle.tsx
│   │   │   └── 📂 sidebar/
│   │   │   │   └── ⚛️ Sidebar.tsx
│   │   ├── 🎣 hooks/
│   │   │   └── ⚛️ use-is-in-view.tsx
│   │   └── 📚 lib/
│   │   │   └── 🔷 utils.ts
│   ├── 🔷 tailwind.config.ts
│   └── 🟡 🔷 **tsconfig.json**
├── 📄 Nuvio.sql
└── 🟡 🔒 **package-lock.json**
```

## 📖 Legend

### File Types
- ⚙️ Config: JSON files
- 📄 Other: Other files
- 🚫 DevOps: Git ignore
- 🔷 TypeScript: TypeScript files
- 🖼️ Assets: JPEG images
- 🖼️ Assets: PNG images
- 🖼️ Assets: JPEG images
- 🎨 Assets: SVG images
- 📖 Docs: Markdown files
- ⚛️ React: React TypeScript files
- 🖼️ Assets: Icon files
- 🎨 Styles: Stylesheets

### Importance Levels
- 🔴 Critical: Essential project files
- 🟡 High: Important configuration files
- 🔵 Medium: Helpful but not essential files
