// Calcula o tempo de deslocamento real entre dois pontos usando a
// API do Google Maps (Distance Matrix). Roda como função serverless
// (não expõe a chave da API no navegador).
//
// Configuração necessária (ver LEIA-ME.md):
//   1. Criar uma chave de API no Google Cloud com "Distance Matrix API" ativada
//   2. Definir a variável de ambiente GOOGLE_MAPS_API_KEY no Netlify
//   3. No index.html, definir CONFIG.TRAVEL_TIME_FUNCTION_URL como
//      "/.netlify/functions/travel-time"

exports.handler = async (event) => {
  const { origin, destination, mode } = event.queryStringParameters || {};

  if (!origin || !destination) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Informe origin e destination." })
    };
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "GOOGLE_MAPS_API_KEY não configurada." })
    };
  }

  const url = new URL("https://maps.googleapis.com/maps/api/distancematrix/json");
  url.searchParams.set("origins", origin);
  url.searchParams.set("destinations", destination);
  url.searchParams.set("mode", mode || "driving");
  url.searchParams.set("key", apiKey);

  try {
    const res = await fetch(url.toString());
    const data = await res.json();
    const el = data?.rows?.[0]?.elements?.[0];

    if (!el || el.status !== "OK") {
      return {
        statusCode: 200,
        body: JSON.stringify({ durationText: null, error: "Rota não encontrada." })
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        durationText: el.duration.text,
        durationSeconds: el.duration.value,
        distanceText: el.distance.text
      })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Falha ao consultar o Google Maps." })
    };
  }
};
