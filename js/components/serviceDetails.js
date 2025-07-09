// Service Details Component
import { copyToClipboard, formatPrice, formatTextWithBreaks, generateId, showToast } from '../utils/helpers.js';
import ImageService from '../services/imageService.js';
import { storageService } from '../services/storageService.js';

export class ServiceDetails {
    constructor(service, details) {
        this.service = service;
        this.details = details;
        this.id = generateId();
        this.thumbnailUrl = null;
        this.galleryImages = [];
    }

    /**
     * Render the complete service details
     * @returns {HTMLElement}
     */
    async render() {
        const detailsElement = document.createElement('div');
        detailsElement.className = 'service-detail-card mb-5';
        detailsElement.setAttribute('data-service-id', this.id);
        
        // Generate thumbnail
        await this.generateThumbnail();
        
        // Generate gallery images
        await this.generateGallery();
        
        detailsElement.innerHTML = this.getDetailsHTML();
        this.bindEvents(detailsElement);
        
        return detailsElement;
    }

    /**
     * Generate thumbnail for the service
     */
    async generateThumbnail() {
        try {
            this.thumbnailUrl = await ImageService.generateThumbnail({
                ...this.service,
                title: this.details.title,
                category: this.service.category
            }, this.details.thumbnailDescription);
        } catch (error) {
            console.error('Error generating thumbnail:', error);
        }
    }

    /**
     * Generate gallery images
     */
    async generateGallery() {
        try {
            // Create mock gallery examples if not provided by AI
            const galleryExamples = this.details.galleryExamples || this.createMockGalleryExamples();
            this.galleryImages = await ImageService.generateGalleryImages(galleryExamples, this.service.category);
        } catch (error) {
            console.error('Error generating gallery:', error);
            this.galleryImages = [];
        }
    }

    /**
     * Create mock gallery examples
     * @returns {Array}
     */
    createMockGalleryExamples() {
        const examples = [];
        for (let i = 1; i <= 7; i++) {
            examples.push({
                title: `مثال ${i} - ${this.details.title}`,
                description: `عمل احترافي في مجال ${this.service.category}`,
                imageDescription: `تصميم احترافي يوضح ${this.details.title}`
            });
        }
        return examples;
    }

    /**
     * Get complete details HTML
     * @returns {string}
     */
    getDetailsHTML() {
        return `
            <div class="card border-0 shadow-lg">
                <!-- Header -->
                <div class="service-detail-header">
                    <h2 class="mb-3">
                        <i class="fas fa-star me-2"></i>
                        ${this.details.title}
                    </h2>
                    <p class="lead mb-4">${formatTextWithBreaks(this.details.description)}</p>
                    <div class="row align-items-center">
                        <div class="col-md-6">
                            <span class="badge bg-light text-dark fs-6 px-3 py-2">
                                <i class="fas fa-dollar-sign me-1"></i>
                                السعر: ${formatPrice(this.service.price)}
                            </span>
                        </div>
                        <div class="col-md-6 text-md-end">
                            <button class="btn btn-light btn-sm copy-title-btn">
                                <i class="fas fa-copy me-1"></i>
                                نسخ العنوان
                            </button>
                            <button class="btn btn-light btn-sm copy-desc-btn ms-2">
                                <i class="fas fa-file-alt me-1"></i>
                                نسخ الوصف
                            </button>
                        </div>
                    </div>
                </div>

                <div class="card-body p-5">
                    <!-- Thumbnail Section -->
                    ${this.getThumbnailSectionHTML()}

                    <!-- Features Section -->
                    ${this.getFeaturesSectionHTML()}

                    <!-- Deliverables Section -->
                    ${this.getDeliverablesSectionHTML()}

                    <!-- Gallery Section -->
                    ${this.getGallerySectionHTML()}

                    <!-- Keywords Section -->
                    ${this.getKeywordsSectionHTML()}

                    <!-- Instructions Section -->
                    ${this.getInstructionsSectionHTML()}
                </div>
            </div>
        `;
    }

    /**
     * Get thumbnail section HTML
     * @returns {string}
     */
    getThumbnailSectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="fas fa-image me-2"></i>
                        الصورة الرئيسية (Thumbnail)
                    </h4>
                    <div class="text-center">
                        ${this.thumbnailUrl ? `
                            <img src="${this.thumbnailUrl}" alt="${this.details.title}" class="service-thumbnail mb-3">
                            <br>
                            <button class="btn btn-success download-thumbnail-btn">
                                <i class="fas fa-download me-2"></i>
                                تحميل الصورة (1700×970)
                            </button>
                        ` : `
                            <div class="alert alert-info">
                                <i class="fas fa-info-circle me-2"></i>
                                جاري إنشاء الصورة الرئيسية...
                            </div>
                        `}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get features section HTML
     * @returns {string}
     */
    getFeaturesSectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-4">
                        <i class="fas fa-star me-2"></i>
                        مميزات الخدمة
                    </h4>
                    <div class="row">
                        ${this.details.features?.map((feature, index) => `
                            <div class="col-md-6 mb-3">
                                <div class="feature-item">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h6 class="mb-0">
                                            <i class="fas fa-check-circle me-2"></i>
                                            ${feature.title}
                                        </h6>
                                        <button class="btn copy-btn copy-feature-btn" data-text="${feature.title}">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                    <p class="text-muted mb-2">${feature.description}</p>
                                    <button class="btn copy-btn copy-feature-desc-btn" data-text="${feature.description}">
                                        <i class="fas fa-file-alt me-1"></i>
                                        نسخ الوصف
                                    </button>
                                </div>
                            </div>
                        `).join('') || '<div class="col-12"><p class="text-muted">لم يتم إنشاء المميزات بعد</p></div>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get deliverables section HTML
     * @returns {string}
     */
    getDeliverablesSectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-4">
                        <i class="fas fa-box-open me-2"></i>
                        ما الذي ستستلمه
                    </h4>
                    <div class="row">
                        ${this.details.deliverables?.map((item, index) => `
                            <div class="col-md-6 mb-3">
                                <div class="deliverable-item">
                                    <div class="d-flex justify-content-between align-items-start mb-2">
                                        <h6 class="mb-0">
                                            <i class="fas fa-gift me-2"></i>
                                            ${item.title}
                                        </h6>
                                        <button class="btn copy-btn copy-deliverable-btn" data-text="${item.title}">
                                            <i class="fas fa-copy"></i>
                                        </button>
                                    </div>
                                    <p class="text-muted mb-2">${item.description}</p>
                                    <button class="btn copy-btn copy-deliverable-desc-btn" data-text="${item.description}">
                                        <i class="fas fa-file-alt me-1"></i>
                                        نسخ الوصف
                                    </button>
                                </div>
                            </div>
                        `).join('') || '<div class="col-12"><p class="text-muted">لم يتم إنشاء المخرجات بعد</p></div>'}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get gallery section HTML
     * @returns {string}
     */
    getGallerySectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-4">
                        <i class="fas fa-images me-2"></i>
                        معرض الأعمال
                    </h4>
                    <div class="gallery-grid">
                        ${this.galleryImages.map((item, index) => `
                            <div class="gallery-item">
                                <img src="${item.imageUrl}" alt="${item.title}" loading="lazy">
                                <div class="overlay">
                                    <button class="btn btn-primary download-gallery-btn" data-url="${item.imageUrl}" data-filename="gallery-${index + 1}.png">
                                        <i class="fas fa-download me-2"></i>
                                        تحميل
                                    </button>
                                </div>
                                <div class="p-3 bg-white">
                                    <h6 class="mb-2">${item.title}</h6>
                                    <p class="text-muted small mb-0">${item.description}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get keywords section HTML
     * @returns {string}
     */
    getKeywordsSectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="fas fa-tags me-2"></i>
                        الكلمات المفتاحية
                    </h4>
                    <div class="keywords-container">
                        ${this.details.keywords?.map(keyword => `
                            <span class="keyword-tag" data-keyword="${keyword}">
                                ${keyword}
                                <i class="fas fa-copy copy-icon"></i>
                            </span>
                        `).join('') || '<span class="text-muted">لم يتم إنشاء الكلمات المفتاحية بعد</span>'}
                    </div>
                    <div class="mt-3">
                        <button class="btn btn-outline-primary copy-all-keywords-btn">
                            <i class="fas fa-copy me-2"></i>
                            نسخ جميع الكلمات المفتاحية
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Get instructions section HTML
     * @returns {string}
     */
    getInstructionsSectionHTML() {
        return `
            <div class="row mb-5">
                <div class="col-12">
                    <h4 class="text-primary mb-3">
                        <i class="fas fa-clipboard-list me-2"></i>
                        تعليمات للمشتري
                    </h4>
                    <div class="instructions-box">
                        <h5>
                            <i class="fas fa-info-circle me-2"></i>
                            المعلومات المطلوبة من المشتري
                        </h5>
                        <p>${formatTextWithBreaks(this.details.instructions || 'لم يتم إنشاء التعليمات بعد')}</p>
                        <div class="text-end">
                            <button class="btn btn-warning copy-instructions-btn">
                                <i class="fas fa-copy me-2"></i>
                                نسخ التعليمات
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Bind event listeners
     * @param {HTMLElement} element 
     */
    bindEvents(element) {
        // Copy title button
        const copyTitleBtn = element.querySelector('.copy-title-btn');
        copyTitleBtn?.addEventListener('click', () => {
            copyToClipboard(this.details.title, copyTitleBtn);
        });

        // Copy description button
        const copyDescBtn = element.querySelector('.copy-desc-btn');
        copyDescBtn?.addEventListener('click', () => {
            copyToClipboard(this.details.description, copyDescBtn);
        });

        // Download thumbnail button
        const downloadThumbnailBtn = element.querySelector('.download-thumbnail-btn');
        downloadThumbnailBtn?.addEventListener('click', () => {
            if (this.thumbnailUrl) {
                ImageService.downloadImage(this.thumbnailUrl, `${this.details.title}-thumbnail.png`);
            }
        });

        // Copy feature buttons
        element.querySelectorAll('.copy-feature-btn, .copy-feature-desc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                copyToClipboard(btn.dataset.text, btn);
            });
        });

        // Copy deliverable buttons
        element.querySelectorAll('.copy-deliverable-btn, .copy-deliverable-desc-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                copyToClipboard(btn.dataset.text, btn);
            });
        });

        // Download gallery buttons
        element.querySelectorAll('.download-gallery-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                ImageService.downloadImage(btn.dataset.url, btn.dataset.filename);
            });
        });

        // Copy keyword buttons
        element.querySelectorAll('.keyword-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                copyToClipboard(tag.dataset.keyword, tag);
            });
        });

        // Copy all keywords button
        const copyAllKeywordsBtn = element.querySelector('.copy-all-keywords-btn');
        copyAllKeywordsBtn?.addEventListener('click', () => {
            const keywords = this.details.keywords?.join(', ') || '';
            copyToClipboard(keywords, copyAllKeywordsBtn);
        });

        // Copy instructions button
        const copyInstructionsBtn = element.querySelector('.copy-instructions-btn');
        copyInstructionsBtn?.addEventListener('click', () => {
            copyToClipboard(this.details.instructions, copyInstructionsBtn);
        });
    }

    /**
     * Update service details
     * @param {Object} newDetails 
     */
    updateDetails(newDetails) {
        this.details = { ...this.details, ...newDetails };
        
        // Re-render if element exists
        const element = document.querySelector(`[data-service-id="${this.id}"]`);
        if (element) {
            const parent = element.parentElement;
            this.render().then(newElement => {
                parent.replaceChild(newElement, element);
            });
        }
    }

    /**
     * Get service data
     * @returns {Object}
     */
    getData() {
        return {
            id: this.id,
            service: this.service,
            details: this.details,
            thumbnailUrl: this.thumbnailUrl,
            galleryImages: this.galleryImages
        };
    }

    /**
     * Cleanup resources
     */
    cleanup() {
        // Cleanup blob URLs
        const urls = [this.thumbnailUrl, ...this.galleryImages.map(img => img.imageUrl)];
        ImageService.cleanupBlobUrls(urls);
    }

    /**
     * Export service as JSON
     * @returns {string}
     */
    exportAsJSON() {
        const exportData = {
            service: this.service,
            details: this.details,
            generatedAt: new Date().toISOString(),
            developer: 'المهندس محمد سامح المصري',
            supervisor: 'ITI - فرع سوهاج'
        };
        
        return JSON.stringify(exportData, null, 2);
    }

    /**
     * Export service as text
     * @returns {string}
     */
    exportAsText() {
        let text = `خدمة: ${this.details.title}\n\n`;
        text += `الوصف:\n${this.details.description}\n\n`;
        text += `السعر: ${formatPrice(this.service.price)}\n\n`;
        
        if (this.details.features?.length) {
            text += `المميزات:\n`;
            this.details.features.forEach((feature, index) => {
                text += `${index + 1}. ${feature.title}\n   ${feature.description}\n\n`;
            });
        }
        
        if (this.details.deliverables?.length) {
            text += `ما ستستلمه:\n`;
            this.details.deliverables.forEach((item, index) => {
                text += `${index + 1}. ${item.title}\n   ${item.description}\n\n`;
            });
        }
        
        if (this.details.keywords?.length) {
            text += `الكلمات المفتاحية:\n${this.details.keywords.join(', ')}\n\n`;
        }
        
        if (this.details.instructions) {
            text += `تعليمات للمشتري:\n${this.details.instructions}\n\n`;
        }
        
        text += `\n---\nتم الإنشاء بواسطة: منشئ خدمات خمسات AI\nالمطور: المهندس محمد سامح المصري\n : ITI - فرع سوهاج`;
        
        return text;
    }
}

/**
 * Service Details Container
 */
export class ServiceDetailsContainer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.serviceDetails = new Map();
    }

    /**
     * Add service details to container
     * @param {ServiceDetails} serviceDetail 
     */
    async addServiceDetail(serviceDetail) {
        this.serviceDetails.set(serviceDetail.id, serviceDetail);
        
        const element = await serviceDetail.render();
        this.container.appendChild(element);
        
        // Animate in
        element.style.opacity = '0';
        element.style.transform = 'translateY(50px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.8s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    /**
     * Clear all service details
     */
    clear() {
        // Cleanup resources
        this.serviceDetails.forEach(detail => detail.cleanup());
        
        this.serviceDetails.clear();
        this.container.innerHTML = '';
    }

    /**
     * Get all service details
     * @returns {Array}
     */
    getAllServiceDetails() {
        return Array.from(this.serviceDetails.values());
    }

    /**
     * Export all services
     * @param {string} format - 'json' or 'text'
     * @returns {string}
     */
    exportAll(format = 'json') {
        const services = this.getAllServiceDetails().map(detail => detail.getData());
        
        if (format === 'json') {
            return JSON.stringify({
                services,
                exportedAt: new Date().toISOString(),
                totalServices: services.length,
                developer: 'المهندس محمد سامح المصري',
                supervisor: 'ITI - فرع سوهاج'
            }, null, 2);
        } else {
            let text = `تقرير الخدمات المُنشأة\n`;
            text += `العدد الإجمالي: ${services.length}\n`;
            text += `تاريخ التصدير: ${new Date().toLocaleString('ar-EG')}\n\n`;
            text += `${'='.repeat(50)}\n\n`;
            
            services.forEach((serviceData, index) => {
                const detail = this.serviceDetails.get(serviceData.id);
                if (detail) {
                    text += `خدمة رقم ${index + 1}:\n`;
                    text += detail.exportAsText();
                    text += `\n\n${'='.repeat(50)}\n\n`;
                }
            });
            
            return text;
        }
    }
}
