# Roteiro de viagem — guia completo

O app é `index.html` — abre em qualquer navegador, sem instalar nada. As três etapas abaixo são independentes: você pode implementar só a primeira e parar por aí, ou seguir até a terceira.

---

## 1. Painel de edição (planilha em vez de código)

Em vez de editar o arquivo `index.html` a cada viagem, você edita uma planilha do Google Sheets.

**Passo a passo:**

1. Crie uma cópia da planilha usando o arquivo `modelo-planilha.csv` como referência de colunas (abra no Google Sheets: Arquivo → Importar → Upload)
2. Preencha uma linha por item do roteiro. Colunas:
   - `client_name`, `day_label`, `day_date`, `iso_date` (formato `AAAA-MM-DD`, usada na etapa 3), `day_theme`
   - `type`: `flight`, `hotel`, `ticket`, `transit`, `activity` ou `reminder`
   - `time`, `title`, `sub`
   - `origin`, `destination` — só preencha para linhas `transit` se for usar a etapa 2
3. No Google Sheets: **Arquivo → Compartilhar → Publicar na Web**, formato **CSV**, e copie o link gerado
4. Abra `index.html`, encontre `CONFIG.SHEET_CSV_URL` no início do `<script>`, e cole o link entre as aspas
5. Salve — o app agora lê da planilha. Pra atualizar um roteiro, basta editar a planilha (o app busca os dados sempre que é aberto)

Se `SHEET_CSV_URL` ficar vazio, o app usa os dados de exemplo (`TRIP_FALLBACK`) que já estão no arquivo.

---

## 2. Deslocamento calculado (Google Maps)

Calcula o tempo real de trajeto para os itens `transit` que tiverem `origin` e `destination` preenchidos na planilha.

Isso precisa rodar num servidor (não dá pra chamar a API do Google Maps direto do navegador sem expor a chave). O arquivo `netlify/functions/travel-time.js` já está pronto para isso.

**Passo a passo:**

1. Suba a pasta inteira num repositório e conecte no [Netlify](https://netlify.com) (ele detecta `netlify.toml` e a pasta `netlify/functions` automaticamente)
2. No [Google Cloud Console](https://console.cloud.google.com), crie uma chave de API com a **Distance Matrix API** ativada
3. No Netlify, vá em Site settings → Environment variables e adicione `GOOGLE_MAPS_API_KEY` com essa chave
4. No `index.html`, defina `CONFIG.TRAVEL_TIME_FUNCTION_URL = "/.netlify/functions/travel-time"`
5. Publique — os itens de deslocamento passam a mostrar o tempo real de trajeto

---

## 3. Lembretes automáticos (WhatsApp e/ou e-mail)

Envia todo dia, automaticamente, o roteiro e os lembretes daquele dia para o cliente — sem precisar abrir o app.

O arquivo `netlify/functions/send-reminders.js` já está pronto, e `netlify.toml` já agenda ele para rodar diariamente às 07:00 (horário de Brasília).

**Passo a passo:**

1. Depois de publicar no Netlify (mesma etapa 2), vá em Environment variables e adicione:
   - `SHEET_CSV_URL` — o mesmo link CSV da etapa 1
   - Para WhatsApp: crie uma conta no [Twilio](https://www.twilio.com/whatsapp) e adicione `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_FROM`, e `RECIPIENT_WHATSAPP` (número do cliente, formato `whatsapp:+5511999999999`)
   - Para e-mail: crie uma conta no [Resend](https://resend.com) e adicione `RESEND_API_KEY`, `RESEND_FROM`, e `RECIPIENT_EMAIL`
   - Configure pelo menos um dos dois canais — não precisa dos dois
2. Garanta que a coluna `iso_date` de cada linha da planilha está preenchida com a data certa (`AAAA-MM-DD`) — é ela que decide o que enviar em cada dia
3. Pronto — o Netlify roda a função automaticamente todo dia no horário configurado em `netlify.toml`

Se quiser testar sem esperar o horário agendado, dá pra rodar a função manualmente pelo painel do Netlify (Functions → send-reminders → Trigger).

---

## 4. Deixar como app (instalável no celular)

O site já está configurado como PWA (Progressive Web App): tem ícone próprio, abre em tela cheia (sem barra do navegador) e funciona mesmo com internet instável, uma vez que o cliente já tenha aberto antes.

**Importante:** isso só funciona no link publicado (Netlify), com HTTPS — não funciona abrindo o `index.html` direto do computador.

**Como o cliente instala:**

*iPhone (Safari):*
1. Abra o link do roteiro no Safari
2. Toque no ícone de compartilhar (quadrado com seta para cima)
3. Toque em "Adicionar à Tela de Início"

*Android (Chrome):*
1. Abra o link do roteiro no Chrome
2. Toque nos três pontinhos no canto superior direito
3. Toque em "Instalar app" ou "Adicionar à tela inicial"

Depois disso, o roteiro fica com ícone próprio no celular do cliente, abre como um app normal, e atualiza sozinho toda vez que ele abrir com internet (porque continua lendo da planilha).

---

## Resumo do que cada etapa exige

| Etapa | Precisa de conta externa? | Roda onde |
|---|---|---|
| 1. Planilha | Google Sheets (grátis) | Só no navegador |
| 2. Deslocamento | Google Cloud (chave de API, tem cota grátis) | Netlify Functions |
| 3. Lembretes | Twilio e/ou Resend (contas pagas ou com plano grátis limitado) | Netlify Functions agendadas |
| 4. Instalar como app | Não — já vem pronto | Precisa estar publicado com HTTPS (Netlify) |

Cada etapa funciona de forma independente das outras — dá pra parar em qualquer uma delas.
