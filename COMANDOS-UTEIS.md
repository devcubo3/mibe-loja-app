# Comandos Úteis - MIBE Store Web App

Coleção de comandos úteis para desenvolvimento e manutenção do projeto.

## 📦 NPM / Instalação

```bash
# Instalar todas as dependências
npm install

# Instalar dependência específica
npm install nome-do-pacote

# Instalar como dev dependency
npm install -D nome-do-pacote

# Atualizar dependências
npm update

# Verificar dependências desatualizadas
npm outdated

# Limpar cache do npm
npm cache clean --force

# Reinstalar node_modules
rm -rf node_modules package-lock.json
npm install
```

## 🚀 Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Iniciar em porta específica
npm run dev -- -p 3001

# Build de produção
npm run build

# Iniciar servidor de produção
npm run start

# Lint (verificar código)
npm run lint

# Lint e corrigir automaticamente
npm run lint -- --fix
```

## 🎨 Tailwind CSS

```bash
# Gerar classes Tailwind
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css

# Watch mode
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --watch

# Minificado
npx tailwindcss -i ./src/app/globals.css -o ./dist/output.css --minify
```

## 📁 Estrutura de Pastas

```bash
# Criar todas as pastas necessárias (Windows)
mkdir src\components\ui src\components\layout src\components\dashboard src\components\sales src\components\customers src\components\register-sale src\components\empresa src\components\notifications src\components\pwa src\components\providers src\constants src\lib src\hooks src\types src\assets\icons public\icons public\splash public\screenshots

# Criar todas as pastas necessárias (Linux/Mac)
mkdir -p src/components/{ui,layout,dashboard,sales,customers,register-sale,empresa,notifications,pwa,providers} src/{constants,lib,hooks,types,assets/icons} public/{icons,splash,screenshots}
```

## 🗄️ Supabase

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login no Supabase
supabase login

# Inicializar projeto local
supabase init

# Iniciar Supabase localmente
supabase start

# Parar Supabase local
supabase stop

# Ver status
supabase status

# Gerar tipos TypeScript do banco
supabase gen types typescript --project-id "seu-project-id" --schema public > src/types/supabase.ts
```

## 🔍 Git

```bash
# Inicializar repositório
git init

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "mensagem"

# Adicionar remote
git remote add origin url-do-repositorio

# Push
git push -u origin main

# Status
git status

# Ver diferenças
git diff

# Ver log
git log --oneline

# Criar branch
git checkout -b nome-da-branch

# Voltar para main
git checkout main

# Merge branch
git merge nome-da-branch

# Pull
git pull origin main
```

## 🖼️ Gerar Ícones PWA

```bash
# Instalar ferramenta de geração de ícones
npm install -g pwa-asset-generator

# Gerar ícones a partir de uma imagem SVG
pwa-asset-generator logo.svg public/icons --icon-only --favicon

# Gerar splash screens
pwa-asset-generator logo.svg public/splash --splash-only

# Gerar tudo de uma vez
pwa-asset-generator logo.svg public --background "#FFFFFF" --opaque false
```

## 📱 Testar PWA

```bash
# Build de produção
npm run build

# Iniciar em modo produção
npm run start

# Servir build localmente com HTTPS (necessário para PWA)
npx serve -s out -p 3000 --ssl-cert cert.pem --ssl-key key.pem

# Ou usar o Next.js em produção
npm run start
```

## 🧪 Testes

```bash
# Instalar Jest
npm install -D jest @testing-library/react @testing-library/jest-dom

# Rodar testes
npm test

# Rodar testes em watch mode
npm test -- --watch

# Rodar testes com coverage
npm test -- --coverage
```

## 🔧 Debugging

```bash
# Ver variáveis de ambiente
echo $NEXT_PUBLIC_SUPABASE_URL

# Limpar cache do Next.js
rm -rf .next

# Ver informações do Next.js
npx next info

# Analisar bundle
npm run build -- --analyze
```

## 🚢 Deploy

### Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy para produção
vercel --prod

# Ver logs
vercel logs
```

### Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy para produção
netlify deploy --prod
```

## 📊 Análise de Performance

```bash
# Lighthouse (no Chrome DevTools)
# F12 > Lighthouse > Generate Report

# Bundle Analyzer
npm install -D @next/bundle-analyzer

# Analisar bundle
ANALYZE=true npm run build
```

## 🔐 Segurança

```bash
# Verificar vulnerabilidades
npm audit

# Corrigir vulnerabilidades automaticamente
npm audit fix

# Forçar correções (pode quebrar coisas)
npm audit fix --force

# Ver detalhes de vulnerabilidades
npm audit --json
```

## 📝 Utilitários

```bash
# Abrir projeto no VS Code
code .

# Encontrar arquivos por nome
find . -name "*.tsx"

# Contar linhas de código
find src -name "*.tsx" -o -name "*.ts" | xargs wc -l

# Remover todos os node_modules do projeto e subpastas
find . -name "node_modules" -type d -prune -exec rm -rf '{}' +

# Ver tamanho das pastas
du -sh *

# Listar portas em uso
netstat -ano | findstr :3000  # Windows
lsof -i :3000                  # Linux/Mac
```

## 🎯 Comandos Personalizados

Adicione ao `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "clean": "rm -rf .next out node_modules",
    "fresh": "npm run clean && npm install",
    "type-check": "tsc --noEmit",
    "format": "prettier --write \"src/**/*.{js,jsx,ts,tsx,json,css,md}\"",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

Uso:

```bash
npm run clean        # Limpar arquivos temporários
npm run fresh        # Reinstalar tudo do zero
npm run type-check   # Verificar tipos TypeScript
npm run format       # Formatar código
npm run analyze      # Analisar tamanho do bundle
```

## 🐛 Solução de Problemas Comuns

```bash
# Erro: Port 3000 already in use
# Windows:
netstat -ano | findstr :3000
taskkill /PID [número] /F

# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Erro: Module not found
rm -rf node_modules package-lock.json
npm install

# Erro: TypeScript types
npm install -D @types/node @types/react @types/react-dom

# Erro: Supabase não conecta
# Verificar .env.local e reiniciar servidor

# Erro: PWA não instala
# Fazer build de produção e testar
npm run build && npm run start
```

## 📚 Links Úteis

```bash
# Documentação Next.js
open https://nextjs.org/docs

# Documentação Tailwind
open https://tailwindcss.com/docs

# Documentação Supabase
open https://supabase.com/docs

# Lucide Icons
open https://lucide.dev

# Can I Use (compatibilidade)
open https://caniuse.com
```

## 🎨 VS Code Extensions Recomendadas

```bash
# Instalar extensão via CLI
code --install-extension extensao-id

# Extensões recomendadas:
code --install-extension dbaeumer.vscode-eslint
code --install-extension esbenp.prettier-vscode
code --install-extension bradlc.vscode-tailwindcss
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension formulahendry.auto-rename-tag
code --install-extension christian-kohler.path-intellisense
```

---

**Salve este documento para consulta rápida durante o desenvolvimento!**
