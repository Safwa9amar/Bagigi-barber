const translations = {
    ar: {
        navHome: "الرئيسية",
        navServices: "الخدمات",
        navApp: "التطبيق",
        navContact: "اتصل بنا",
        heroBadge: "أفضل حلاق في العالم - غليزان",
        heroTitleLine1: "حلاقة دقيقة",
        heroTitleLine2: "في قلب غليزان",
        heroParagraph:
            "مرحباً بكم في صالون حلاقة هواري باجيجي الجديد. نقدم لكم أرقى خدمات الحلاقة، تنظيف البشرة، والعناية الكاملة بالرجل العصري.",
        downloadButton: "تحميل التطبيق (APK)",
        followButton: "تابعنا على إنستغرام",
        featuresHeading: "خدمات صالون هواري باجيجي",
        featuresSubHeading: "نتميز بالجودة والاحترافية في كل لمسة.",
        feature1Title: "حلاقة توقيع",
        feature1Description: "قصات عصرية وكلاسيكية تناسب شخصيتك، بأيدي أفضل الحلاقين في المنطقة.",
        feature2Title: "تنظيف البشرة",
        feature2Description: "خدمات متخصصة للعناية بالوجه وتنظيف البشرة باستخدام أحدث التقنيات والمواد.",
        feature3Title: "خدمات Handmade",
        feature3Description: "عناية دقيقة وتفاصيل يدوية تجعل من زيارتك تجربة فريدة لا تُنسى.",
        previewHeading: "احجز موعدك عبر التطبيق",
        previewSubtext: "لقد افتتحنا محلنا الجديد بجانب القديم، والآن يمكنك الحجز بسهولة.",
        previewCardTitle: "تحميل تطبيق باجيجي",
        previewCardText: "التطبيق متاح للتحميل عبر جوجل درايف. سهل حياتك واحجز مكانك في الطابور وأنت في بيتك.",
        previewDownloadButton: "تحميل التطبيق (APK)",
        contactHeading: "هل تحتاج مساعدة أو قصة مخصصة؟",
        contactSubtitle: "شاركنا رؤيتك وسنؤكد لك الموعد الأمثل.",
        contactLabelName: "الاسم",
        contactPlaceholderName: "أسمك الكامل",
        contactLabelPhone: "الهاتف أو واتساب",
        contactPlaceholderPhone: "0558 10 98 15",
        contactLabelMessage: "الرسالة",
        contactPlaceholderMessage:
            "اخبرنا بالتفاصيل؛ نوع الحلاقة، بنية قص الشعر، أو المواعيد المفضلة",
        contactFormSubmit: "إرسال الطلب",
        contactInfoTitle: "زور الاستوديو",
        contactInfoLocation: "شارع طنجة، غليزان (Relizane)",
        contactInfoSchedule: "يوميًا 9ص–9م · نرحب بالحضور العشوائي",
        contactInfoAppButton: "تحميل التطبيق",
        miniContactHeading: "تواصل معنا",
        miniContactLocation: "شارع طنجة، غليزان (Rue Tanger, Relizane)",
        contactPageHeading: "تواصل مع هواري باجيجي",
        contactPageSubtitle: "شارك احتياجك، استفسر عن المواعيد، أو اطلب قصة مخصصة.",
        contactPageDownloadButton: "تحميل التطبيق",
    },
    en: {
        navHome: "Home",
        navServices: "Services",
        navApp: "App",
        navContact: "Contact",
        heroBadge: "Best Barber in the World – Relizane",
        heroTitleLine1: "Precision grooming",
        heroTitleLine2: "in Relizane",
        heroParagraph:
            "Step into Houari Bagigi’s studio for premium cuts, skin detailing, and a complete gentleman’s grooming ritual crafted for the modern man.",
        downloadButton: "Download the App (APK)",
        followButton: "Follow us on Instagram",
        featuresHeading: "Houari Bagigi Salon Services",
        featuresSubHeading: "Quality and professionalism in every touch.",
        feature1Title: "Signature Cuts",
        feature1Description:
            "Modern and classic cuts tailored to your personality by the region’s top barbers.",
        feature2Title: "Skin Cleansing",
        feature2Description: "Expert facial care with the latest techniques and premium products.",
        feature3Title: "Handmade Services",
        feature3Description: "Artisanal attention that turns every visit into a memorable experience.",
        previewHeading: "Book your visit through the app",
        previewSubtext:
            "Our new studio next to the original location is open—reserve your spot with ease.",
        previewCardTitle: "Download the Bagigi App",
        previewCardText:
            "The app lives on Google Drive. Navigate the queue from home and arrive ready.",
        previewDownloadButton: "Download the App (APK)",
        contactHeading: "Need help or a custom cut?",
        contactSubtitle: "Share your vision and we will confirm the perfect slot.",
        contactLabelName: "Name",
        contactPlaceholderName: "Your full name",
        contactLabelPhone: "Phone or WhatsApp",
        contactPlaceholderPhone: "Your number",
        contactLabelMessage: "Message",
        contactPlaceholderMessage: "Tell us about your preferred style, time, or detail.",
        contactFormSubmit: "Send Request",
        contactInfoTitle: "Visit the studio",
        contactInfoLocation: "Rue Tanger, Relizane (next to the original shop)",
        contactInfoSchedule: "Daily 9AM–9PM · walk-ins welcome",
        contactInfoAppButton: "Download the App",
        miniContactHeading: "Get in touch",
        miniContactLocation: "Rue Tanger, Relizane",
        contactPageHeading: "Contact Houari Bagigi",
        contactPageSubtitle: "Share a reference, ask about availability, or request a custom look.",
        contactPageDownloadButton: "Download the App",
    },
};

const dirMap = {
    ar: "rtl",
    en: "ltr",
};

function applyTranslations(lang = "ar") {
    const allNodes = document.querySelectorAll("[data-i18n-key]");
    allNodes.forEach((node) => {
        const key = node.dataset.i18nKey;
        if (!key) return;
        const text = translations[lang]?.[key];
        if (text) {
            node.textContent = text;
        }
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach((field) => {
        const key = field.dataset.i18nPlaceholder;
        const placeholder = translations[lang]?.[key];
        if (placeholder) {
            field.placeholder = placeholder;
        }
    });

    const dirValue = dirMap[lang] || "ltr";
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", dirValue);
    document.body.setAttribute("dir", dirValue);
    updateFormDirection(lang);
    updateNavDirection(lang);
}

function updateFormDirection(lang) {
    const dirValue = dirMap[lang] || "ltr";
    document.querySelectorAll(".contact-form").forEach((form) => {
        form.setAttribute("dir", dirValue);
        form.style.textAlign = dirValue === "rtl" ? "right" : "left";
    });
}

function updateNavDirection(lang) {
    const dirValue = dirMap[lang] || "ltr";
    document.querySelectorAll(".primary-nav").forEach((nav) => {
        nav.setAttribute("data-dir", dirValue);
    });
}

const storageKey = "bagigiLang";

function safeLocalStorage() {
    try {
        return window?.localStorage;
    } catch {
        return null;
    }
}

function initLanguageSwitcher(defaultLang = "ar") {
    const switcher = document.querySelector("[data-lang-switcher]");
    const buttons = switcher ? Array.from(switcher.querySelectorAll("[data-lang]")) : [];
    const activate = (lang) => {
        buttons.forEach((button) => {
            button.classList.toggle("active", button.dataset.lang === lang);
        });
    };

    const storage = safeLocalStorage();
    const storedLang = storage?.getItem(storageKey);
    const targetLang = storedLang || defaultLang;

    applyTranslations(targetLang);
    activate(targetLang);

    if (storage) {
        storage.setItem(storageKey, targetLang);
    }

    buttons.forEach((button) => {
        button.addEventListener("click", () => {
            const lang = button.dataset.lang;
            applyTranslations(lang);
            activate(lang);
            safeLocalStorage()?.setItem(storageKey, lang);
        });
    });
}

window.initLanguageSwitcher = initLanguageSwitcher;
