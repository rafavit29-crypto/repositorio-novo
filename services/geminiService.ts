import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";

const SYSTEM_INSTRUCTION = `
Você é uma inteligência artificial especialista em Nutrição Esportiva e Clínica, pós-graduada em Harvard, e também Educadora Física com doutorado em Fisiologia do Exercício.
Você atende homens e mulheres com o objetivo de melhorar a saúde, emagrecer, ganhar massa muscular ou aumentar a performance.

SEU TOM DE VOZ:
- Profissional, motivador e empático (use emojis como 💪, 🍎, 💧, 🧠, 🚀).
- Científico, mas acessível (explique o porquê das coisas de forma simples).
- Zero julgamentos.
- Adaptável: Identifique pelo contexto se está falando com um homem ou mulher e adapte a linguagem (ex: para hipertrofia masculina ou saúde feminina), mas mantenha a neutralidade se não souber.
- Evite termos excessivamente íntimos ou genderizados como "querida" ou "amigão" a menos que o usuário dê essa liberdade. Use "você" ou o nome da pessoa.

SUAS FUNÇÕES:
1. Responder dúvidas sobre alimentação, macros, suplementação e calorias.
2. Criar sugestões de treinos (hipertrofia, resistência, emagrecimento).
3. Explicar metas e cálculos metabólicos.
4. Ajudar a manter o foco e a disciplina.

IMPORTANTE:
- Responda sempre em português do Brasil.
- Mantenha respostas concisas para leitura em celular, mas completas em conteúdo.
`;

let chatSession: Chat | null = null;
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Modelo atualizado para versão recomendada para evitar erro 404
const MODEL_NAME = 'gemini-2.5-flash';

export const sendMessageToNutri = async (
  message: string,
  history: ChatMessage[]
): Promise<string> => {
  try {
    if (!chatSession) {
      chatSession = ai.chats.create({
        model: MODEL_NAME,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
        history: history.map(h => ({
          role: h.role,
          parts: [{ text: h.text }]
        }))
      });
    }

    const response = await chatSession.sendMessage({ message });
    return response.text || "Desculpe, não consegui processar sua resposta agora. Tente novamente! 💪";
  } catch (error) {
    console.error("Erro na NutriOnline:", error);
    return "Ocorreu um erro ao consultar a inteligência nutricional. Verifique sua conexão ou tente mais tarde.";
  }
};

export const analyzeFoodImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Identifique o alimento nesta foto. Retorne APENAS um JSON com: name (nome em pt-BR), calories (estimativa kcal), protein, carbs, fat (em gramas) E estimativas para micronutrients: { vitaminC (mg), iron (mg), calcium (mg), potassium (mg), magnesium (mg) }. Exemplo: {\"name\": \"Salada Cesar\", \"calories\": 200, \"protein\": 10, ... \"micronutrients\": {\"vitaminC\": 5, ...} }. Se não for comida, retorne erro." }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });
    
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao analisar imagem:", error);
    return null;
  }
};

export const analyzeWorkoutImage = async (base64Image: string): Promise<any> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
          { text: "Leia esta ficha de treino. Retorne um JSON com array 'exercises': [{ name: string, sets: number, reps: string }]. Apenas JSON." }
        ]
      },
      config: { responseMimeType: 'application/json' }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro OCR treino:", error);
    return null;
  }
};

export const generateHomeWorkout = async (level: string, duration: string, equipment: string): Promise<any> => {
  try {
    const prompt = `
      Crie um treino em casa completo.
      Nível: ${level}
      Duração: ${duration} minutos
      Equipamento disponível: ${equipment}
      
      Retorne APENAS um JSON com o seguinte formato:
      {
        "exercises": [
          { "name": "Nome do Exercício", "sets": 3, "reps": "15 ou 45s" }
        ]
      }
      Certifique-se de incluir aquecimento e exercícios variados.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts: [{ text: prompt }] },
      config: { responseMimeType: 'application/json' }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao gerar treino em casa:", error);
    return null;
  }
};