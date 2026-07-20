# 🚀 Deploy CarTrack na Vercel

## Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Repositório do projeto no GitHub

---

## 1. Subir o projeto no GitHub

Abra o terminal na pasta `CarTrack/app` e rode:

```bash
git init
git add .
git commit -m "feat: CarTrack PWA ready"
git remote add origin https://github.com/SEU_USUARIO/cartrack.git
git branch -M main
git push -u origin main
```

> ⚠️ **Importante:** O `.env` **NÃO** é enviado ao GitHub por segurança (está no `.gitignore`). As variáveis de ambiente são configuradas direto na Vercel.

---

## 2. Importar na Vercel

1. Acesse [vercel.com/new](https://vercel.com/new)
2. Clique em **"Import Git Repository"**
3. Selecione seu repositório `cartrack`
4. A Vercel detecta automaticamente o Vite — clique em **Deploy**

---

## 3. Configurar Variáveis de Ambiente na Vercel

Na página do projeto na Vercel, vá em:
`Settings → Environment Variables`

Adicione as duas variáveis:

| Nome | Valor |
|---|---|
| `VITE_SUPABASE_URL` | `https://cbnanibvmysozeusfsgt.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `sb_publishable_xjKfheeNY74sv7-Ty5GRZA_VrrLa4aO` |

Depois clique em **Redeploy** para aplicar.

---

## 4. Atualizar o app futuramente

Para qualquer atualização, simplesmente:

```bash
git add .
git commit -m "feat: minha atualização"
git push
```

A Vercel detecta o push automaticamente e faz o deploy em ~30 segundos. ✅

---

## 5. Instalar como PWA (app no celular)

Após o deploy, acesse o link da Vercel no celular:

- **Android (Chrome):** Toque nos 3 pontinhos → "Adicionar à tela inicial"
- **iPhone (Safari):** Toque no botão compartilhar → "Adicionar à tela de início"

O CarTrack vai aparecer como um app nativo na tela inicial! 📱
