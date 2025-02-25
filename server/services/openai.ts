import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateImageTags(imageDescription: string): Promise<string[]> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that generates relevant tags for UI/UX screenshots. Generate concise, relevant tags that would be useful for searching and categorizing UI elements and design patterns."
        },
        {
          role: "user",
          content: `Generate relevant UI/UX tags for the following screenshot description, return only the tags separated by commas without any other text: ${imageDescription}`
        }
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const tagsText = completion.choices[0]?.message?.content || "";
    return tagsText.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0);
  } catch (error) {
    console.error("Error generating tags:", error);
    return [];
  }
}
