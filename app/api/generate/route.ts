import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const action = formData.get('action') as string;
    
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY || API_KEY.startsWith("AIzaSy...")) {
      return NextResponse.json({ error: 'Please set a valid GEMINI_API_KEY in .env.local' }, { status: 500 });
    }

    if (action === 'optimize') {
      const prompt = formData.get('prompt') as string;
      const language = formData.get('language') as string;
      const ratio = formData.get('ratio') as string;

      if (!prompt) {
        return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
      }

      const systemInstruction = `You are an expert prompt engineer for an image generation AI. Convert the user's description into a rich visual prompt. CRITICAL: You must explicitly identify all Names, Dates, Venues, and event details in the user's text and TRANSLATE them fully into ${language}. Enclose this translated text strictly in double quotes (e.g., text saying "..." ). The output must be just the final descriptive prompt describing the background style, lighting, layout, and where the translated text is placed. Do not write anything else. Aspect ratio hint: ${ratio}.`;
      
      const textRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemInstruction }] },
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2000 }
        })
      });

      if (!textRes.ok) {
          throw new Error("Text optimization failed");
      }
      
      const textData = await textRes.json();
      const optimizedPrompt = textData.candidates?.[0]?.content?.parts?.[0]?.text || `Create a beautiful marketing poster for: ${prompt} in ${language}`;

      return NextResponse.json({ success: true, optimizedPrompt });

    } else if (action === 'generateImg') {
      const optimizedPrompt = formData.get('optimizedPrompt') as string;
      const ratio = formData.get('ratio') as string;

      const imgRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/nano-banana-pro-preview:generateContent?key=${API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: `${optimizedPrompt} --ar ${ratio}` }] }]
        })
      });

      if (!imgRes.ok) {
          const errText = await imgRes.text();
          console.error("Gemini Image API Error Payload:", errText);
          const mockImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
          return NextResponse.json({ 
            success: true, 
            image: `data:image/png;base64,${mockImageBase64}`,
            warning: "API Key valid, but image generation resulted in an error."
          });
      }

      const imgData = await imgRes.json();
      let base64Image = '';
      if (imgData.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data) {
          base64Image = imgData.candidates[0].content.parts[0].inlineData.data;
      } else {
          console.error("Gemini returned invalid structure:", JSON.stringify(imgData, null, 2));
          throw new Error("No image data returned from Gemini");
      }

      return NextResponse.json({ success: true, image: `data:image/jpeg;base64,${base64Image}` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    
  } catch (error: any) {
    console.error('API Error:', error.message || error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
