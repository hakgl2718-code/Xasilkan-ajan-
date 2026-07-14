export async function runReplicateModel(modelNameOrVersion: string, input: any, isVersion = false, customToken?: string) {
  const token = customToken || process.env.REPLICATE_API_TOKEN;
  if (!token) {
    throw new Error('REPLICATE_API_TOKEN bulunamadı. Lütfen Replicate API Token tanımlayın.');
  }

  const url = isVersion 
    ? "https://api.replicate.com/v1/predictions"
    : `https://api.replicate.com/v1/models/${modelNameOrVersion}/predictions`;

  const body: any = { input };
  if (isVersion) {
    body.version = modelNameOrVersion;
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Authorization": `Token ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Replicate API başlatma hatası: ${errorText}`);
  }

  let prediction = await response.json();
  const pollUrl = prediction.urls.get;

  // Poll for result (max 95 seconds)
  const startTime = Date.now();
  while (prediction.status !== "succeeded" && prediction.status !== "failed" && prediction.status !== "canceled") {
    if (Date.now() - startTime > 95000) {
      throw new Error("Replicate işlemi zaman aşımına uğradı (95 saniye).");
    }
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    const pollResponse = await fetch(pollUrl, {
      headers: {
        "Authorization": `Token ${token}`
      }
    });

    if (!pollResponse.ok) {
      throw new Error("Replicate durum sorgulama hatası");
    }
    prediction = await pollResponse.json();
  }

  if (prediction.status === "failed") {
    throw new Error(`Replicate işlemi başarısız oldu: ${prediction.error}`);
  }

  return prediction;
}
