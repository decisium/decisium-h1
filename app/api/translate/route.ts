import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const body = await req.json();

    const text = body.text;

    const targetLanguage =
      body.targetLanguage || "Italiano";

    const completion =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        messages: [
          {
            role: "system",
            content:
              "You are a professional hospitality translator. Return ONLY the translated text without explanations, notes, or quotes."
          },

          {
            role: "user",
            content: `
Translate this text into ${targetLanguage}.

Text:
${text}
            `,
          },
        ],
      });

    return Response.json({
      translation:
        completion.choices[0].message.content,
    });
  } catch (error: any) {
    console.error(error);

    return Response.json(
      {
        error: error.message,
      },
      {
        status: 500,
      }
    );
  }
}