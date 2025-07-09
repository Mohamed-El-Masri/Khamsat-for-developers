// Helper utilities and shared functions
import { APP_CONFIG } from '../config/api.js';

/**
 * Show toast notification
 * @param {string} message 
 * @param {string} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 5000) {
    // Remove existing toasts
    const existingToasts = document.querySelectorAll('.custom-toast');
    existingToasts.forEach(toast => toast.remove());

    // Create toast container if it doesn't exist
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${type} show`;
    toast.innerHTML = `
        <div class="toast-header border-0">
            <i class="fas fa-${getToastIcon(type)} me-2"></i>
            <strong class="me-auto">${getToastTitle(type)}</strong>
            <button type="button" class="btn-close btn-close-white" onclick="this.parentElement.parentElement.remove()"></button>
        </div>
        <div class="toast-body">
            ${message}
        </div>
    `;

    container.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            toast.remove();
        }
    }, duration);
}

/**
 * Get icon for toast type
 * @param {string} type 
 * @returns {string}
 */
function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

/**
 * Get title for toast type
 * @param {string} type 
 * @returns {string}
 */
function getToastTitle(type) {
    const titles = {
        success: 'نجح!',
        error: 'خطأ!',
        warning: 'تحذير!',
        info: 'معلومة'
    };
    return titles[type] || 'معلومة';
}

/**
 * Log error with timestamp and context
 * @param {string} message 
 * @param {Error|any} error 
 */
export function logError(message, error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] ${message}`, error);
    
    // In production, you might want to send this to a logging service
    if (window.ENV && window.ENV.isProd()) {
        // Send to logging service
    }
}

/**
 * Copy text to clipboard
 * @param {string} text 
 * @param {HTMLElement} button 
 * @returns {Promise<boolean>}
 */
export async function copyToClipboard(text, button = null) {
    try {
        await navigator.clipboard.writeText(text);
        
        if (button) {
            const originalText = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check me-1"></i>تم النسخ';
            button.classList.add('copied');
            
            setTimeout(() => {
                button.innerHTML = originalText;
                button.classList.remove('copied');
            }, 2000);
        }
        
        showToast('تم نسخ النص بنجاح', 'success');
        return true;
    } catch (error) {
        logError('Error copying to clipboard:', error);
        
        // Fallback for older browsers
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            document.execCommand('copy');
            textArea.remove();
            
            if (button) {
                const originalText = button.innerHTML;
                button.innerHTML = '<i class="fas fa-check me-1"></i>تم النسخ';
                button.classList.add('copied');
                
                setTimeout(() => {
                    button.innerHTML = originalText;
                    button.classList.remove('copied');
                }, 2000);
            }
            
            showToast('تم نسخ النص بنجاح', 'success');
            return true;
        } catch (fallbackError) {
            logError('Fallback copy failed:', fallbackError);
            showToast('فشل في نسخ النص', 'error');
            return false;
        }
    }
}

/**
 * Validate email address
 * @param {string} email 
 * @returns {boolean}
 */
export function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate URL
 * @param {string} url 
 * @returns {boolean}
 */
export function validateUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Format price with currency
 * @param {number} price 
 * @param {string} currency 
 * @returns {string}
 */
export function formatPrice(price, currency = 'USD') {
    const symbols = {
        USD: '$',
        EUR: '€',
        SAR: 'ر.س',
        EGP: 'ج.م'
    };
    
    return `${symbols[currency] || '$'}${price}`;
}

/**
 * Format date in Arabic
 * @param {Date} date 
 * @returns {string}
 */
export function formatDate(date) {
    return new Intl.DateTimeFormat('ar-EG', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

/**
 * Debounce function calls
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function calls
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sanitize HTML string
 * @param {string} str 
 * @returns {string}
 */
export function sanitizeHtml(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Format text for display with line breaks
 * @param {string} text 
 * @returns {string}
 */
export function formatTextWithBreaks(text) {
    return text.replace(/\n/g, '<br>');
}

/**
 * Scroll to element smoothly
 * @param {string|HTMLElement} element 
 * @param {number} offset 
 */
export function scrollToElement(element, offset = 100) {
    const targetElement = typeof element === 'string' 
        ? document.querySelector(element) 
        : element;
    
    if (targetElement) {
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

/**
 * Check if element is in viewport
 * @param {HTMLElement} element 
 * @returns {boolean}
 */
export function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Create loading spinner element
 * @param {string} size 
 * @returns {HTMLElement}
 */
export function createLoadingSpinner(size = 'md') {
    const sizeMap = {
        sm: '1rem',
        md: '2rem',
        lg: '3rem',
        xl: '4rem'
    };
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner-border text-primary';
    spinner.style.width = sizeMap[size];
    spinner.style.height = sizeMap[size];
    spinner.innerHTML = '<span class="visually-hidden">جاري التحميل...</span>';
    
    return spinner;
}

/**
 * Show/hide loading state on element
 * @param {HTMLElement} element 
 * @param {boolean} isLoading 
 */
export function toggleLoadingState(element, isLoading) {
    if (isLoading) {
        element.classList.add('loading');
        element.disabled = true;
    } else {
        element.classList.remove('loading');
        element.disabled = false;
    }
}

/**
 * Local storage helpers
 */
export const storage = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            logError('Error saving to localStorage:', error);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            logError('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            logError('Error removing from localStorage:', error);
        }
    },
    
    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            logError('Error clearing localStorage:', error);
        }
    }
};

/**
 * Session storage helpers
 */
export const session = {
    set(key, value) {
        try {
            sessionStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            logError('Error saving to sessionStorage:', error);
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            logError('Error reading from sessionStorage:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            logError('Error removing from sessionStorage:', error);
        }
    },
    
    clear() {
        try {
            sessionStorage.clear();
        } catch (error) {
            logError('Error clearing sessionStorage:', error);
        }
    }
};

/**
 * URL parameter helpers
 */
export const urlParams = {
    get(param) {
        const params = new URLSearchParams(window.location.search);
        return params.get(param);
    },
    
    set(param, value) {
        const url = new URL(window.location);
        url.searchParams.set(param, value);
        window.history.pushState({}, '', url);
    },
    
    remove(param) {
        const url = new URL(window.location);
        url.searchParams.delete(param);
        window.history.pushState({}, '', url);
    },
    
    getAll() {
        const params = new URLSearchParams(window.location.search);
        const result = {};
        for (const [key, value] of params) {
            result[key] = value;
        }
        return result;
    }
};
