// Image Service for generating and handling thumbnails and gallery images
import { API_CONFIG, APP_CONFIG } from '../config/api.js';
import { logError, showToast } from '../utils/helpers.js';

class ImageService {
    constructor() {
        this.canvasCache = new Map();
        this.imageCache = new Map();
    }

    /**
     * Generate thumbnail for service
     * @param {Object} service 
     * @param {string} description 
     * @returns {Promise<string>}
     */
    async generateThumbnail(service, description) {
        try {
            // Create a professional thumbnail using Canvas API
            const canvas = this.createCanvas(APP_CONFIG.THUMBNAILS.WIDTH, APP_CONFIG.THUMBNAILS.HEIGHT);
            const ctx = canvas.getContext('2d');

            // Create gradient background
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, '#1c7ed6');
            gradient.addColorStop(1, '#74c0fc');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Add overlay pattern
            this.addPatternOverlay(ctx, canvas.width, canvas.height);

            // Add service title
            this.addTitle(ctx, service.title || service.name, canvas.width, canvas.height);

            // Add service icon/category indicator
            this.addCategoryIcon(ctx, service.category, canvas.width, canvas.height);

            // Add price badge
            this.addPriceBadge(ctx, service.price, canvas.width, canvas.height);

            // Add decorative elements
            this.addDecorativeElements(ctx, canvas.width, canvas.height);

            // Convert to blob and return URL
            return new Promise((resolve) => {
                canvas.toBlob((blob) => {
                    const url = URL.createObjectURL(blob);
                    resolve(url);
                }, 'image/png');
            });

        } catch (error) {
            logError('Error generating thumbnail:', error);
            return this.generateFallbackThumbnail(service);
        }
    }

    /**
     * Generate gallery images for service examples
     * @param {Array} examples 
     * @param {string} category 
     * @returns {Promise<Array>}
     */
    async generateGalleryImages(examples, category) {
        const images = [];
        
        for (const example of examples) {
            try {
                const imageUrl = await this.generateExampleImage(example, category);
                images.push({
                    ...example,
                    imageUrl
                });
            } catch (error) {
                logError('Error generating gallery image:', error);
                images.push({
                    ...example,
                    imageUrl: this.generateFallbackGalleryImage(example, category)
                });
            }
        }

        return images;
    }

    /**
     * Create canvas element
     * @param {number} width 
     * @param {number} height 
     * @returns {HTMLCanvasElement}
     */
    createCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    }

    /**
     * Add pattern overlay to canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} width 
     * @param {number} height 
     */
    addPatternOverlay(ctx, width, height) {
        ctx.globalAlpha = 0.1;
        ctx.fillStyle = '#ffffff';
        
        // Add geometric pattern
        for (let i = 0; i < width; i += 100) {
            for (let j = 0; j < height; j += 100) {
                ctx.beginPath();
                ctx.arc(i, j, 30, 0, Math.PI * 2);
                ctx.fill();
            }
        }
        
        ctx.globalAlpha = 1;
    }

    /**
     * Add title text to canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} title 
     * @param {number} width 
     * @param {number} height 
     */
    addTitle(ctx, title, width, height) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 60px Cairo, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // Add text shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;

        // Wrap text if too long
        const words = title.split(' ');
        const lines = this.wrapText(ctx, words.join(' '), width - 200);
        
        const lineHeight = 80;
        const startY = height / 2 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, width / 2, startY + index * lineHeight);
        });

        // Reset shadow
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
    }

    /**
     * Add category icon to canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} category 
     * @param {number} width 
     * @param {number} height 
     */
    addCategoryIcon(ctx, category, width, height) {
        // Add a simple geometric shape representing the category
        const centerX = width - 150;
        const centerY = 150;
        const radius = 60;

        // Create circle background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.fill();

        // Add icon symbol (simplified)
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 40px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('⚡', centerX, centerY);
    }

    /**
     * Add price badge to canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} price 
     * @param {number} width 
     * @param {number} height 
     */
    addPriceBadge(ctx, price, width, height) {
        const badgeX = 100;
        const badgeY = height - 150;
        const badgeWidth = 200;
        const badgeHeight = 80;

        // Create badge background
        ctx.fillStyle = '#51cf66';
        ctx.beginPath();
        ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 40);
        ctx.fill();

        // Add price text
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`$${price}`, badgeX + badgeWidth / 2, badgeY + badgeHeight / 2);
    }

    /**
     * Add decorative elements to canvas
     * @param {CanvasRenderingContext2D} ctx 
     * @param {number} width 
     * @param {number} height 
     */
    addDecorativeElements(ctx, width, height) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        
        // Add some decorative shapes
        ctx.beginPath();
        ctx.arc(width - 100, height - 100, 50, 0, Math.PI * 2);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(100, 100, 30, 0, Math.PI * 2);
        ctx.fill();
    }

    /**
     * Wrap text to fit within specified width
     * @param {CanvasRenderingContext2D} ctx 
     * @param {string} text 
     * @param {number} maxWidth 
     * @returns {Array<string>}
     */
    wrapText(ctx, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + ' ' + word).width;
            
            if (width < maxWidth) {
                currentLine += ' ' + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        
        lines.push(currentLine);
        return lines;
    }

    /**
     * Generate example image for gallery
     * @param {Object} example 
     * @param {string} category 
     * @returns {Promise<string>}
     */
    async generateExampleImage(example, category) {
        const canvas = this.createCanvas(600, 400);
        const ctx = canvas.getContext('2d');

        // Create gradient background
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
        gradient.addColorStop(0, '#e9ecef');
        gradient.addColorStop(1, '#f8f9fa');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Add border
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Add title
        ctx.fillStyle = '#495057';
        ctx.font = 'bold 24px Cairo, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const lines = this.wrapText(ctx, example.title, canvas.width - 40);
        const lineHeight = 30;
        const startY = canvas.height / 2 - (lines.length - 1) * lineHeight / 2;

        lines.forEach((line, index) => {
            ctx.fillText(line, canvas.width / 2, startY + index * lineHeight);
        });

        // Add decorative element
        ctx.fillStyle = '#1c7ed6';
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 50, 20, 0, Math.PI * 2);
        ctx.fill();

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                resolve(url);
            }, 'image/png');
        });
    }

    /**
     * Generate fallback thumbnail
     * @param {Object} service 
     * @returns {string}
     */
    generateFallbackThumbnail(service) {
        // Create a simple SVG as fallback
        const svg = `
            <svg width="${APP_CONFIG.THUMBNAILS.WIDTH}" height="${APP_CONFIG.THUMBNAILS.HEIGHT}" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style="stop-color:#1c7ed6;stop-opacity:1" />
                        <stop offset="100%" style="stop-color:#74c0fc;stop-opacity:1" />
                    </linearGradient>
                </defs>
                <rect width="100%" height="100%" fill="url(#grad)"/>
                <text x="50%" y="50%" font-family="Arial" font-size="60" font-weight="bold" fill="white" text-anchor="middle" dy=".3em">${service.title || service.name}</text>
                <circle cx="90%" cy="15%" r="60" fill="rgba(255,255,255,0.2)"/>
                <text x="90%" y="15%" font-family="Arial" font-size="40" fill="white" text-anchor="middle" dy=".3em">⚡</text>
            </svg>
        `;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    }

    /**
     * Generate fallback gallery image
     * @param {Object} example 
     * @param {string} category 
     * @returns {string}
     */
    generateFallbackGalleryImage(example, category) {
        const svg = `
            <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
                <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
                <text x="50%" y="50%" font-family="Arial" font-size="24" font-weight="bold" fill="#495057" text-anchor="middle" dy=".3em">${example.title}</text>
                <circle cx="50%" cy="20%" r="20" fill="#1c7ed6"/>
            </svg>
        `;

        const blob = new Blob([svg], { type: 'image/svg+xml' });
        return URL.createObjectURL(blob);
    }

    /**
     * Download image
     * @param {string} url 
     * @param {string} filename 
     */
    downloadImage(url, filename) {
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    /**
     * Cleanup blob URLs to prevent memory leaks
     * @param {Array<string>} urls 
     */
    cleanupBlobUrls(urls) {
        urls.forEach(url => {
            if (url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        });
    }
}

// Export singleton instance
export default new ImageService();
