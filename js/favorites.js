/**
 * Favorites Page Controller
 * التحكم في صفحة المفضلة والتاريخ
 */

import { storageService } from './services/storageService.js';
import { showToast } from './utils/helpers.js';

class FavoritesController {
    constructor() {
        this.currentService = null;
        this.init();
    }

    /**
     * تهيئة الصفحة
     */
    init() {
        this.loadStats();
        this.loadFavorites();
        this.loadHistory();
        this.bindEvents();
    }

    /**
     * تحميل الإحصائيات
     */
    loadStats() {
        const stats = storageService.getUsageStats();
        
        document.getElementById('totalFavorites').textContent = stats.totalFavorites;
        document.getElementById('totalSearches').textContent = stats.totalSearches;
        document.getElementById('favoritesThisWeek').textContent = stats.favoritesThisWeek;
        document.getElementById('searchesToday').textContent = stats.searchesToday;
        
        document.getElementById('favoritesCount').textContent = stats.totalFavorites;
        document.getElementById('historyCount').textContent = stats.totalSearches;
    }

    /**
     * تحميل المفضلة
     */
    loadFavorites() {
        const favorites = storageService.getFavorites();
        const container = document.getElementById('favoritesList');
        const emptyState = document.getElementById('favoritesEmpty');

        if (favorites.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';
        
        container.innerHTML = favorites.map(service => this.createServiceCard(service, 'favorite')).join('');
    }

    /**
     * تحميل التاريخ
     */
    loadHistory() {
        const history = storageService.getHistory();
        const container = document.getElementById('historyList');
        const emptyState = document.getElementById('historyEmpty');

        if (history.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'block';
        emptyState.style.display = 'none';
        
        container.innerHTML = history.map(item => this.createHistoryItem(item)).join('');
    }

    /**
     * إنشاء بطاقة خدمة
     */
    createServiceCard(service, type) {
        const dateLabel = type === 'favorite' ? 'تاريخ الحفظ' : 'تاريخ البحث';
        const dateField = type === 'favorite' ? 'savedAt' : 'searchedAt';
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card service-card h-100">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <h6 class="card-title fw-bold text-primary">${service.title}</h6>
                            <div class="dropdown">
                                <button class="btn btn-sm btn-outline-secondary" data-bs-toggle="dropdown">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#" onclick="favoritesController.viewService('${service.id}')">
                                        <i class="fas fa-eye me-2"></i>عرض التفاصيل
                                    </a></li>
                                    <li><a class="dropdown-item" href="#" onclick="favoritesController.copyService('${service.id}')">
                                        <i class="fas fa-copy me-2"></i>نسخ النص
                                    </a></li>
                                    ${type === 'favorite' ? `
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" onclick="favoritesController.removeFromFavorites('${service.id}')">
                                        <i class="fas fa-trash me-2"></i>حذف من المفضلة
                                    </a></li>
                                    ` : ''}
                                </ul>
                            </div>
                        </div>
                        
                        <p class="card-text text-muted small mb-3">${service.description?.substring(0, 100) || 'لا يوجد وصف'}...</p>
                        
                        <div class="row text-center mb-3">
                            <div class="col-4">
                                <small class="text-muted d-block">السعر</small>
                                <strong class="text-success">${service.price || 'غير محدد'}</strong>
                            </div>
                            <div class="col-4">
                                <small class="text-muted d-block">المدة</small>
                                <strong class="text-primary">${service.deliveryTime || 'غير محدد'}</strong>
                            </div>
                            <div class="col-4">
                                <small class="text-muted d-block">التقييم</small>
                                <strong class="text-warning">${service.rating || 'جديد'}</strong>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">
                                <i class="fas fa-calendar me-1"></i>
                                ${this.formatDate(service[dateField])}
                            </small>
                            <span class="badge bg-secondary">${service.category || 'عام'}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * إنشاء عنصر تاريخ
     */
    createHistoryItem(item) {
        return `
            <div class="card mb-3">
                <div class="card-body">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h6 class="mb-1">
                                <i class="fas fa-search me-2"></i>
                                بحث في: ${item.category} - ${item.subCategory}
                            </h6>
                            <p class="text-muted mb-0">
                                <small>
                                    <i class="fas fa-clock me-1"></i>
                                    ${this.formatDate(item.searchedAt)}
                                </small>
                            </p>
                        </div>
                        <div class="col-md-4 text-end">
                            <button class="btn btn-sm btn-outline-primary me-2" onclick="favoritesController.repeatSearch('${item.id}')">
                                <i class="fas fa-redo me-1"></i>
                                إعادة البحث
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="favoritesController.viewSearchDetails('${item.id}')">
                                <i class="fas fa-info me-1"></i>
                                التفاصيل
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * ربط الأحداث
     */
    bindEvents() {
        // Export Data
        document.getElementById('exportDataBtn')?.addEventListener('click', () => {
            this.exportData();
        });

        // Import Data
        document.getElementById('importDataBtn')?.addEventListener('click', () => {
            document.getElementById('importFileInput').click();
        });

        document.getElementById('importFileInput')?.addEventListener('change', (e) => {
            this.importData(e.target.files[0]);
        });

        // Clear All Data
        document.getElementById('clearAllDataBtn')?.addEventListener('click', () => {
            this.clearAllData();
        });

        // Clear History
        document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
            this.clearHistory();
        });

        // Search in favorites
        document.getElementById('favoritesSearch')?.addEventListener('input', (e) => {
            this.searchFavorites(e.target.value);
        });

        // Search in history
        document.getElementById('historySearch')?.addEventListener('input', (e) => {
            this.searchHistory(e.target.value);
        });

        // Sort favorites
        document.getElementById('favoritesSort')?.addEventListener('change', (e) => {
            this.sortFavorites(e.target.value);
        });

        // Sort history
        document.getElementById('historySort')?.addEventListener('change', (e) => {
            this.sortHistory(e.target.value);
        });

        // Copy service button in modal
        document.getElementById('copyServiceBtn')?.addEventListener('click', () => {
            this.copyCurrentService();
        });
    }

    /**
     * عرض تفاصيل الخدمة
     */
    viewService(serviceId) {
        const favorites = storageService.getFavorites();
        const service = favorites.find(s => s.id === serviceId);
        
        if (service) {
            this.currentService = service;
            this.showServiceModal(service);
        }
    }

    /**
     * عرض مودال تفاصيل الخدمة
     */
    showServiceModal(service) {
        const modalContent = document.getElementById('serviceDetailContent');
        
        modalContent.innerHTML = `
            <div class="service-details">
                <h4 class="text-primary mb-3">${service.title}</h4>
                
                <div class="row mb-4">
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h5 class="text-success mb-0">${service.price}</h5>
                                <small class="text-muted">السعر</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h5 class="text-primary mb-0">${service.deliveryTime}</h5>
                                <small class="text-muted">مدة التسليم</small>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card bg-light">
                            <div class="card-body text-center">
                                <h5 class="text-warning mb-0">${service.rating || 'جديد'}</h5>
                                <small class="text-muted">التقييم</small>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <h6 class="fw-bold">الوصف:</h6>
                    <p class="text-muted">${service.description}</p>
                </div>
                
                ${service.features ? `
                <div class="mb-3">
                    <h6 class="fw-bold">الميزات:</h6>
                    <ul class="list-unstyled">
                        ${service.features.map(feature => `<li><i class="fas fa-check text-success me-2"></i>${feature}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${service.tags ? `
                <div class="mb-3">
                    <h6 class="fw-bold">الكلمات المفتاحية:</h6>
                    <div>
                        ${service.tags.map(tag => `<span class="badge bg-secondary me-1">${tag}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                
                <div class="text-muted">
                    <small>
                        <i class="fas fa-calendar me-1"></i>
                        تم الحفظ: ${this.formatDate(service.savedAt)}
                    </small>
                </div>
            </div>
        `;
        
        new bootstrap.Modal(document.getElementById('serviceDetailModal')).show();
    }

    /**
     * نسخ تفاصيل الخدمة
     */
    copyService(serviceId) {
        const favorites = storageService.getFavorites();
        const service = favorites.find(s => s.id === serviceId);
        
        if (service) {
            const serviceText = this.formatServiceForCopy(service);
            this.copyToClipboard(serviceText);
        }
    }

    /**
     * نسخ الخدمة الحالية من المودال
     */
    copyCurrentService() {
        if (this.currentService) {
            const serviceText = this.formatServiceForCopy(this.currentService);
            this.copyToClipboard(serviceText);
        }
    }

    /**
     * تنسيق الخدمة للنسخ
     */
    formatServiceForCopy(service) {
        return `
${service.title}

الوصف:
${service.description}

السعر: ${service.price}
مدة التسليم: ${service.deliveryTime}
التقييم: ${service.rating || 'جديد'}

${service.features ? `الميزات:
${service.features.map(feature => `• ${feature}`).join('\n')}

` : ''}${service.tags ? `الكلمات المفتاحية:
${service.tags.join(', ')}` : ''}
        `.trim();
    }

    /**
     * نسخ إلى الحافظة
     */
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            showToast('تم نسخ تفاصيل الخدمة بنجاح!', 'success');
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            showToast('فشل في نسخ النص', 'error');
        }
    }

    /**
     * حذف من المفضلة
     */
    removeFromFavorites(serviceId) {
        if (confirm('هل أنت متأكد من حذف هذه الخدمة من المفضلة؟')) {
            const success = storageService.removeFromFavorites(serviceId);
            if (success) {
                showToast('تم حذف الخدمة من المفضلة', 'success');
                this.loadStats();
                this.loadFavorites();
            } else {
                showToast('فشل في حذف الخدمة', 'error');
            }
        }
    }

    /**
     * تصدير البيانات
     */
    exportData() {
        const data = storageService.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `khamsat-data-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('تم تصدير البيانات بنجاح!', 'success');
    }

    /**
     * استيراد البيانات
     */
    importData(file) {
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                const success = storageService.importData(data);
                
                if (success) {
                    showToast('تم استيراد البيانات بنجاح!', 'success');
                    this.loadStats();
                    this.loadFavorites();
                    this.loadHistory();
                } else {
                    showToast('فشل في استيراد البيانات', 'error');
                }
            } catch (error) {
                console.error('Error importing data:', error);
                showToast('ملف غير صالح للاستيراد', 'error');
            }
        };
        reader.readAsText(file);
    }

    /**
     * مسح جميع البيانات
     */
    clearAllData() {
        if (confirm('هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.')) {
            localStorage.clear();
            showToast('تم مسح جميع البيانات', 'success');
            this.loadStats();
            this.loadFavorites();
            this.loadHistory();
        }
    }

    /**
     * مسح التاريخ
     */
    clearHistory() {
        if (confirm('هل أنت متأكد من حذف تاريخ البحث؟')) {
            const success = storageService.clearHistory();
            if (success) {
                showToast('تم مسح تاريخ البحث', 'success');
                this.loadStats();
                this.loadHistory();
            } else {
                showToast('فشل في مسح التاريخ', 'error');
            }
        }
    }

    /**
     * البحث في المفضلة
     */
    searchFavorites(query) {
        const favorites = storageService.getFavorites();
        const filtered = favorites.filter(service => 
            service.title.toLowerCase().includes(query.toLowerCase()) ||
            service.description.toLowerCase().includes(query.toLowerCase()) ||
            (service.category && service.category.toLowerCase().includes(query.toLowerCase()))
        );
        
        const container = document.getElementById('favoritesList');
        container.innerHTML = filtered.map(service => this.createServiceCard(service, 'favorite')).join('');
    }

    /**
     * البحث في التاريخ
     */
    searchHistory(query) {
        const history = storageService.getHistory();
        const filtered = history.filter(item => 
            item.category.toLowerCase().includes(query.toLowerCase()) ||
            item.subCategory.toLowerCase().includes(query.toLowerCase())
        );
        
        const container = document.getElementById('historyList');
        container.innerHTML = filtered.map(item => this.createHistoryItem(item)).join('');
    }

    /**
     * ترتيب المفضلة
     */
    sortFavorites(sortBy) {
        const favorites = storageService.getFavorites();
        let sorted;
        
        switch (sortBy) {
            case 'newest':
                sorted = favorites.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
                break;
            case 'oldest':
                sorted = favorites.sort((a, b) => new Date(a.savedAt) - new Date(b.savedAt));
                break;
            case 'title':
                sorted = favorites.sort((a, b) => a.title.localeCompare(b.title, 'ar'));
                break;
            case 'category':
                sorted = favorites.sort((a, b) => (a.category || '').localeCompare(b.category || '', 'ar'));
                break;
            default:
                sorted = favorites;
        }
        
        const container = document.getElementById('favoritesList');
        container.innerHTML = sorted.map(service => this.createServiceCard(service, 'favorite')).join('');
    }

    /**
     * ترتيب التاريخ
     */
    sortHistory(sortBy) {
        const history = storageService.getHistory();
        let sorted;
        
        switch (sortBy) {
            case 'newest':
                sorted = history.sort((a, b) => new Date(b.searchedAt) - new Date(a.searchedAt));
                break;
            case 'oldest':
                sorted = history.sort((a, b) => new Date(a.searchedAt) - new Date(b.searchedAt));
                break;
            case 'category':
                sorted = history.sort((a, b) => a.category.localeCompare(b.category, 'ar'));
                break;
            default:
                sorted = history;
        }
        
        const container = document.getElementById('historyList');
        container.innerHTML = sorted.map(item => this.createHistoryItem(item)).join('');
    }

    /**
     * إعادة البحث
     */
    repeatSearch(historyId) {
        const history = storageService.getHistory();
        const item = history.find(h => h.id === historyId);
        
        if (item) {
            // تحويل إلى الصفحة الرئيسية مع المعاملات
            const params = new URLSearchParams({
                category: item.category,
                subCategory: item.subCategory
            });
            window.location.href = `index.html?${params.toString()}`;
        }
    }

    /**
     * تنسيق التاريخ
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);
        
        if (diffInHours < 1) {
            return 'منذ دقائق';
        } else if (diffInHours < 24) {
            return `منذ ${Math.floor(diffInHours)} ساعة`;
        } else if (diffInHours < 168) { // 7 days
            return `منذ ${Math.floor(diffInHours / 24)} يوم`;
        } else {
            return date.toLocaleDateString('ar-SA');
        }
    }
}

// تهيئة الكنترولر عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.favoritesController = new FavoritesController();
});
