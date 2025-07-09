/**
 * Local Storage Service
 * خدمة إدارة البيانات المحلية - حفظ الخدمات المفضلة والتاريخ
 */

class StorageService {
    constructor() {
        this.storageKeys = {
            favorites: 'khamsat_favorites',
            history: 'khamsat_history',
            preferences: 'khamsat_preferences'
        };
    }

    /**
     * حفظ خدمة في المفضلة
     * @param {Object} service - بيانات الخدمة
     */
    addToFavorites(service) {
        try {
            const favorites = this.getFavorites();
            const serviceWithId = {
                ...service,
                id: this.generateId(),
                savedAt: new Date().toISOString()
            };
            
            favorites.push(serviceWithId);
            localStorage.setItem(this.storageKeys.favorites, JSON.stringify(favorites));
            
            return serviceWithId;
        } catch (error) {
            console.error('Error saving to favorites:', error);
            return null;
        }
    }

    /**
     * جلب الخدمات المفضلة
     * @returns {Array} قائمة الخدمات المفضلة
     */
    getFavorites() {
        try {
            const stored = localStorage.getItem(this.storageKeys.favorites);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * حذف خدمة من المفضلة
     * @param {string} serviceId - معرف الخدمة
     */
    removeFromFavorites(serviceId) {
        try {
            const favorites = this.getFavorites();
            const updatedFavorites = favorites.filter(service => service.id !== serviceId);
            localStorage.setItem(this.storageKeys.favorites, JSON.stringify(updatedFavorites));
            return true;
        } catch (error) {
            console.error('Error removing from favorites:', error);
            return false;
        }
    }

    /**
     * إضافة إلى التاريخ
     * @param {Object} searchData - بيانات البحث
     */
    addToHistory(searchData) {
        try {
            const history = this.getHistory();
            const historyItem = {
                ...searchData,
                id: this.generateId(),
                searchedAt: new Date().toISOString()
            };
            
            // إبقاء آخر 50 عملية بحث فقط
            history.unshift(historyItem);
            if (history.length > 50) {
                history.splice(50);
            }
            
            localStorage.setItem(this.storageKeys.history, JSON.stringify(history));
            return historyItem;
        } catch (error) {
            console.error('Error saving to history:', error);
            return null;
        }
    }

    /**
     * جلب تاريخ البحث
     * @returns {Array} تاريخ البحث
     */
    getHistory() {
        try {
            const stored = localStorage.getItem(this.storageKeys.history);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    /**
     * مسح التاريخ
     */
    clearHistory() {
        try {
            localStorage.removeItem(this.storageKeys.history);
            return true;
        } catch (error) {
            console.error('Error clearing history:', error);
            return false;
        }
    }

    /**
     * حفظ تفضيلات المستخدم
     * @param {Object} preferences - التفضيلات
     */
    savePreferences(preferences) {
        try {
            localStorage.setItem(this.storageKeys.preferences, JSON.stringify(preferences));
            return true;
        } catch (error) {
            console.error('Error saving preferences:', error);
            return false;
        }
    }

    /**
     * جلب تفضيلات المستخدم
     * @returns {Object} التفضيلات
     */
    getPreferences() {
        try {
            const stored = localStorage.getItem(this.storageKeys.preferences);
            return stored ? JSON.parse(stored) : {
                theme: 'light',
                language: 'ar',
                autoSave: true,
                showTips: true
            };
        } catch (error) {
            console.error('Error loading preferences:', error);
            return {};
        }
    }

    /**
     * توليد معرف فريد
     * @returns {string} معرف فريد
     */
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    /**
     * تصدير البيانات
     * @returns {Object} جميع البيانات المحفوظة
     */
    exportData() {
        return {
            favorites: this.getFavorites(),
            history: this.getHistory(),
            preferences: this.getPreferences(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * استيراد البيانات
     * @param {Object} data - البيانات المستوردة
     */
    importData(data) {
        try {
            if (data.favorites) {
                localStorage.setItem(this.storageKeys.favorites, JSON.stringify(data.favorites));
            }
            if (data.history) {
                localStorage.setItem(this.storageKeys.history, JSON.stringify(data.history));
            }
            if (data.preferences) {
                localStorage.setItem(this.storageKeys.preferences, JSON.stringify(data.preferences));
            }
            return true;
        } catch (error) {
            console.error('Error importing data:', error);
            return false;
        }
    }

    /**
     * الحصول على إحصائيات الاستخدام
     * @returns {Object} إحصائيات
     */
    getUsageStats() {
        const favorites = this.getFavorites();
        const history = this.getHistory();
        
        return {
            totalFavorites: favorites.length,
            totalSearches: history.length,
            lastActivity: history.length > 0 ? history[0].searchedAt : null,
            favoritesThisWeek: this.countRecentItems(favorites, 7),
            searchesToday: this.countRecentItems(history, 1)
        };
    }

    /**
     * عد العناصر الحديثة
     * @param {Array} items - العناصر
     * @param {number} days - عدد الأيام
     * @returns {number} العدد
     */
    countRecentItems(items, days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return items.filter(item => {
            const itemDate = new Date(item.savedAt || item.searchedAt);
            return itemDate >= cutoffDate;
        }).length;
    }
}

// إنشاء نسخة مفردة من الخدمة
export const storageService = new StorageService();
export default StorageService;
