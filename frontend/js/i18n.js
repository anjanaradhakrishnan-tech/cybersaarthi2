// CyberSaarthi i18n Translation Dictionary (English, Malayalam, Hindi)

const translations = {
    en: {
        subtitle: "Cybersecurity Without Digital Exclusion",
        heroMessage: "Your digital safety companion for suspicious calls, messages, links and online fraud.",
        checkBeforeClick: "Not sure? Check before you click.",
        checkLink: "Check a Link",
        checkMessage: "Check a Message",
        checkPhone: "Check a Phone Number",
        checkMedia: "Check Media",
        talkAssistant: "Talk to CyberSaarthi",
        emergencyHelp: "I THINK I AM BEING SCAMMED",
        lowRisk: "Likely Safe",
        suspicious: "Proceed With Care",
        highRisk: "Take Action Immediately",
        disclaimerText: "This assessment provides guidance and is not a guarantee of accuracy.",
        reportScam: "Report Fraud",
        elderModeLabel: "Elder Mode",
        callHelpline: "CALL CYBERSAARTHI"
    },
    ml: {
        subtitle: "ഡിജിറ്റൽ സുരക്ഷ ഏവർക്കും സുഗമമായി",
        heroMessage: "സംശയാസ്പദമായ കോളുകൾ, സന്ദേശങ്ങൾ, ലിങ്കുകൾ എന്നിവയിൽ നിന്നുള്ള നിങ്ങളുടെ ഡിജിറ്റൽ സുരക്ഷാ സഹായി.",
        checkBeforeClick: "ഉറപ്പില്ലേ? ക്ലിക്ക് ചെയ്യുന്നതിന് മുമ്പ് പരിശോധിക്കൂ.",
        checkLink: "ലിങ്ക് പരിശോധിക്കുക",
        checkMessage: "സന്ദേശം പരിശോധിക്കുക",
        checkPhone: "ഫോൺ നമ്പർ പരിശോധിക്കുക",
        checkMedia: "മീഡിയ പരിശോധിക്കുക",
        talkAssistant: "സൈബർസാരഥിയോട് സംസാരിക്കൂ",
        emergencyHelp: "എനിക്ക് തട്ടിപ്പ് സംശയിക്കുന്നു",
        lowRisk: "സുരക്ഷിതമായിരിക്കാൻ സാധ്യതയുണ്ട്",
        suspicious: "ജാഗ്രത പാലിക്കുക",
        highRisk: "ഉടൻ നടപടി സ്വീകരിക്കുക",
        disclaimerText: "ഈ വിലയിരുത്തൽ മാർഗ്ഗനിർദ്ദേശം മാത്രമാണ്, പൂർണ്ണമായ ഗ്യാരണ്ടി അല്ല.",
        reportScam: "തട്ടിപ്പ് റിപ്പോർട്ട് ചെയ്യുക",
        elderModeLabel: "വയോജന മോഡ്",
        callHelpline: "സൈബർസാരഥിയെ വിളിക്കൂ"
    },
    hi: {
        subtitle: "डिजिटल सुरक्षा सबके लिए आसान",
        heroMessage: "संदिग्ध कॉल, संदेश, लिंक और ऑनलाइन धोखाधड़ी से सुरक्षा के लिए आपका डिजिटल साथी।",
        checkBeforeClick: "पुष्टि नहीं है? क्लिक करने से पहले जांचें।",
        checkLink: "लिंक जांचें",
        checkMessage: "संदेश जांचें",
        checkPhone: "फोन नंबर जांचें",
        checkMedia: "मीडिया जांचें",
        talkAssistant: "साइबरसारथी से बात करें",
        emergencyHelp: "मुझे धोखाधड़ी का अंदेशा है",
        lowRisk: "सुरक्षित होने की संभावना",
        suspicious: "सावधानी बरतें",
        highRisk: "तुरंत कार्रवाई करें",
        disclaimerText: "यह मूल्यांकन मार्गदर्शन प्रदान करता है और सटीकता की गारंटी नहीं है।",
        reportScam: "धोखाधड़ी की रिपोर्ट करें",
        elderModeLabel: "बुजुर्ग मोड",
        callHelpline: "साइबरसारथी को कॉल करें"
    }
};

let currentLang = 'en';

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLang = lang;
    const t = translations[lang];

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) {
            el.innerText = t[key];
        }
    });
}
