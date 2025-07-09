// AI Service for DeepSeek API Integration
import { API_CONFIG, REQUEST_CONFIG } from '../config/api.js';
import { showToast, logError } from '../utils/helpers.js';

class AIService {
    constructor() {
        this.baseUrl = API_CONFIG.DEEPSEEK.BASE_URL;
        this.apiKey = API_CONFIG.DEEPSEEK.API_KEY;
        this.model = API_CONFIG.DEEPSEEK.MODEL;
    }

    /**
     * Make API request with retry logic
     * @param {string} endpoint 
     * @param {Object} data 
     * @param {number} retryCount 
     * @returns {Promise}
     */
    async makeRequest(endpoint, data, retryCount = 0) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: REQUEST_CONFIG.HEADERS,
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            if (retryCount < REQUEST_CONFIG.RETRY_ATTEMPTS) {
                await this.delay(REQUEST_CONFIG.RETRY_DELAY * (retryCount + 1));
                return this.makeRequest(endpoint, data, retryCount + 1);
            }
            throw error;
        }
    }

    /**
     * Delay utility for retry logic
     * @param {number} ms 
     * @returns {Promise}
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Generate service suggestions based on category and subcategory
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @param {number} count 
     * @returns {Promise<Array>}
     */
    async generateSuggestions(mainCategory, subCategory, count = 10) {
        const prompt = this.createSuggestionsPrompt(mainCategory, subCategory, count);
        
        const data = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: "أنت خبير في إنشاء الخدمات على منصة خمسات. مهمتك إنشاء اقتراحات احترافية للخدمات."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: API_CONFIG.DEEPSEEK.MAX_TOKENS,
            temperature: API_CONFIG.DEEPSEEK.TEMPERATURE
        };

        try {
            const response = await this.makeRequest(API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS, data);
            const suggestions = this.parseSuggestionsResponse(response);
            
            // إذا لم نحصل على اقتراحات، استخدم الاقتراحات الاحتياطية
            if (!suggestions || suggestions.length === 0) {
                console.warn('No suggestions from AI, using fallback suggestions');
                return this.getFallbackSuggestions().slice(0, count);
            }
            
            return suggestions;
        } catch (error) {
            logError('Error generating suggestions:', error);
            showToast('حدث خطأ في الاتصال بخدمة الذكاء الاصطناعي، سيتم استخدام اقتراحات تجريبية', 'warning');
            
            // إرجاع اقتراحات احتياطية بدلاً من إلقاء خطأ
            return this.getFallbackSuggestions().slice(0, count);
        }
    }

    /**
     * Generate detailed service information
     * @param {Object} service 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @returns {Promise<Object>}
     */
    async generateServiceDetails(service, mainCategory, subCategory) {
        const prompt = this.createServiceDetailsPrompt(service, mainCategory, subCategory);
        
        const data = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: "أنت خبير في إنشاء التفاصيل الكاملة للخدمات على منصة خمسات بطريقة احترافية."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: API_CONFIG.DEEPSEEK.MAX_TOKENS,
            temperature: API_CONFIG.DEEPSEEK.TEMPERATURE
        };

        try {
            const response = await this.makeRequest(API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS, data);
            return this.parseServiceDetailsResponse(response);
        } catch (error) {
            logError('Error generating service details:', error);
            showToast('حدث خطأ في إنشاء تفاصيل الخدمة', 'error');
            throw error;
        }
    }

    /**
     * Create prompt for service suggestions
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @param {number} count 
     * @returns {string}
     */
    createSuggestionsPrompt(mainCategory, subCategory, count) {
        return `
قم بإنشاء ${count} اقتراحات لخدمات احترافية في فئة "${subCategory}" من تصنيف "${mainCategory}" لمنصة خمسات.

المطلوب:
- اسم جذاب ومحدد للخدمة
- سعر واقعي بالدولار (5-200 دولار)
- وصف مختصر وواضح

الشروط:
- خدمات متنوعة ومختلفة
- أسعار منافسة ومناسبة للسوق
- قابلة للتنفيذ عملياً

الرد يجب أن يكون JSON صحيح فقط بدون أي تفسير أو تعليق:

{
  "suggestions": [
    {
      "name": "اسم الخدمة",
      "price": 25,
      "description": "وصف مختصر للخدمة"
    }
  ]
}`;
    }

    /**
     * Create prompt for detailed service information
     * @param {Object} service 
     * @param {string} mainCategory 
     * @param {string} subCategory 
     * @returns {string}
     */
    createServiceDetailsPrompt(service, mainCategory, subCategory) {
        return `
قم بإنشاء التفاصيل الكاملة للخدمة التالية لمنصة خمسات:

اسم الخدمة: ${service.name}
السعر: ${service.price} دولار
الوصف: ${service.description}
الفئة: ${subCategory}

المطلوب:
- اسم محسن للخدمة
- وصف جذاب (200-300 كلمة)
- 5-8 مميزات
- 5-8 مخرجات 
- 10-15 كلمة مفتاحية
- تعليمات للمشتري
- وصف الصورة الرئيسية

الرد يجب أن يكون JSON صحيح فقط:

{
  "title": "اسم الخدمة المحسن",
  "description": "الوصف الجذاب",
  "features": [
    {
      "title": "عنوان الميزة",
      "description": "وصف الميزة"
    }
  ],
  "deliverables": [
    {
      "title": "عنوان المخرج",
      "description": "وصف المخرج"
    }
  ],
  "keywords": ["كلمة1", "كلمة2"],
  "instructions": "تعليمات للمشتري",
  "thumbnailDescription": "وصف الصورة"
}`;
    }

    /**
     * Parse suggestions response from AI
     * @param {Object} response 
     * @returns {Array}
     */
    parseSuggestionsResponse(response) {
        try {
            const content = response.choices[0].message.content;
            
            // Extract JSON from markdown if present
            let jsonContent = content;
            
            // Check if response contains markdown code blocks
            if (content.includes('```json')) {
                const jsonStart = content.indexOf('```json') + 7;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            } else if (content.includes('```')) {
                // Handle general code blocks
                const jsonStart = content.indexOf('```') + 3;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            }
            
            // Clean up any remaining markdown or formatting
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
            
            const parsed = JSON.parse(jsonContent);
            
            // Validate suggestions array
            if (!parsed.suggestions || !Array.isArray(parsed.suggestions)) {
                throw new Error('Invalid suggestions format: suggestions array not found');
            }
            
            // Validate each suggestion
            const validSuggestions = parsed.suggestions.filter(suggestion => {
                return suggestion.name && 
                       typeof suggestion.price === 'number' && 
                       suggestion.description;
            });
            
            if (validSuggestions.length === 0) {
                throw new Error('No valid suggestions found in response');
            }
            
            return validSuggestions;
        } catch (error) {
            logError('Error parsing suggestions response:', error);
            console.error('Raw AI response:', response.choices[0]?.message?.content);
            
            // Return fallback suggestions if parsing fails
            return this.getFallbackSuggestions();
        }
    }

    /**
     * Parse service details response from AI
     * @param {Object} response 
     * @returns {Object}
     */
    parseServiceDetailsResponse(response) {
        try {
            const content = response.choices[0].message.content;
            
            // Extract JSON from markdown if present
            let jsonContent = content;
            
            // Check if response contains markdown code blocks
            if (content.includes('```json')) {
                const jsonStart = content.indexOf('```json') + 7;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            } else if (content.includes('```')) {
                // Handle general code blocks
                const jsonStart = content.indexOf('```') + 3;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            }
            
            // Clean up any remaining markdown or formatting
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
            
            const parsed = JSON.parse(jsonContent);
            
            // Validate required fields
            if (!parsed.title || !parsed.description) {
                throw new Error('Invalid service details format: missing required fields');
            }
            
            return parsed;
        } catch (error) {
            logError('Error parsing service details response:', error);
            console.error('Raw AI response:', response.choices[0]?.message?.content);
            return null;
        }
    }

    /**
     * Generate gallery examples for a service
     * @param {Object} service 
     * @param {string} subCategory 
     * @param {number} count 
     * @returns {Promise<Array>}
     */
    async generateGalleryExamples(service, subCategory, count = 7) {
        const prompt = `
قم بإنشاء ${count} أمثلة احترافية لمعرض أعمال الخدمة التالية:

اسم الخدمة: ${service.title || service.name}
الفئة: ${subCategory}

المطلوب لكل مثال:
- عنوان جذاب للمثال
- وصف مختصر للعمل المنجز
- وصف للصورة المصاحبة

الرد يجب أن يكون JSON صحيح فقط بدون أي تفسير:

{
  "examples": [
    {
      "title": "عنوان المثال",
      "description": "وصف العمل",
      "imageDescription": "وصف الصورة"
    }
  ]
}`;

        const data = {
            model: this.model,
            messages: [
                {
                    role: "system",
                    content: "أنت خبير في إنشاء أمثلة معرض الأعمال الاحترافية."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            max_tokens: API_CONFIG.DEEPSEEK.MAX_TOKENS,
            temperature: API_CONFIG.DEEPSEEK.TEMPERATURE
        };

        try {
            const response = await this.makeRequest(API_CONFIG.ENDPOINTS.CHAT_COMPLETIONS, data);
            const content = response.choices[0].message.content;
            
            // Extract JSON from markdown if present
            let jsonContent = content;
            
            if (content.includes('```json')) {
                const jsonStart = content.indexOf('```json') + 7;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            } else if (content.includes('```')) {
                const jsonStart = content.indexOf('```') + 3;
                const jsonEnd = content.indexOf('```', jsonStart);
                if (jsonEnd > jsonStart) {
                    jsonContent = content.substring(jsonStart, jsonEnd).trim();
                }
            }
            
            jsonContent = jsonContent.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
            
            const parsed = JSON.parse(jsonContent);
            return parsed.examples || this.getFallbackGalleryExamples();
        } catch (error) {
            logError('Error generating gallery examples:', error);
            console.error('Raw gallery response:', response?.choices?.[0]?.message?.content);
            return this.getFallbackGalleryExamples();
        }
    }

    /**
     * Get fallback suggestions when AI parsing fails
     * @returns {Array}
     */
    getFallbackSuggestions() {
        return [
            {
                name: "خدمة تصميم احترافية",
                price: 50,
                description: "تصميم احترافي عالي الجودة مع ضمان الرضا الكامل"
            },
            {
                name: "خدمة تطوير مخصصة",
                price: 75,
                description: "تطوير حلول مخصصة تناسب احتياجاتك الفريدة"
            },
            {
                name: "خدمة كتابة محتوى",
                price: 25,
                description: "كتابة محتوى جذاب ومحسن لمحركات البحث"
            },
            {
                name: "خدمة تسويق رقمي",
                price: 100,
                description: "استراتيجية تسويق شاملة لزيادة المبيعات"
            },
            {
                name: "خدمة دعم فني",
                price: 30,
                description: "دعم فني متميز لحل جميع المشاكل التقنية"
            }
        ];
    }

    /**
     * Get fallback gallery examples when AI parsing fails
     * @returns {Array}
     */
    getFallbackGalleryExamples() {
        return [
            {
                title: "مثال تصميم رقم 1",
                description: "تصميم احترافي يظهر جودة العمل",
                imageDescription: "صورة تظهر تصميم احترافي بألوان جذابة"
            },
            {
                title: "مثال تصميم رقم 2", 
                description: "عمل سابق يبرز الخبرة والإبداع",
                imageDescription: "تصميم حديث بأسلوب عصري ومبتكر"
            },
            {
                title: "مثال تصميم رقم 3",
                description: "نموذج يوضح التنوع في الأساليب",
                imageDescription: "تصميم متميز يجمع بين البساطة والأناقة"
            },
            {
                title: "مثال تصميم رقم 4",
                description: "عينة من الأعمال المتقنة",
                imageDescription: "تصميم يظهر الاهتمام بالتفاصيل"
            },
            {
                title: "مثال تصميم رقم 5",
                description: "نموذج يعكس الاحترافية",
                imageDescription: "تصميم متكامل بمعايير عالية الجودة"
            },
            {
                title: "مثال تصميم رقم 6",
                description: "عمل يبرز الإبداع والتميز",
                imageDescription: "تصميم فريد بفكرة مبتكرة"
            },
            {
                title: "مثال تصميم رقم 7",
                description: "نموذج نهائي يختتم المعرض",
                imageDescription: "تصميم شامل يجمع كل عناصر التميز"
            }
        ];
    }
}

// Export singleton instance
export default new AIService();
