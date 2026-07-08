const axios = require("axios");

class AIService {
  constructor() {
    // Load and validate API key immediately
    this.apiKey = this.loadApiKey();
    this.baseURL = "https://openrouter.ai/api/v1";
    this.model = "deepseek/deepseek-chat-v3-0324"; // Best free model
    this.initialized = false;

    // Rate limiting tracking
    this.lastRequestTime = 0;
    this.minRequestInterval = 2000; // 2 seconds between requests
    this.rateLimitResetTime = null;

    // Do not auto-initialize here to avoid network calls at startup when
    // the API key or network may be unavailable. Initialization will be
    // performed on-demand (e.g., diagnostics or test routes).
  }

  loadApiKey() {
    const key = process.env.OPENROUTER_API_KEY;

    if (!key) {
      console.error("❌ OPENROUTER_API_KEY not found in environment variables");
      return null;
    }

    // Clean the key (remove any whitespace, quotes, newlines)
    const cleanKey = key.trim().replace(/['"]/g, "");

    // Validate key format
    if (!cleanKey.startsWith("sk-or-v1-")) {
      console.error(
        '⚠️  API key format appears incorrect. Should start with "sk-or-v1-"',
      );
      console.error("   Key preview:", cleanKey.substring(0, 15) + "...");
    }

    console.log("✅ API Key loaded");
    console.log("   Length:", cleanKey.length);
    console.log(
      "   Preview:",
      cleanKey.substring(0, 20) +
        "..." +
        cleanKey.substring(cleanKey.length - 5),
    );

    return cleanKey;
  }

  async initialize() {
    if (this.initialized) return;

    console.log("\n🔧 Initializing AI Service...");
    console.log("   Base URL:", this.baseURL);
    console.log("   Model:", this.model);
    console.log("   API Key present:", !!this.apiKey);
    console.log(
      "   Site URL:",
      process.env.SITE_URL || "http://localhost:5173",
    );
    console.log("   Site Name:", process.env.SITE_NAME || "SummarizerApp");

    // Test connection
    if (this.apiKey) {
      const testResult = await this.testConnection();
      if (testResult) {
        console.log("✅ AI Service initialized successfully\n");
        this.initialized = true;
      } else {
        console.error("❌ AI Service initialization failed\n");
      }
    }
  }

  async generateSummary(text, options = {}) {
    try {
      // Validation 1: Check API key
      if (!this.apiKey) {
        console.error("❌ API key validation failed");
        return {
          success: false,
          error:
            "API key not configured. Please set OPENROUTER_API_KEY in your .env file and restart the server.",
        };
      }

      // Validation 2: Check rate limit
      if (this.rateLimitResetTime && Date.now() < this.rateLimitResetTime) {
        const waitSeconds = Math.ceil(
          (this.rateLimitResetTime - Date.now()) / 1000,
        );
        console.warn(
          `⏳ Rate limit active. Please wait ${waitSeconds} seconds.`,
        );
        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitSeconds} seconds before trying again.`,
          rateLimited: true,
          retryAfter: waitSeconds,
        };
      }

      // Validation 3: Enforce minimum interval between requests
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      if (timeSinceLastRequest < this.minRequestInterval) {
        const waitMs = this.minRequestInterval - timeSinceLastRequest;
        console.log(`⏳ Waiting ${waitMs}ms before next request...`);
        await new Promise((resolve) => setTimeout(resolve, waitMs));
      }

      // Validation 4: Check text input
      if (!text || typeof text !== "string") {
        return {
          success: false,
          error: "Invalid text input",
        };
      }

      const { maxLength = 200, style = "concise" } = options;

      // Update last request time
      this.lastRequestTime = Date.now();

      const { systemPrompt, userPrompt } = this.buildEnhancedPrompt(
        text,
        maxLength,
        style,
      );

      console.log("\n📡 Making API request to OpenRouter...");
      console.log("   Text length:", text.length, "characters");
      console.log("   Word count:", text.split(/\s+/).length, "words");
      console.log("   Style:", style);
      console.log("   Max length:", maxLength, "words");
      console.log("   Model:", this.model);

      // Make API request with detailed headers
      const requestConfig = {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": process.env.SITE_URL || "http://localhost:5173",
          "X-Title": process.env.SITE_NAME || "SummarizerApp",
        },
        timeout: 45000, // 45 seconds for better results
        validateStatus: (status) => status < 500, // Don't throw on 4xx errors
      };

      const requestBody = {
        model: this.model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
        top_p: 0.95,
        frequency_penalty: 0.5,
        presence_penalty: 0.3,
      };

      // Log request details (without full API key)
      console.log("   Headers:", {
        Authorization: `Bearer ${this.apiKey.substring(0, 15)}...`,
        "Content-Type": "application/json",
        "HTTP-Referer": requestConfig.headers["HTTP-Referer"],
        "X-Title": requestConfig.headers["X-Title"],
      });

      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        requestBody,
        requestConfig,
      );

      // Handle different response statuses
      if (response.status === 401) {
        console.error("❌ Authentication failed - Invalid API key");
        return {
          success: false,
          error:
            "Authentication failed. Your API key is invalid or expired. Please check your OPENROUTER_API_KEY.",
        };
      }

      if (response.status === 429) {
        // Set rate limit reset time (default 2 minutes if not specified in headers)
        const retryAfter =
          response.headers["retry-after"] ||
          response.headers["x-ratelimit-reset"];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 120000; // 2 minutes default
        this.rateLimitResetTime = Date.now() + waitTime;

        const waitMinutes = Math.ceil(waitTime / 60000);
        console.error(
          `❌ Rate limit exceeded - waiting ${waitMinutes} minutes`,
        );
        console.error(
          `   Reset time: ${new Date(this.rateLimitResetTime).toLocaleTimeString()}`,
        );

        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitMinutes} minute(s) before trying again. The free tier has limited requests per minute.`,
          rateLimited: true,
          retryAfter: Math.ceil(waitTime / 1000),
        };
      }

      if (response.status >= 400) {
        console.error("❌ API error:", response.status, response.data);
        return {
          success: false,
          error:
            response.data?.error?.message || `API error: ${response.status}`,
        };
      }

      // Validate response structure
      if (!response.data?.choices?.[0]?.message?.content) {
        console.error("❌ Invalid response structure:", response.data);
        return {
          success: false,
          error: "Invalid response from AI service",
        };
      }

      let summary = response.data.choices[0].message.content.trim();
      const summaryWordCount = summary.split(/\s+/).length;

      // Enforce word limit - truncate if AI exceeded it
      if (summaryWordCount > maxLength) {
        console.warn(
          `⚠️  AI exceeded word limit (${summaryWordCount} > ${maxLength}). Truncating...`,
        );
        const words = summary.split(/\s+/);
        summary = words.slice(0, maxLength).join(" ") + "...";
        console.log(`   Truncated to ${maxLength} words`);
      }

      const finalWordCount = summary.split(/\s+/).length;

      console.log("✅ Summary generated successfully");
      console.log("   Summary length:", summary.length, "characters");
      console.log("   Summary words:", finalWordCount, "words");
      console.log("   Word limit:", maxLength, "words");
      console.log("   Within limit:", finalWordCount <= maxLength ? "✓" : "✗");

      return {
        success: true,
        summary: summary,
        originalLength: text.split(/\s+/).length,
        summaryLength: finalWordCount,
        model: this.model,
        withinLimit: finalWordCount <= maxLength,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  buildEnhancedPrompt(text, maxLength, style) {
    // Enhanced system prompts for each style with detailed instructions
    const systemPrompts = {
      concise: `You are an expert text summarization AI specializing in concise, high-impact summaries.

**CRITICAL WORD LIMIT REQUIREMENT:**
- You MUST stay within ${maxLength} words MAXIMUM
- Count every word carefully before responding
- If you exceed the limit, revise and shorten until you meet it
- This is NON-NEGOTIABLE - summaries over ${maxLength} words will be rejected

**Your Core Principles:**
1. Extract ONLY the most essential information and key messages
2. Prioritize clarity and directness over completeness
3. Use powerful, active verbs and eliminate filler words
4. Maintain factual accuracy while removing redundancy
5. Focus on WHO, WHAT, WHEN, WHERE, WHY, and HOW

**Quality Standards:**
- Every sentence must add unique value
- Use simple, clear language accessible to all readers
- Preserve the original meaning and intent
- Remove opinions unless they are the main content
- Keep technical terms only if absolutely essential

**Structure Guidelines:**
- Start with the most important information
- Follow a logical, flowing narrative
- Connect ideas smoothly without abrupt transitions
- End with any crucial conclusions or implications`,

      detailed: `You are a comprehensive summarization expert creating detailed, well-structured summaries.

**CRITICAL WORD LIMIT REQUIREMENT:**
- You MUST stay within ${maxLength} words MAXIMUM
- Count every word carefully before responding
- If you exceed the limit, revise and shorten until you meet it
- This is NON-NEGOTIABLE - summaries over ${maxLength} words will be rejected

**Your Core Principles:**
1. Capture ALL major points, arguments, and conclusions
2. Preserve important context, background, and relationships
3. Include relevant supporting details, examples, and evidence
4. Maintain the author's perspective and nuanced distinctions
5. Organize information in a clear, hierarchical manner

**Quality Standards:**
- Create a complete narrative that flows naturally
- Use transitional phrases to connect related concepts
- Include specific examples that illustrate key points
- Preserve cause-and-effect relationships
- Balance breadth with depth of coverage

**Structure Guidelines:**
- Begin with an overview of main themes
- Progress from primary to secondary information
- Group related concepts logically
- Highlight important implications or insights
- Conclude with key takeaways or conclusions`,

      bullet: `You are an information architect specializing in clear, scannable bullet-point summaries.

**CRITICAL WORD LIMIT REQUIREMENT:**
- You MUST stay within ${maxLength} words TOTAL (counting ALL bullets)
- Count every word carefully before responding
- If you exceed the limit, remove less important bullets or shorten them
- This is NON-NEGOTIABLE - summaries over ${maxLength} words will be rejected

**Your Core Principles:**
1. Create a hierarchical structure from most to least important
2. Focus on actionable insights and key takeaways
3. Use parallel grammatical construction for consistency
4. Make each bullet self-contained and independently meaningful
5. Optimize for visual scanning and quick comprehension

**Quality Standards:**
- Start bullets with strong action verbs or key concepts
- Keep each bullet to ONE complete thought
- Use sub-bullets sparingly for closely related details
- Prioritize concrete facts, statistics, and specific information
- Group related items under clear category headers

**Structure Guidelines:**
- Lead with the most critical information
- Organize bullets in logical groups
- Use consistent formatting throughout
- Ensure parallel structure within groups
- End with action items or conclusions if applicable`,

      executive: `You are a senior business analyst creating executive summaries for C-level decision-makers.

**CRITICAL WORD LIMIT REQUIREMENT:**
- You MUST stay within ${maxLength} words MAXIMUM
- Count every word carefully before responding
- If you exceed the limit, revise and shorten until you meet it
- This is NON-NEGOTIABLE - summaries over ${maxLength} words will be rejected

**Your Core Principles:**
1. Highlight strategic insights and business implications
2. Focus on information relevant to decision-making
3. Emphasize quantifiable data, KPIs, and measurable outcomes
4. Identify risks, opportunities, and competitive advantages
5. Suggest clear action items or recommendations

**Quality Standards:**
- Lead with the most critical business impact
- Use professional business terminology appropriately
- Quantify impact with numbers, percentages, and metrics
- Focus on outcomes and results, not processes
- Maintain professional yet accessible language

**Structure Guidelines:**
- Open with key findings and strategic implications
- Present data and metrics prominently
- Highlight risks and opportunities clearly
- Include actionable recommendations
- Close with next steps or critical decisions needed`,
    };

    // Enhanced user prompts with specific formatting instructions
    const userPrompts = {
      concise: `Please provide a high-quality concise summary of the following text.

**CRITICAL REQUIREMENTS:**
⚠️ MAXIMUM LENGTH: ${maxLength} WORDS - THIS IS MANDATORY
⚠️ COUNT YOUR WORDS BEFORE SUBMITTING
⚠️ IF OVER ${maxLength} WORDS, REVISE UNTIL YOU MEET THE LIMIT
✓ Extract ONLY the most critical information
✓ Remove ALL redundancy and filler content
✓ Use clear, direct, powerful language
✓ Maintain 100% factual accuracy
✓ Write in complete sentences with proper grammar

**TEXT TO SUMMARIZE:**
${text}

**YOUR CONCISE SUMMARY (MUST BE ≤ ${maxLength} WORDS):**`,

      detailed: `Please create a comprehensive, detailed summary of the following text.

**CRITICAL REQUIREMENTS:**
⚠️ MAXIMUM LENGTH: ${maxLength} WORDS - THIS IS MANDATORY
⚠️ COUNT YOUR WORDS BEFORE SUBMITTING
⚠️ IF OVER ${maxLength} WORDS, REVISE UNTIL YOU MEET THE LIMIT
✓ Cover ALL major themes and supporting arguments
✓ Maintain logical flow and narrative structure
✓ Include important context and relationships
✓ Preserve key details, examples, and evidence
✓ Write in well-structured paragraphs

**TEXT TO SUMMARIZE:**
${text}

**YOUR DETAILED SUMMARY (approximately ${maxLength} words):**`,

      bullet: `Please create a well-organized bullet-point summary of the following text.

**CRITICAL REQUIREMENTS:**
⚠️ MAXIMUM TOTAL LENGTH: ${maxLength} WORDS - THIS IS MANDATORY
⚠️ COUNT ALL WORDS IN ALL BULLETS BEFORE SUBMITTING
⚠️ IF OVER ${maxLength} WORDS, REMOVE OR SHORTEN BULLETS UNTIL YOU MEET THE LIMIT
✓ Use clear, hierarchical bullet structure (• for main points, ◦ for sub-points)
✓ Organize from most to least important
✓ Each bullet should be concise yet complete
✓ Use parallel structure and consistent formatting
✓ Group related information under categories if applicable

**TEXT TO SUMMARIZE:**
${text}

**YOUR BULLET-POINT SUMMARY (${maxLength} words total):**`,

      executive: `Please create a professional executive summary of the following text.

**CRITICAL REQUIREMENTS:**
⚠️ MAXIMUM LENGTH: ${maxLength} WORDS - THIS IS MANDATORY
⚠️ COUNT YOUR WORDS BEFORE SUBMITTING
⚠️ IF OVER ${maxLength} WORDS, REVISE UNTIL YOU MEET THE LIMIT
✓ Lead with key business insights and strategic implications
✓ Include relevant metrics, data points, and outcomes
✓ Highlight risks, opportunities, and competitive factors
✓ Suggest actionable recommendations if applicable
✓ Use professional business language
✓ Format with clear sections if needed

**TEXT TO SUMMARIZE:**
${text}

**YOUR EXECUTIVE SUMMARY (${maxLength} words):**`,
    };

    return {
      systemPrompt: systemPrompts[style] || systemPrompts.concise,
      userPrompt: userPrompts[style] || userPrompts.concise,
    };
  }

  handleError(error) {
    console.error("\n❌ AI Summarization Error:");

    // Network errors
    if (error.code === "ECONNABORTED") {
      console.error("   Error: Request timeout");
      return {
        success: false,
        error:
          "Request timeout. The AI service took too long to respond. Please try again.",
      };
    }

    if (error.code === "ENOTFOUND") {
      console.error("   Error: Network error - Cannot reach OpenRouter");
      return {
        success: false,
        error: "Network error. Please check your internet connection.",
      };
    }

    if (error.code === "ECONNREFUSED") {
      console.error("   Error: Connection refused");
      return {
        success: false,
        error: "Cannot connect to AI service. Please try again later.",
      };
    }

    // API response errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;

      console.error("   Status:", status);
      console.error("   Response:", JSON.stringify(errorData, null, 2));

      if (status === 401) {
        return {
          success: false,
          error:
            "Invalid API key. Please verify your OPENROUTER_API_KEY in the .env file. Get your key from: https://openrouter.ai/keys",
        };
      }

      if (status === 402) {
        return {
          success: false,
          error:
            "Insufficient credits. Please add credits to your OpenRouter account.",
        };
      }

      if (status === 429) {
        // Set rate limit reset time
        const retryAfter =
          error.response.headers["retry-after"] ||
          error.response.headers["x-ratelimit-reset"];
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 120000; // 2 minutes default
        this.rateLimitResetTime = Date.now() + waitTime;

        const waitMinutes = Math.ceil(waitTime / 60000);
        console.error(
          `   Rate limit will reset at: ${new Date(this.rateLimitResetTime).toLocaleTimeString()}`,
        );

        return {
          success: false,
          error: `Rate limit exceeded. Please wait ${waitMinutes} minute(s). Free tier models have strict rate limits. Consider waiting or using a different model.`,
          rateLimited: true,
          retryAfter: Math.ceil(waitTime / 1000),
        };
      }

      if (status === 503) {
        return {
          success: false,
          error:
            "AI service temporarily unavailable. Please try again in a moment.",
        };
      }

      return {
        success: false,
        error:
          errorData?.error?.message ||
          `API error (${status}). Please try again.`,
      };
    }

    // Unknown errors
    console.error("   Unknown error:", error.message);
    console.error("   Stack:", error.stack);

    return {
      success: false,
      error:
        "An unexpected error occurred. Please try again or contact support.",
    };
  }

  async testConnection() {
    console.log("\n🧪 Testing OpenRouter API connection...");

    try {
      const testText = `Artificial intelligence has revolutionized modern technology by enabling computers to perform complex tasks that previously required human intelligence. Machine learning algorithms can analyze vast amounts of data to identify patterns, make predictions, and improve their performance over time without explicit programming. Deep learning, a subset of machine learning, uses neural networks with multiple layers to process information in ways similar to the human brain. These technologies are now used in various applications including image recognition, natural language processing, autonomous vehicles, medical diagnosis, and financial forecasting. The rapid advancement in AI capabilities has raised important questions about ethics, privacy, and the future of work.`;

      const result = await this.generateSummary(testText, {
        maxLength: 80,
        style: "concise",
      });

      if (result.success) {
        console.log("✅ Test passed! AI service is working.");
        console.log("   Test summary:", result.summary);
        console.log("   Original words:", result.originalLength);
        console.log("   Summary words:", result.summaryLength);
        console.log(
          "   Compression:",
          ((result.summaryLength / result.originalLength) * 100).toFixed(1) +
            "%",
        );
        return true;
      } else {
        console.error("❌ Test failed:", result.error);
        return false;
      }
    } catch (error) {
      console.error("❌ Test failed with exception:", error.message);
      return false;
    }
  }

  // Get service status
  getStatus() {
    const isRateLimited =
      this.rateLimitResetTime && Date.now() < this.rateLimitResetTime;
    const resetIn = isRateLimited
      ? Math.ceil((this.rateLimitResetTime - Date.now()) / 1000)
      : 0;

    return {
      initialized: this.initialized,
      apiKeyPresent: !!this.apiKey,
      apiKeyValid: this.apiKey && this.apiKey.startsWith("sk-or-v1-"),
      baseURL: this.baseURL,
      model: this.model,
      supportedStyles: ["concise", "detailed", "bullet", "executive"],
      rateLimited: isRateLimited,
      rateLimitResetIn: resetIn,
      rateLimitResetTime: isRateLimited
        ? new Date(this.rateLimitResetTime).toLocaleTimeString()
        : null,
    };
  }

  // Clear rate limit (for manual reset)
  clearRateLimit() {
    this.rateLimitResetTime = null;
    console.log("✅ Rate limit manually cleared");
  }

  // Get available models (for future expansion)
  getAvailableModels() {
    return [
      {
        id: "google/gemini-2.0-flash-exp:free",
        name: "Google Gemini Flash 2.0 (Free)",
        description: "Best free model with fast response times",
        recommended: true,
      },
      {
        id: "meta-llama/llama-3.2-3b-instruct:free",
        name: "Meta Llama 3.2 (Free)",
        description: "Good quality free alternative",
      },
      {
        id: "qwen/qwen-2-7b-instruct:free",
        name: "Qwen 2 (Free)",
        description: "Alibaba's free model",
      },
    ];
  }
}

module.exports = new AIService();
