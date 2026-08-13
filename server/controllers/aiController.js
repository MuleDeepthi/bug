const analyzeBug = async (req, res) => {
  try {
    const { title, description, priority, severity } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        message: "Bug title and description are required",
      });
    }

    const prompt = `
You are an intelligent software defect analysis assistant.

Analyze the following software bug and provide practical resolution
assistance to a software development team.

BUG INFORMATION

Title:
${title}

Description:
${description}

Priority:
${priority || "Not specified"}

Severity:
${severity || "Not specified"}

Provide the analysis using these sections:

1. Possible Root Cause
Explain the most likely technical causes.

2. Suggested Resolution
Provide a practical solution.

3. Debugging Steps
Give clear step-by-step debugging actions.

4. Severity Assessment
Determine whether the bug appears Low, Medium, High, or Critical
based only on the information provided.

5. Prevention Suggestions
Suggest ways to prevent similar bugs.

IMPORTANT:
- Do not invent information.
- If there is not enough information to determine the root cause,
  clearly say that further investigation is required.
- Keep the explanation clear and developer-friendly.
`;

    const response = await fetch("http://127.0.0.1:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3:4b-instruct",
        prompt: prompt,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();

      console.error("Ollama error:", errorText);

      return res.status(500).json({
        message: "Local AI analysis failed",
        error: errorText,
      });
    }

    const data = await response.json();

    const analysis = data.response;

    if (!analysis) {
      return res.status(500).json({
        message: "Local AI did not return an analysis",
      });
    }

    res.status(200).json({
      message: "Bug analyzed successfully",
      analysis,
    });

  } catch (error) {
    console.error("AI bug analysis error:", error);

    res.status(500).json({
      message: "AI analysis failed",
      error: error.message,
    });
  }
};

module.exports = {
  analyzeBug,
};