// API Configuration
export const API_CONFIG = {
    DEEPSEEK: {
        API_KEY: 'sk-e1e9dc1ad9c047c1b7492386f42c974e',
        BASE_URL: 'https://api.deepseek.com/v1',
        MODEL: 'deepseek-chat',
        MAX_TOKENS: 4000,
        TEMPERATURE: 0.7
    },
    IMAGE_GENERATION: {
        BASE_URL: 'https://api.deepseek.com/v1/images/generations',
        SIZE: '1024x1024',
        QUALITY: 'hd'
    },
    ENDPOINTS: {
        CHAT_COMPLETIONS: '/chat/completions',
        IMAGE_GENERATIONS: '/images/generations'
    }
};

export const REQUEST_CONFIG = {
    HEADERS: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.DEEPSEEK.API_KEY}`
    },
    TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000
};

export const APP_CONFIG = {
    PROJECT_INFO: {
        DEVELOPER: 'المهندس محمد سامح المصري',
        SUPERVISOR: 'ITI - فرع سوهاج',
        VERSION: '1.0.0',
        DESCRIPTION: 'منشئ خدمات خمسات بالذكاء الاصطناعي'
    },
    SUGGESTIONS: {
        DEFAULT_COUNT: 10,
        MAX_SELECTED: 5
    },
    THUMBNAILS: {
        WIDTH: 1700,
        HEIGHT: 970,
        FORMAT: 'PNG',
        QUALITY: 'high'
    },
    FEATURES: {
        MIN_COUNT: 5,
        MAX_COUNT: 8
    },
    DELIVERABLES: {
        MIN_COUNT: 5,
        MAX_COUNT: 8
    },
    GALLERY: {
        MIN_COUNT: 6,
        MAX_COUNT: 8
    }
};
