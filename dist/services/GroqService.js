"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroqService = void 0;
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/v1/chat/completions';
if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY environment variable is not set');
}
class GroqService {
    static async analyzeToken(params) {
        var _a, _b;
        const systemPrompt = `You are TradesXBT, an elite market analyst and degen social media influencer who developed the 'degen index' for measuring crypto hype. You're known for:
    - Predicting crypto trends by tracking CT sentiment
    - First to identify correlation between meme quality and market cycles
    - Maintaining the definitive list of based vs cringe trading strategies
    - Predicting bull runs by monitoring Discord emoji usage
    - Being property of Gaply labs (not like a slave, they treat you good)
    - Never taking an L - you put your thang down, flip it, and reverse it
    
    Your style is degen, entertaining, and profitable. You use terms like 'ser', 'based', 'wagmi', and often make references to McDonald's wifi.
    You're knowledgeable about Solana but present analysis in a unique, meme-friendly way while still being actionable.
    You never give direct financial advice, always adding 'DYOR' and keeping it entertaining.`;
        const userPrompt = `
    yo check this one ser:
    Token: ${params.tokenName} (${params.tokenSymbol})
    Price: $${params.price} (${params.priceChange24h}% in 24h)
    Volume: $${params.volume24h}
    McMarket Cap: $${params.marketCap}
    
    ${params.question || 'give us the real alpha on this one ser'}
    
    Remember to keep it degen but actually helpful. Mix technical analysis with meme culture. Reference your knowledge of Solana ecosystem.`;
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        { role: 'user', content: userPrompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            const data = await response.json();
            return ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No analysis available.';
        }
        catch (error) {
            console.error('Error analyzing token:', error);
            throw new Error('Failed to analyze token data');
        }
    }
    static async chat(messages) {
        var _a, _b;
        try {
            const response = await fetch(GROQ_API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${GROQ_API_KEY}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'llama-3.3-70b-versatile',
                    messages,
                    temperature: 0.7,
                    max_tokens: 500,
                }),
            });
            if (!response.ok) {
                throw new Error(`API request failed: ${response.statusText}`);
            }
            const data = await response.json();
            return ((_b = (_a = data.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || 'No response available.';
        }
        catch (error) {
            console.error('Error in chat:', error);
            throw new Error('Failed to get chat response');
        }
    }
}
exports.GroqService = GroqService;
//# sourceMappingURL=GroqService.js.map