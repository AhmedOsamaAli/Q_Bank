const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the Gemini client with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to evaluate an open-ended answer
const evaluateOpenEndedAnswer = async (question, answer) => {
  try {
    // Select the model (use a valid model name, e.g., gemini-1.5-flash)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Construct the prompt for evaluation
    const prompt = `Evaluate the following answer based on the question. Provide the response in JSON format with fields: similarityScore (0-100), isCorrect (boolean), and feedback (string).
Question: ${question}
Answer: ${answer}`;

    // Generate content using the model
    const result = await model.generateContent({
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    });

    // Extract the response text
    const text = result.response.candidates[0].content.parts[0].text;

    // Clean and parse the response into JSON
    const cleanedText = text.replace(/```json|```/g, '').trim();
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error('Gemini API Error:', error.message);
    return {
      similarityScore: 0,
      isCorrect: false,
      feedback: 'Evaluation failed due to technical error',
    };
  }
};

// Export the function for use in other parts of the application
module.exports = { evaluateOpenEndedAnswer };