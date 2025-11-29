
import { DictionaryEntry } from "../types";

// No API Key needed anymore!

export const lookupWord = async (word: string, contextSentence?: string): Promise<DictionaryEntry> => {
  try {
    // 1. Fetch English Definition & Audio from Free Dictionary API
    const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    const dictData = await dictRes.json();
    
    let definitionEn = "No definition found.";
    let partOfSpeech = "unknown";
    let ipa = "";
    let audioUrl = "";
    let exampleEn = "";

    if (Array.isArray(dictData) && dictData.length > 0) {
        const entry = dictData[0];
        ipa = entry.phonetic || (entry.phonetics.find((p: any) => p.text)?.text) || "";
        
        // Try to find audio
        const audioEntry = entry.phonetics.find((p: any) => p.audio && p.audio !== "");
        if (audioEntry) audioUrl = audioEntry.audio;

        if (entry.meanings.length > 0) {
            const meaning = entry.meanings[0];
            partOfSpeech = meaning.partOfSpeech;
            if (meaning.definitions.length > 0) {
                definitionEn = meaning.definitions[0].definition;
                exampleEn = meaning.definitions[0].example || "";
            }
        }
    }

    // 2. Fetch Chinese Translation using Google Translate GTX (Free endpoint)
    // Using a reliable public endpoint used by many extensions
    const translateRes = await fetch(
        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(word)}`
    );
    const translateData = await translateRes.json();
    const definitionZh = translateData[0]?.[0]?.[0] || "無法取得翻譯";

    // Translate example if exists, otherwise placeholder
    let exampleZh = "";
    if (exampleEn) {
         try {
            const exRes = await fetch(
                `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-TW&dt=t&q=${encodeURIComponent(exampleEn)}`
            );
            const exData = await exRes.json();
            exampleZh = exData[0]?.[0]?.[0] || "";
         } catch (e) {
             exampleZh = "-";
         }
    }

    return {
        word: word,
        partOfSpeech,
        ipa,
        definitionEn,
        definitionZh,
        exampleEn: exampleEn || "No example available.",
        exampleZh: exampleZh || "無例句",
    };

  } catch (error) {
    console.error("Lookup Error:", error);
    return {
      word: word,
      partOfSpeech: "unknown",
      ipa: "",
      definitionEn: "Could not retrieve definition.",
      definitionZh: "查詢失敗 (請檢查網路)",
      exampleEn: "-",
      exampleZh: "-"
    };
  }
};

// Static Demo Transcript Generator (No AI)
export const generateDemoTranscript = async (topic: string): Promise<{en: string, zh: string}[]> => {
    // Simulating "AI" with preset scenarios based on keywords, or generic fallback
    const lowerTopic = topic.toLowerCase();
    
    await new Promise(r => setTimeout(r, 800)); // Fake delay

    if (lowerTopic.includes("food") || lowerTopic.includes("cooking")) {
        return [
            { en: "First, chop the onions finely.", zh: "首先，把洋蔥切碎。" },
            { en: "Heat the pan with some olive oil.", zh: "用一些橄欖油加熱平底鍋。" },
            { en: "Sauté the vegetables until golden brown.", zh: "把蔬菜炒到金黃色。" },
            { en: "Add a pinch of salt and pepper.", zh: "加一小撮鹽和胡椒。" },
            { en: "Serve immediately while it's hot.", zh: "趁熱立即上菜。" }
        ];
    }
    
    if (lowerTopic.includes("travel")) {
        return [
            { en: "Make sure to pack your passport.", zh: "確保帶上你的護照。" },
            { en: "We are arriving at the airport terminal.", zh: "我們即將抵達機場航廈。" },
            { en: "The view from the hotel is amazing.", zh: "飯店的景色非常棒。" },
            { en: "Let's ask the locals for recommendations.", zh: "我們來問問當地人的推薦吧。" },
            { en: "This is the best vacation ever.", zh: "這是最棒的假期。" }
        ];
    }

    // Generic English Learning
    return [
        { en: "Learning English is a journey, not a race.", zh: "學英文是一趟旅程，不是比賽。" },
        { en: "Practice makes perfect, so don't give up.", zh: "熟能生巧，所以不要放棄。" },
        { en: "Try to listen to English every single day.", zh: "試著每天都聽英文。" },
        { en: "Vocabulary helps you express your ideas.", zh: "單字能幫助你表達想法。" },
        { en: "You are doing a great job!", zh: "你做得很好！" }
    ];
}
