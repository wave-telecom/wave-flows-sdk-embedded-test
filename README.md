# sdk-embedded

Host de demonstração do **Wave Embed SDK**. É a página estática de
`wave-journeys-web/examples/host/index.html`, empacotada para rodar com Node e
para ir ao ar no Vercel — o objetivo é mostrar a integração funcionando para o
cliente.

A página implementa o lado *host* do contrato: responde `wave:ready` com
`wave:auth`, redimensiona o iframe com `wave:resize` e valida `event.origin` em
toda mensagem recebida.

## Rodando local

```bash
npm start            # http://localhost:8080
PORT=4000 npm start  # outra porta
```

Sem dependências — `server.js` é um servidor estático em Node puro, o
equivalente do `python -m http.server` que usávamos antes.

A porta é **diferente da do frame** (`http://localhost:3000`) de propósito: é o
único jeito de exercitar `frame-ancestors` e a checagem de origem de verdade.

## Deploy no Vercel

O projeto é 100% estático: `vercel.json` aponta `outputDirectory` para
`public/`, sem build step. Basta importar o repositório no Vercel — nenhuma
variável de ambiente é necessária.

Depois de publicado, aponte o campo **Origem do frame** para a URL pública do
frame (ex.: `https://<frame>.vercel.app`) e garanta que essa origem aceite o
domínio do host em `frame-ancestors`.

> O `accessToken` digitado na página fica só em memória e no `localStorage` do
> navegador de quem está testando — nunca vai para a URL do frame nem é
> versionado aqui. Para a demo, use um token de sandbox.

## Estrutura

```
sdk-embedded/
├── public/index.html   # a página host
├── server.js           # servidor estático (local)
├── vercel.json         # deploy estático
└── package.json
```
