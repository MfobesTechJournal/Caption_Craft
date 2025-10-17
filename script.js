const apiKey = "AIzaSyDDu7yN3JwLu0cdUmUjIOoSj5vRD9wF448"; 
const model = "gemini-2.5-flash-preview-05-20";
const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;


function getInputs() {
    const topic = document.getElementById('topic').value.trim();
    const tone = document.getElementById('tone').value.trim();
    const constraint = document.getElementById('constraint').value.trim();

    return { topic, tone, constraint };
}


function buildApiPayload(inputs) {
    
    const systemInstruction = "You are a world-class social media manager. Your task is to generate three distinct captions (one each for Instagram, X/Twitter, and LinkedIn) based on the user's input. The final output MUST be a JSON array that strictly follows the provided schema. DO NOT include any text, greetings, or explanations outside the JSON array.";

    const userQuery = `Topic: ${inputs.topic}. Tone: ${inputs.tone}. Constraints: ${inputs.constraint || 'None specified.'}.`;

    
    const responseSchema = {
        type: "ARRAY",
        description: "An array of generated social media captions, one for each platform.",
        items: {
            type: "OBJECT",
            properties: {
                "platform": {
                    "type": "STRING",
                    "description": "The social media platform (e.g., 'Instagram', 'Twitter', 'LinkedIn')."
                },
                "caption": {
                    "type": "STRING",
                    "description": "The generated caption text."
                }
            },
            "propertyOrdering": ["platform", "caption"]
        }
    };

    return {
        contents: [{
            parts: [{
                text: userQuery
            }]
        }],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: responseSchema
        }
    };
}


function getPlatformIcon(platform) {
    
    switch (platform.toLowerCase().replace(/[^a-z0-9]/g, '')) {
        case 'instagram':
            return '<svg class="icon instagram-icon" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 14h-7a1 1 0 01-1-1v-7a1 1 0 011-1h7a1 1 0 011 1v7a1 1 0 01-1 1zM16 8.5a.5.5 0 100-1 .5.5 0 000 1zM12 10a2 2 0 100 4 2 2 0 000-4z"/></svg>';
        case 'x/twitter':
        case 'twitter':
            return '<svg class="icon twitter-icon" viewBox="0 0 24 24"><path d="M22 4.01c-.72.32-1.5.53-2.32.63.83-.5 1.47-1.28 1.77-2.22-.78.46-1.63.79-2.52.97-.73-.78-1.77-1.27-2.91-1.27-2.2 0-3.98 1.78-3.98 3.98 0 .31.04.62.1.91-3.31-.17-6.24-1.75-8.21-4.15-.34.58-.53 1.25-.53 1.97 0 1.38.7 2.59 1.77 3.3-.65-.02-1.26-.2-1.79-.5v.05c0 1.93 1.37 3.53 3.19 3.89-.33.09-.68.14-1.04.14-.25 0-.49-.02-.73-.07.51 1.58 1.98 2.73 3.73 2.76-1.36 1.06-3.08 1.69-4.96 1.69-.33 0-.66-.02-.98-.06 1.76 1.13 3.85 1.79 6.09 1.79 7.31 0 11.31-6.07 11.31-11.31 0-.17-.0-.34-.01-.5.77-.55 1.44-1.23 1.97-2.01z"/></svg>';
        case 'linkedin':
            return '<svg class="icon linkedin-icon" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.73v20.54C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.73V1.73C24 .77 23.2 0 22.23 0zM7.05 20.37H3.63V9.45h3.42v10.92zM5.34 7.9c-1.15 0-1.85-.77-1.85-1.74s.67-1.73 1.89-1.73c1.23 0 1.85.77 1.85 1.73 0 .96-.66 1.74-1.89 1.74zM20.37 20.37h-3.42v-5.6c0-1.34-.5-2.25-1.68-2.25-1.07 0-1.7.72-1.98 1.41-.1.25-.13.58-.13.92v5.52H9.72s.05-9.87 0-10.92h3.42v1.44c.46-.72 1.27-1.74 3.08-1.74 2.25 0 3.93 1.47 3.93 4.67v6.55z"/></svg>';
        default:
            return '<svg class="icon default-icon" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 16H7v-1h10v1zm0-3H7V5h10v11z"/></svg>';
    }
}


function copyToClipboard(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    // Set position off-screen to avoid visual disruption
    textarea.style.position = 'fixed'; 
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();
    
    
    document.execCommand('copy');
    document.body.removeChild(textarea);

    
    const originalText = button.textContent;
    button.textContent = 'Copied!';
    button.classList.add('copied');
    setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('copied');
    }, 1500);
}


function displayOutput(jsonString) {
    const outputArea = document.getElementById('outputArea');
    let data;

    try {
        
        data = JSON.parse(jsonString);
    } catch (e) {
        
        console.error("Failed to parse JSON output:", e);
        outputArea.innerHTML = `<p class="error-message">Error: Model did not return valid JSON. The prompt or constraints might be too complex for structured output. Check the console for details.</p>`;
        return;
    }

    if (!Array.isArray(data) || data.length === 0) {
        // Handle case where JSON is valid but not the expected array structure
        outputArea.innerHTML = `<p class="warning-message">Warning: The model generated content, but it was empty or not an array. Please try again.</p>`;
        return;
    }

  
    const cardsHtml = data.map(item => {
        const platform = item.platform || 'Unknown Platform';
        const caption = item.caption || 'No caption generated.';
        const icon = getPlatformIcon(platform);

       
        const escapedCaption = caption.replace(/"/g, '&quot;'); 

        return `
            <div class="caption-card">
                <div class="platform-header">
                    ${icon}
                    <h2>${platform}</h2>
                </div>
                <p class="caption-text">${caption}</p>
                <button class="copy-btn" data-caption="${escapedCaption}">
                    Copy Caption
                </button>
            </div>
        `;
    }).join('');

    
    outputArea.innerHTML = `<h3 class="results-title">Generated Captions</h3><div class="caption-results-grid">${cardsHtml}</div>`;

    
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', (e) => copyToClipboard(e.currentTarget.dataset.caption, e.currentTarget));
    });

async function generateCaptions() {
    
    const outputArea = document.getElementById('outputArea');
    const generateBtn = document.getElementById('generateBtn');


    const inputs = getInputs();
    if (!inputs.topic) {
        outputArea.innerHTML = '<p class="error-message">Please enter a **Topic** to generate captions.</p>';
        return; 
    }

    
    const payload = buildApiPayload(inputs);

  
    outputArea.innerHTML = '<div class="spinner"></div><p style="font-style: italic; margin-top: 10px;">Crafting captions...</p>';
    generateBtn.disabled = true;

    try {
        console.log("Sending request to Gemini API...");

        
        const maxRetries = 3;
        let response;

        for (let i = 0; i < maxRetries; i++) {
            response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (response.ok) {
                break; // Success, exit loop
            }

            
            if (i === maxRetries - 1 || (response.status >= 400 && response.status < 500)) {
                throw new Error(`API Request failed with status: ${response.status}. Please check your API key and input.`);
            }

            
            const delay = Math.pow(2, i) * 1000;
            console.warn(`Retrying in ${delay / 1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await response.json();
        console.log("API Response:", result);

       
        const generatedContentText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (generatedContentText) {
            
            displayOutput(generatedContentText);
        } else {
           
            throw new Error("API returned success, but no generated content was found.");
        }

    } catch (error) {
        
        console.error("Error generating captions:", error);
        outputArea.innerHTML = `<p class="error-message">Generation Failed: ${error.message}</p><p>Please check the console for network or key errors.</p>`;
    } finally {
      
        generateBtn.disabled = false;
    }
}


document.getElementById('generateBtn').addEventListener('click', generateCaptions);

// Initial message in the output area
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('outputArea').innerHTML = '<p>Enter your topic and click "Generate" to begin.</p>';
});
