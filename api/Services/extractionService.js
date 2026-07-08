const axios = require('axios');
const cheerio = require('cheerio');

// Extract text from URL
const extractTextFromURL = async (url) => {
  try {
    console.log(`\n📡 Fetching content from URL: ${url}`);
    
    // Validate URL
    try {
      new URL(url);
    } catch (e) {
      return {
        success: false,
        error: 'Invalid URL format'
      };
    }
    
    const response = await axios.get(url, {
      timeout: 15000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive'
      }
    });
    
    console.log(`✅ URL fetched successfully (${response.status})`);

    const $ = cheerio.load(response.data);
    
    // Remove script, style, and other non-content elements
    $('script, style, nav, header, footer, aside, iframe, noscript').remove();
    
    // Try to find main content areas
    let text = '';
    
    // Priority selectors for common article/content structures
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.content',
      '.article-content',
      '.post-content',
      '#content',
      'main',
      '.entry-content'
    ];
    
    for (const selector of contentSelectors) {
      const content = $(selector).text();
      if (content && content.length > 200) {
        text = content;
        break;
      }
    }
    
    // Fallback to body if no content found
    if (!text) {
      text = $('body').text();
    }
    
    // Clean up the text
    text = text
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();
    
    if (!text || text.length < 100) {
      return {
        success: false,
        error: 'Could not extract sufficient text from URL. The page might be dynamic or protected.'
      };
    }
    
    console.log(`✅ Extracted ${text.length} characters from URL`);
    
    return {
      success: true,
      text: text,
      source: url
    };
    
  } catch (error) {
    console.error('❌ URL extraction error:', error.message);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to fetch URL';
    
    if (error.code === 'ENOTFOUND') {
      errorMessage = 'URL not found. Please check the URL and try again.';
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = 'Request timed out. The website might be slow or unavailable.';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. The website might be blocking requests.';
    } else if (error.response?.status === 403) {
      errorMessage = 'Access forbidden. The website is blocking automated requests.';
    } else if (error.response?.status === 404) {
      errorMessage = 'Page not found. Please check the URL.';
    } else if (error.response?.status >= 500) {
      errorMessage = 'The website is experiencing issues. Please try again later.';
    } else {
      errorMessage = `Failed to fetch URL: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

module.exports = {
  extractTextFromURL
};
