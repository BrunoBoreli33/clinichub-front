<<<<<<< HEAD
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/8cbb4cf4-89c8-4122-a316-7d9206b5af94

## How can I edit this code?

There are several ways of editing your application.
# clinichub-front
Clinic Hub CRM Front End

## Como configurar no Render (passo a passo)

1. Crie um novo serviço Web no Render ou conecte este repositório ao Render.

2. No painel do projeto Render, abra `Environment` → `Environment Variables` (ou `Settings` → `Environment`).

3. Adicione a variável de ambiente para a URL do backend (necessária em produção):

	- Key: `VITE_API_URL`
	- Value: `https://clinichub-back-latest.onrender.com`
	- Envie como `Production` (não `Pull Request` / `Preview`) se quiser só usar em produção.

4. Configure o comando de build (Render geralmente detecta automaticamente via `package.json`):

	- Build Command: `npm run build`
	- Start Command / Serve: `npm run preview` (ou conforme instruções do Render — Render executa a build e serve os assets estáticos automaticamente em algumas configurações)

5. Variáveis opcionais locais

	- Para desenvolvimento local, mantenha o arquivo `.env` com `VITE_API_URL=` vazio (já incluído no repo). Quando a variável estiver vazia, a aplicação usará `http://localhost:8081` como fallback (comportamento para dev).

6. Deploy

	- Após salvar as configurações no Render, acione o deploy (Manual Deploy) ou permita que o Render faça deploy automático ao push no branch configurado (ex.: `main`).

7. Verificação pós-deploy

	- Verifique os logs do deploy no dashboard do Render para garantir que a build completou sem erros.
	- Abra a URL pública fornecida pelo Render e teste fluxos que chamam o backend (login, cadastro, carregamento de chats). As chamadas do frontend irão para `VITE_API_URL` configurada.

8. Dicas e troubleshooting

	- Se nos logs do frontend aparecerem erros de CORS ou 404, verifique se o `VITE_API_URL` está correto e se o backend está acessível publicamente.
	- Caso precise depurar localmente com as mesmas variáveis, exporte `VITE_API_URL` localmente antes de rodar a build:

```bash
# Exemplo local (substitua pela URL de staging se necessário)
export VITE_API_URL=https://clinichub-back-latest.onrender.com
npm run build
npm run preview
```

	- O projeto já inclui um fallback: quando `import.meta.env.VITE_API_URL` for vazio, o frontend usa `http://localhost:8081` (útil para desenvolvimento local).

## Observações

- As chamadas HTTP do frontend foram centralizadas em `src/lib/api.ts` — use `buildUrl('/rota')` ou `API_BASE` quando criar novas chamadas ao backend.
- Se preferir usar um proxy no Vite para desenvolvimento, também é possível configurar `vite.config.ts` com `server.proxy` apontando para `http://localhost:8081`.
