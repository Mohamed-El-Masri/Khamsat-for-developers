// Categories Data
export const CATEGORIES_DATA = {
    development: {
        name: 'تطوير وبرمجة',
        icon: 'fas fa-code',
        subCategories: {
            web_development: {
                name: 'تطوير المواقع',
                icon: 'fas fa-globe',
                items: [
                    'إنشاء موقع إلكتروني',
                    'تطوير موقع سنديان',
                    'مدونات بلوجر',
                    'إنشاء صفحة هبوط',
                    'تخصيص وتعديل المواقع',
                    'إصلاح أخطاء المواقع',
                    'نسخ احتياطي ونقل استضافة',
                    'حماية وتأمين المواقع',
                    'اختبارات تجريبية'
                ]
            },
            wordpress: {
                name: 'ووردبريس',
                icon: 'fab fa-wordpress',
                items: [
                    'إنشاء موقع ووردبريس',
                    'تنصيب ووردبريس',
                    'تخصيص وتعديل ووردبريس',
                    'تعريب قوالب ووردبريس',
                    'إصلاح مشكلات ووردبريس',
                    'تحسين سرعة ووردبريس',
                    'نسخ احتياطي ونقل استضافة',
                    'حماية ووردبريس',
                    'إضافات ووردبريس'
                ]
            },
            ecommerce: {
                name: 'إنشاء متجر إلكتروني',
                icon: 'fas fa-shopping-cart',
                items: [
                    'شوبيفاي',
                    'ووكومرس',
                    'أوبن كارت',
                    'ماجنتو',
                    'سلة',
                    'زد',
                    'فاذرشوبس',
                    'يوكان',
                    'أخرى'
                ]
            },
            software_development: {
                name: 'تطوير البرمجيات',
                icon: 'fas fa-laptop-code',
                items: [
                    'إنشاء تطبيق ويب',
                    'واجهات API والتكاملات',
                    'بوابات الدفع الإلكتروني',
                    'تحويل تصميم PSD لموقع',
                    'تطبيقات سطح المكتب',
                    'بلوك تشين وعملات رقمية',
                    'إضافات المتصفحات'
                ]
            },
            programming_languages: {
                name: 'لغات البرمجة',
                icon: 'fas fa-code',
                items: [
                    'برمجة CSS و HTML',
                    'برمجة PHP',
                    'برمجة بايثون',
                    'برمجة Java و .NET',
                    'أخرى'
                ]
            },
            mobile_development: {
                name: 'برمجة تطبيقات الجوال',
                icon: 'fas fa-mobile-alt',
                items: [
                    'إنشاء تطبيق',
                    'تعديل التطبيقات',
                    'ريسكين التطبيقات',
                    'إصلاح مشكلات التطبيقات',
                    'تحويل الموقع إلى تطبيق',
                    'رفع التطبيقات على المتاجر',
                    'إعلانات تطبيقات الجوال'
                ]
            },
            game_development: {
                name: 'تطوير الألعاب',
                icon: 'fas fa-gamepad',
                items: [
                    'Unity',
                    'Unreal',
                    'Godot',
                    'ألعاب الويب',
                    'أخرى'
                ]
            },
            technical_support: {
                name: 'دعم فني تقني',
                icon: 'fas fa-tools',
                items: [
                    'أنظمة التشغيل والبرمجيات',
                    'أمن وحماية البيانات',
                    'استضافات ونطاقات',
                    'السيرفرات ولينكس',
                    'شبكات',
                    'إدارة البريد الإلكتروني',
                    'أخرى'
                ]
            },
            chatbot_development: {
                name: 'تطوير شات بوت',
                icon: 'fas fa-robot',
                items: [
                    'بوت ديسكورد',
                    'بوت تليجرام',
                    'بوت ماسنجر',
                    'بوت واتساب',
                    'أخرى'
                ]
            },
            ai_applications: {
                name: 'تطبيقات الذكاء الاصطناعي',
                icon: 'fas fa-brain',
                items: [
                    'أخرى'
                ]
            }
        }
    },
    
    // يمكن إضافة تصنيفات أخرى هنا مثل:
    design_graphics: {
        name: 'تصميم وجرافيكس',
        icon: 'fas fa-palette',
        subCategories: {
            logo_design: {
                name: 'تصميم الشعارات',
                icon: 'fas fa-stamp',
                items: [
                    'تصميم شعار احترافي',
                    'تصميم هوية بصرية',
                    'تطوير شعار موجود',
                    'شعارات متحركة',
                    'ملفات مفتوحة المصدر'
                ]
            },
            graphic_design: {
                name: 'التصميم الجرافيكي',
                icon: 'fas fa-paint-brush',
                items: [
                    'تصميم بروشور ومطبوعات',
                    'تصميم بطاقات أعمال',
                    'تصميم بانرات إعلانية',
                    'تصميم مواقع التواصل',
                    'تصميم عروض تقديمية'
                ]
            },
            ui_ux_design: {
                name: 'تصميم واجهات المستخدم',
                icon: 'fas fa-desktop',
                items: [
                    'تصميم واجهات المواقع',
                    'تصميم تطبيقات الجوال',
                    'تجربة المستخدم UX',
                    'تصميم نماذج أولية',
                    'اختبار قابلية الاستخدام'
                ]
            }
        }
    },
    
    marketing_sales: {
        name: 'تسويق ومبيعات',
        icon: 'fas fa-bullhorn',
        subCategories: {
            digital_marketing: {
                name: 'التسويق الرقمي',
                icon: 'fas fa-chart-line',
                items: [
                    'إدارة حسابات التواصل',
                    'تسويق عبر الفيسبوك',
                    'تسويق عبر جوجل',
                    'تحسين محركات البحث SEO',
                    'التسويق بالمحتوى'
                ]
            },
            seo_optimization: {
                name: 'تحسين محركات البحث',
                icon: 'fas fa-search',
                items: [
                    'تحسين SEO للمواقع',
                    'بحث الكلمات المفتاحية',
                    'تحليل وتقارير SEO',
                    'بناء الروابط الخارجية',
                    'تحسين المحتوى'
                ]
            },
            content_marketing: {
                name: 'التسويق بالمحتوى',
                icon: 'fas fa-pen-nib',
                items: [
                    'كتابة مقالات تسويقية',
                    'إنشاء محتوى مرئي',
                    'استراتيجية المحتوى',
                    'كتابة إعلانات مدفوعة',
                    'تحليل أداء المحتوى'
                ]
            }
        }
    }
};

// Get subcategories for a main category
export function getSubCategories(mainCategory) {
    return CATEGORIES_DATA[mainCategory]?.subCategories || {};
}

// Get category display name
export function getCategoryName(categoryKey) {
    return CATEGORIES_DATA[categoryKey]?.name || categoryKey;
}

// Get subcategory display name
export function getSubCategoryName(mainCategory, subCategory) {
    return CATEGORIES_DATA[mainCategory]?.subCategories[subCategory]?.name || subCategory;
}

// Get category icon
export function getCategoryIcon(categoryKey) {
    return CATEGORIES_DATA[categoryKey]?.icon || 'fas fa-folder';
}

// Get subcategory icon
export function getSubCategoryIcon(mainCategory, subCategory) {
    return CATEGORIES_DATA[mainCategory]?.subCategories[subCategory]?.icon || 'fas fa-folder-open';
}

// Get subcategory items
export function getSubCategoryItems(mainCategory, subCategory) {
    return CATEGORIES_DATA[mainCategory]?.subCategories[subCategory]?.items || [];
}

// Validate category selection
export function validateCategorySelection(mainCategory, subCategory) {
    const categories = CATEGORIES_DATA[mainCategory];
    if (!categories) return false;
    
    const subCategories = categories.subCategories[subCategory];
    return !!subCategories;
}

// Get all available main categories
export function getAllMainCategories() {
    return Object.keys(CATEGORIES_DATA).map(key => ({
        key,
        name: CATEGORIES_DATA[key].name,
        icon: CATEGORIES_DATA[key].icon
    }));
}

// Get all subcategories for a main category
export function getAllSubCategories(mainCategory) {
    const subCategories = getSubCategories(mainCategory);
    return Object.keys(subCategories).map(key => ({
        key,
        name: subCategories[key].name,
        icon: subCategories[key].icon,
        items: subCategories[key].items
    }));
}
