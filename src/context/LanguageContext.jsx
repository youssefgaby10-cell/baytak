
import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext(null);

const translations = {
  ar: {
    direction: "rtl",
    languageName: "العربية",

    // General
    home: "الرئيسية",
    search: "البحث",
    settings: "الإعدادات",
    account: "الحساب",
    application: "التطبيق",
    profile: "الملف الشخصي",
    myAccount: "حسابي",
    myProperties: "عقاراتي",
    addProperty: "إضافة عقار",
    searchForProperty: "البحث عن عقار",
    myRequests: "طلباتي",
    favorites: "المفضلة",
    favorite: "المفضلة",
    property: "عقار",
    properties: "العقارات",
    save: "حفظ",
    saveChanges: "حفظ التعديلات",
    cancel: "إلغاء",
    back: "رجوع",
    next: "التالي",
    close: "إغلاق",
    edit: "تعديل",
    delete: "حذف",
    confirm: "تأكيد",
    loading: "جارٍ التحميل...",
    requiredFields: "لازم تملأ جميع البيانات المطلوبة.",
    savedSuccessfully: "تم حفظ التعديلات بنجاح.",
    generalTryAgain: "حدث خطأ. حاول مرة أخرى.",
    somethingWentWrongTryAgain: "حدث خطأ. حاول مرة أخرى.",

    // Account and settings
    editProfile: "تعديل الملف الشخصي",
    changePassword: "تغيير كلمة المرور",
    changePhone: "تغيير رقم الهاتف",
    changeEmail: "تغيير البريد الإلكتروني",
    language: "اللغة",
    arabic: "العربية",
    english: "English",
    notifications: "الإشعارات",
    darkMode: "الوضع الليلي",
    help: "المساعدة",
    privacyPolicy: "سياسة الخصوصية",
    contactUs: "تواصل معنا",
    aboutApp: "عن التطبيق",
    logout: "تسجيل الخروج",
    confirmLogout: "هل أنت متأكد أنك تريد تسجيل الخروج؟",
    accountType: "نوع الحساب",
    owner: "مالك",
    tenant: "مستأجر",

    // Login
    login: "تسجيل الدخول",
    welcomeBack: "أهلاً بعودتك! سجّل دخولك للمتابعة.",
    premiumRealEstate: "عقارات مصر المتميزة",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    emailRequired: "البريد الإلكتروني مطلوب.",
    passwordRequired: "كلمة المرور مطلوبة.",
    chooseAccountType: "من فضلك اختر مالك أو مستأجر.",
    noAccountFound: "لم يتم العثور على حساب. أنشئ حسابًا أولًا.",
    registerAgain: "حدث خطأ. من فضلك سجّل حسابك مرة أخرى.",
    incorrectCredentials: "البريد الإلكتروني أو كلمة المرور غير صحيحة.",
    registeredAs: "هذا الحساب مسجل بصفة",
    staySignedIn: "تذكر تسجيل الدخول",
    forgotPassword: "نسيت كلمة المرور؟",
    orContinueWith: "أو المتابعة باستخدام",
    chooseAccount: "اختر نوع الحساب",
    tenantDescription: "ابحث عن الشقق والمنازل والعقارات.",
    ownerDescription: "انشر إعلانات عقاراتك وأدرها.",
    noAccount: "ليس لديك حساب؟",
    signUp: "إنشاء حساب",

    // Register
    register: "إنشاء حساب",
    fullName: "الاسم الكامل",
    fullNamePlaceholder: "أدخل اسمك بالكامل",
    phoneNumber: "رقم الهاتف",
    confirmPassword: "تأكيد كلمة المرور",
    confirmPasswordRequired: "تأكيد كلمة المرور مطلوب.",
    passwordsDoNotMatch: "كلمتا المرور غير متطابقتين.",
    emailAlreadyRegistered: "هذا البريد الإلكتروني مسجل بالفعل.",
    accountCreatedSuccessfully: "تم إنشاء الحساب بنجاح!",
    createAccount: "إنشاء الحساب",
    termsAgreement: "أوافق على",
    termsOfService: "شروط الخدمة",
    and: "و",
    alreadyHaveAccount: "لديك حساب بالفعل؟",
    fullNameRequired: "الاسم الكامل مطلوب.",
    phoneRequired: "رقم الهاتف مطلوب.",

    // Forgot password
    enterEmailForVerification:
      "أدخل البريد الإلكتروني المرتبط بحسابك وسنرسل لك رمز التحقق.",
    enterEmailAddress: "من فضلك أدخل بريدك الإلكتروني.",
    emailNotRegistered: "هذا البريد الإلكتروني غير مسجل.",
    verifying: "جارٍ التحقق...",
    sendVerificationCode: "إرسال رمز التحقق",
    backToLogin: "العودة إلى تسجيل الدخول",

    // OTP verification
    verifyAccount: "التحقق من الحساب",
    enterSixDigitCode:
      "أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى بريدك الإلكتروني.",
    verificationCode: "رمز التحقق",
    enterVerificationCode: "من فضلك أدخل رمز التحقق.",
    verificationCodeSixDigits: "يجب أن يتكون رمز التحقق من 6 أرقام.",
    verificationCodeExpired: "انتهت صلاحية رمز التحقق. اطلب رمزًا جديدًا.",
    incorrectVerificationCode: "رمز التحقق غير صحيح. حاول مرة أخرى.",
    confirmCode: "تأكيد الرمز",
    resendCode: "إعادة إرسال الرمز",

    // Reset password
    resetPassword: "إعادة تعيين كلمة المرور",
    createNewPassword: "أنشئ كلمة مرور جديدة لحسابك.",
    newPassword: "كلمة المرور الجديدة",
    passwordRequirementsHeading: "يجب أن تحتوي كلمة المرور على:",
    minimumEightCharacters: "8 أحرف على الأقل",
    uppercaseRequirement: "حرف إنجليزي كبير (A-Z)",
    lowercaseRequirement: "حرف إنجليزي صغير (a-z)",
    numberRequirement: "رقم واحد على الأقل (0-9)",
    specialCharacterRequirement: "رمز خاص مثل @ # $",
    passwordMustMeetRequirements:
      "يجب أن تستوفي كلمة المرور جميع الشروط.",
    accountNotFoundRegisterAgain:
      "لم يتم العثور على الحساب. سجّل حسابك مرة أخرى.",
    resetPasswordButton: "إعادة تعيين كلمة المرور",

    // Password changed
    passwordChangedSuccessfully: "تم تغيير كلمة المرور بنجاح",
    passwordUpdatedDescription:
      "تم تحديث كلمة المرور الخاصة بحسابك بنجاح. يمكنك الآن استخدام كلمة المرور الجديدة.",
    backToSettings: "العودة إلى الإعدادات",

    // Change password
    keepAccountSecure:
      "للحفاظ على أمان حسابك، اختر كلمة مرور قوية.",
    currentPassword: "كلمة المرور الحالية",
    currentPasswordNotFound: "لم يتم العثور على كلمة المرور الحالية.",
    currentPasswordIncorrect: "كلمة المرور الحالية غير صحيحة ❌",
    newPasswordRequirementsFailed:
      "كلمة المرور الجديدة لا تستوفي جميع الشروط.",
    passwordConfirmationMismatch: "تأكيد كلمة المرور غير مطابق ❌",
    passwordMatchSuccess: "كلمة المرور متطابقة ✓",
    savePassword: "حفظ كلمة المرور",

    // Change email
    updateEmail: "تحديث البريد الإلكتروني",
    enterNewEmailDescription:
      "يرجى إدخال بريدك الإلكتروني الجديد. سنرسل لك رمز تأكيد للتحقق.",
    currentEmail: "البريد الإلكتروني الحالي",
    newEmail: "البريد الإلكتروني الجديد",
    newEmailRequired: "لازم تدخل البريد الإلكتروني الجديد.",
    validEmailRequired: "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.",
    emailSameAsCurrent:
      "البريد الإلكتروني الجديد هو نفس البريد الحالي.",
    privacyProtection:
      "حماية خصوصيتك: نحن لا نشارك بياناتك مع أي طرف ثالث.",

    // Change phone
    enterNewPhoneDescription:
      "يرجى إدخال رقم هاتفك الجديد. سنرسل رمز تحقق للتأكيد.",
    currentPhone: "رقم الهاتف الحالي",
    newPhone: "رقم الهاتف الجديد",
    newPhoneRequired: "لازم تدخل رقم الهاتف الجديد.",
    validEgyptianPhoneRequired:
      "من فضلك أدخل رقم هاتف مصري صحيح.",
    phoneSameAsCurrent:
      "رقم الهاتف الجديد يجب أن يكون مختلفًا عن الرقم الحالي.",
    phoneSmsAvailability:
      "تأكد من أن الرقم الجديد متاح لاستقبال الرسائل النصية.",
    phonePrivacyTitle: "حماية خصوصيتك",
    phonePrivacyDescription:
      "نحن نستخدم رقم هاتفك فقط لأغراض التوثيق والتواصل بخصوص حسابك. لن يتم مشاركة رقمك مع أطراف ثالثة دون إذنك.",

    // Language page
    chooseAppLanguage: "اختر لغة التطبيق",
    chooseLanguageDescription:
      "اختر اللغة التي تريد استخدامها في تطبيق Baytak.",

    // Edit profile
    changePhoto: "تغيير الصورة",
    invalidImage: "من فضلك اختر صورة صحيحة.",
    saveProfileError:
      "حدث خطأ أثناء حفظ البيانات. حاول اختيار صورة أصغر أو مختلفة.",

    // Profile
    profilePicture: "الصورة الشخصية",
    changeProfilePicture: "تغيير الصورة الشخصية",
    chooseProfilePicture: "اختيار صورة شخصية",
    invalidImageFile: "من فضلك اختار ملف صورة صالح.",
    imageProcessingFailed: "تعذر معالجة الصورة.",
    imageSaveFailed: "تعذر حفظ الصورة. جرب صورة أصغر.",
    imageOpenFailed: "تعذر فتح الصورة المختارة.",

    // About app
    appVersion: "الإصدار",
    aboutWebsite: "نبذة عن الموقع",
    aboutWebsiteDescription:
      "منصة عقارية تساعد المستخدمين على البحث عن العقارات وشرائها أو استئجارها بسهولة، مع توفير أدوات بحث ذكية وتجربة استخدام بسيطة وسريعة.",
    developerInformation: "معلومات المطور",
    developerInformationDescription:
      "تم تطوير هذا المشروع باستخدام أحدث تقنيات تطوير الويب لتقديم تجربة استخدام احترافية وسريعة، مع التركيز على الأداء والأمان.",
    officialWebsite: "الموقع الرسمي",
    followUsSocial: "تابعنا على وسائل التواصل",
    appShareText: "اكتشف تطبيق Baytak للبحث عن العقارات بسهولة.",
    shareLinkCopied: "تم نسخ رابط التطبيق.",
    allRightsReserved: "جميع الحقوق محفوظة لشركة بيتك",

    // Contact us
    howCanWeHelp: "كيف يمكننا مساعدتك؟",
    supportAvailability:
      "فريقنا جاهز للرد على استفساراتك على مدار الساعة",
    sendUsMessage: "أرسل لنا رسالة",
    messageSubject: "عنوان الرسالة",
    yourMessage: "رسالتك",
    nameExamplePlaceholder: "مثال: أحمد محمد",
    propertyQuestionPlaceholder: "بخصوص أي عقار؟",
    messageDetailsPlaceholder: "اكتب تفاصيل استفسارك هنا...",
    sendMessage: "إرسال الرسالة",
    mainLocation: "موقعنا الرئيسي",
    openGoogleMaps: "اضغط لفتح الموقع على Google Maps",
    contactLocationAddress:
      "شارع المسيري، عند البسطة، أمام كنيسة مار يوحنا الحبيب",
    messageNameLabel: "الاسم",

    // Help
    howCanWeHelpIntro: "إزاي نقدر نساعدك؟",
    helpIntroDescription:
      "هنا هتلاقي إجابات على أهم الأسئلة الخاصة بتطبيق Baytak.",
    frequentlyAskedQuestions: "الأسئلة الشائعة",
    faqSearchPropertyQ: "إزاي أبحث عن عقار؟",
    faqSearchPropertyA:
      "من الصفحة الرئيسية تقدر تبحث عن العقار باستخدام البحث والفلاتر، وتحدد نوع العقار والموقع والسعر والمساحة.",
    faqAddFavoriteQ: "إزاي أضيف عقار للمفضلة؟",
    faqAddFavoriteA:
      "افتح تفاصيل العقار واضغط على علامة القلب لإضافته إلى قائمة المفضلة.",
    faqEditAccountQ: "إزاي أعدل بيانات حسابي؟",
    faqEditAccountA:
      "ادخل على الإعدادات ثم اختر تعديل الملف الشخصي، وبعدها عدّل البيانات واضغط حفظ التعديلات.",
    faqForgotPasswordQ: "نسيت كلمة المرور، أعمل إيه؟",
    faqForgotPasswordA:
      "من صفحة تسجيل الدخول اضغط على نسيت كلمة المرور، ثم اتبع خطوات التحقق وإعادة تعيين كلمة المرور.",
    faqChangeContactQ: "إزاي أغير رقم الهاتف أو البريد الإلكتروني؟",
    faqChangeContactA:
      "من الإعدادات اختر تغيير رقم الهاتف أو تغيير البريد الإلكتروني، ثم أدخل البيانات الجديدة واتبع خطوات التأكيد.",
    faqContactSupportQ: "إزاي أتواصل مع الدعم؟",
    faqContactSupportA:
      "يمكنك التواصل مع فريق الدعم من خلال قسم تواصل معنا الموجود في الإعدادات.",

    // Privacy policy
    privacyIntroTitle: "خصوصيتك تهمنا",
    privacyIntroDescription:
      "في Baytak نحرص على حماية بياناتك والحفاظ على خصوصيتك أثناء استخدام التطبيق.",
    privacyInfoCollectedTitle: "المعلومات التي نجمعها",
    privacyInfoCollectedDescription:
      "قد يقوم تطبيق Baytak بحفظ بعض المعلومات التي تدخلها أثناء إنشاء الحساب أو استخدام التطبيق، مثل الاسم ورقم الهاتف والبريد الإلكتروني ونوع الحساب.",
    privacyInfoUsageTitle: "استخدام المعلومات",
    privacyInfoUsageDescription:
      "نستخدم المعلومات الخاصة بك لتوفير خدمات التطبيق وتحسين تجربة الاستخدام وتسهيل الوصول إلى الخصائص المختلفة داخل Baytak.",
    privacyDataProtectionTitle: "حماية بياناتك",
    privacyDataProtectionDescription:
      "نحن نهتم بالحفاظ على بيانات المستخدم وعدم مشاركتها مع الآخرين إلا في الحالات التي تكون ضرورية لتقديم الخدمة أو مطلوبة بموجب القانون.",
    privacyLoginDataTitle: "بيانات تسجيل الدخول",
    privacyLoginDataDescription:
      "يجب على المستخدم الحفاظ على سرية بيانات تسجيل الدخول الخاصة به وعدم مشاركتها مع أي شخص آخر.",
    privacyPolicyUpdatesTitle: "التعديلات على سياسة الخصوصية",
    privacyPolicyUpdatesDescription:
      "قد يتم تحديث سياسة الخصوصية من وقت لآخر لتحسين التطبيق أو إضافة خدمات جديدة. سيتم عرض النسخة المحدثة داخل التطبيق.",
    privacyContactTitle: "التواصل معنا",
    privacyContactDescription:
      'إذا كان لديك أي سؤال أو استفسار متعلق بالخصوصية، يمكنك التواصل معنا من خلال قسم "تواصل معنا" داخل التطبيق.',
    lastUpdated: "آخر تحديث: 2026",

    // Home header
    username: "اسم المستخدم",
    goodMorning: "صباح الخير",

    // Filters and categories
    forRent: "للإيجار",
    forSale: "للبيع",
    categories: "الفئات",
    seeAll: "عرض الكل",
    residential: "سكني",
    commercial: "تجاري",
    retail: "تجزئة/محلات",
    industrial: "صناعي",
    vacation: "مصايف/عطلات",
    land: "أراضٍ",

    // Recommendations and featured properties
    recommended: "موصى به",
    noPropertiesAvailable: "لا توجد عقارات متاحة حاليًا.",
    featuredProperty: "عقار مميز",
    beds: "غرف نوم",
    baths: "حمامات",
    viewDetails: "عرض التفاصيل",
    profileAlt: "الملف الشخصي",

    // Search
    voiceSearchUnsupported: "المتصفح لا يدعم البحث الصوتي",
    voiceSearch: "البحث الصوتي",
    searchPlaceholder: "ابحث عن أي عقار...",
    listingTypeMatches: "نوع العرض مطابق",
    propertyType: "نوع العقار",
    location: "الموقع",
    priceWithinMax: "السعر داخل الحد الأقصى",
    priceWithinMin: "السعر داخل الحد الأدنى",
    roomsLabel: "غرف",
    bathroomsLabel: "حمام",
    areaLabel: "المساحة",
    areaWithinMax: "المساحة داخل الحد الأقصى",
    matchingPropertiesFound: "تم العثور على عقارات مطابقة",

    // Search preferences
    familyFriendly: "مناسبة للعائلة",
    quietArea: "منطقة هادئة",
    nearSchools: "قريبة من المدارس",
    nearHospitals: "قريبة من المستشفيات",
    nearClinics: "قريبة من العيادات والمراكز الطبية",
    nearUniversities: "قريبة من الجامعات",
    nearTransportation: "قريبة من المواصلات",
    nearMalls: "قريبة من المولات",
    nearRestaurants: "قريبة من المطاعم",
    nearPharmacies: "قريبة من الصيدليات",
    nearServices: "قريبة من الخدمات",
    nearMainRoads: "قريبة من الطرق والمحاور الرئيسية",
    nearParks: "قريبة من الحدائق والمساحات الخضراء",
    nearClub: "قريبة من النادي",
    securityGuards: "أمن وحراسة",
    parkingAvailable: "يتوفر جراج أو موقف سيارة",
    elevatorAvailable: "يوجد أسانسير",
    independentElectricityMeter: "عداد كهرباء مستقل",
    independentWaterMeter: "عداد مياه مستقل",
    gasMeter: "عداد غاز أو غاز طبيعي",
    modernFinish: "تشطيب حديث",
    furnished: "مفروشة أو مجهزة",
    airConditioning: "يوجد تكييف",
    garden: "حديقة",
    pool: "حمام سباحة",
    balcony: "بلكونة أو تراس",
    seaView: "إطلالة بحر",
    newBuilding: "مبنى جديد",
    spaciousReception: "ريسبشن واسع",
    largeKitchen: "مطبخ كبير",
    matchNo: "🔴 غير مطابق",
    matchExcellent: "🟢 مطابق جدًا",
    matchPartial: "🟡 مطابق جزئيًا",

    // Favorites
    backToHome: "العودة إلى الرئيسية",
    emptyFavorites: "😔 لا توجد عقارات محفوظة",
    emptyFavoritesHint: "ابدأ بإضافة العقارات إلى المفضلة ❤️",
    youHave: "لديك",
    savedPropertiesCount: "عقار محفوظ",
  },

  en: {
    direction: "ltr",
    languageName: "English",

    // General
    home: "Home",
    search: "Search",
    settings: "Settings",
    account: "Account",
    application: "Application",
    profile: "Profile",
    myAccount: "My Account",
    myProperties: "My Properties",
    addProperty: "Add Property",
    searchForProperty: "Search for Property",
    myRequests: "My Requests",
    favorites: "Favorites",
    favorite: "Favorites",
    property: "Property",
    properties: "Properties",
    save: "Save",
    saveChanges: "Save Changes",
    cancel: "Cancel",
    back: "Back",
    next: "Next",
    close: "Close",
    edit: "Edit",
    delete: "Delete",
    confirm: "Confirm",
    loading: "Loading...",
    requiredFields: "Please fill in all required fields.",
    savedSuccessfully: "Changes saved successfully.",
    generalTryAgain: "Something went wrong. Please try again.",
    somethingWentWrongTryAgain: "Something went wrong. Please try again.",

    // Account and settings
    editProfile: "Edit Profile",
    changePassword: "Change Password",
    changePhone: "Change Phone Number",
    changeEmail: "Change Email",
    language: "Language",
    arabic: "Arabic",
    english: "English",
    notifications: "Notifications",
    darkMode: "Dark Mode",
    help: "Help",
    privacyPolicy: "Privacy Policy",
    contactUs: "Contact Us",
    aboutApp: "About App",
    logout: "Log Out",
    confirmLogout: "Are you sure you want to log out?",
    accountType: "Account Type",
    owner: "Owner",
    tenant: "Tenant",

    // Login
    login: "Login",
    welcomeBack: "Welcome back! Please login to continue.",
    premiumRealEstate: "Premium Egyptian Real Estate",
    email: "Email",
    password: "Password",
    emailRequired: "Email is required.",
    passwordRequired: "Password is required.",
    chooseAccountType: "Please choose Owner or Tenant.",
    noAccountFound: "No account found. Please create an account first.",
    registerAgain: "Something went wrong. Please register again.",
    incorrectCredentials: "Email or password is incorrect.",
    registeredAs: "This account is registered as",
    staySignedIn: "Stay signed in",
    forgotPassword: "Forgot Password?",
    orContinueWith: "OR CONTINUE WITH",
    chooseAccount: "Choose Account Type",
    tenantDescription: "Search for apartments, houses and properties.",
    ownerDescription: "Publish and manage your property listings.",
    noAccount: "Don't have an account?",
    signUp: "Sign Up",

    // Register
    register: "Register",
    fullName: "Full Name",
    fullNamePlaceholder: "Enter your full name",
    phoneNumber: "Phone Number",
    confirmPassword: "Confirm Password",
    confirmPasswordRequired: "Confirm Password is required.",
    passwordsDoNotMatch: "Passwords do not match.",
    emailAlreadyRegistered: "This email is already registered.",
    accountCreatedSuccessfully: "Account Created Successfully!",
    createAccount: "Create Account",
    termsAgreement: "I agree to the",
    termsOfService: "Terms of Service",
    and: "and",
    alreadyHaveAccount: "Already have an account?",
    fullNameRequired: "Full name is required.",
    phoneRequired: "Phone number is required.",

    // Forgot password
    enterEmailForVerification:
      "Enter the email address associated with your account and we'll send you a verification code.",
    enterEmailAddress: "Please enter your email address.",
    emailNotRegistered: "This email is not registered.",
    verifying: "Verifying...",
    sendVerificationCode: "Send Verification Code",
    backToLogin: "Back to Login",

    // OTP verification
    verifyAccount: "Verify Account",
    enterSixDigitCode:
      "Enter the 6-digit verification code sent to your email.",
    verificationCode: "Verification Code",
    enterVerificationCode: "Please enter the verification code.",
    verificationCodeSixDigits:
      "The verification code must contain 6 digits.",
    verificationCodeExpired:
      "The verification code has expired. Please request a new code.",
    incorrectVerificationCode:
      "Incorrect verification code. Please try again.",
    confirmCode: "Verify Code",
    resendCode: "Resend Code",

    // Reset password
    resetPassword: "Reset Password",
    createNewPassword: "Create a new password for your account.",
    newPassword: "New Password",
    passwordRequirementsHeading: "Password must contain:",
    minimumEightCharacters: "At least 8 characters",
    uppercaseRequirement: "An uppercase letter (A-Z)",
    lowercaseRequirement: "A lowercase letter (a-z)",
    numberRequirement: "At least one number (0-9)",
    specialCharacterRequirement: "A special character such as @ # $",
    passwordMustMeetRequirements:
      "Password must meet all the requirements.",
    accountNotFoundRegisterAgain:
      "Account not found. Please register again.",
    resetPasswordButton: "Reset Password",

    // Password changed
    passwordChangedSuccessfully: "Password Changed Successfully",
    passwordUpdatedDescription:
      "Your account password has been updated successfully. You can now use your new password.",
    backToSettings: "Back to Settings",

    // Change password
    keepAccountSecure:
      "To keep your account secure, choose a strong password.",
    currentPassword: "Current Password",
    currentPasswordNotFound: "Current password was not found.",
    currentPasswordIncorrect: "Current password is incorrect ❌",
    newPasswordRequirementsFailed:
      "The new password does not meet all requirements.",
    passwordConfirmationMismatch:
      "Password confirmation does not match ❌",
    passwordMatchSuccess: "Passwords match ✓",
    savePassword: "Save Password",

    // Change email
    updateEmail: "Update Email",
    enterNewEmailDescription:
      "Please enter your new email address. We will send you a verification code.",
    currentEmail: "Current Email",
    newEmail: "New Email",
    newEmailRequired: "Please enter the new email address.",
    validEmailRequired: "Please enter a valid email address.",
    emailSameAsCurrent: "The new email is the same as the current email.",
    privacyProtection:
      "Protecting your privacy: we do not share your data with any third party.",

    // Change phone
    enterNewPhoneDescription:
      "Please enter your new phone number. We will send a verification code to confirm it.",
    currentPhone: "Current Phone Number",
    newPhone: "New Phone Number",
    newPhoneRequired: "Please enter the new phone number.",
    validEgyptianPhoneRequired:
      "Please enter a valid Egyptian phone number.",
    phoneSameAsCurrent:
      "The new phone number must be different from the current number.",
    phoneSmsAvailability:
      "Make sure the new number can receive SMS messages.",
    phonePrivacyTitle: "Protecting Your Privacy",
    phonePrivacyDescription:
      "We use your phone number only for verification and account-related communication. Your number will not be shared with third parties without your permission.",

    // Language page
    chooseAppLanguage: "Choose App Language",
    chooseLanguageDescription:
      "Choose the language you want to use in Baytak.",

    // Edit profile
    changePhoto: "Change Photo",
    invalidImage: "Please select a valid image.",
    saveProfileError:
      "An error occurred while saving your data. Try choosing a smaller or different image.",

    // Profile
    profilePicture: "Profile Picture",
    changeProfilePicture: "Change Profile Picture",
    chooseProfilePicture: "Choose Profile Picture",
    invalidImageFile: "Please select a valid image file.",
    imageProcessingFailed: "Failed to process the image.",
    imageSaveFailed: "Could not save the image. Try a smaller image.",
    imageOpenFailed: "Could not open the selected image.",

    // About app
    appVersion: "Version",
    aboutWebsite: "About the Website",
    aboutWebsiteDescription:
      "A real estate platform that helps users easily search for properties to buy or rent, with smart search tools and a simple, fast user experience.",
    developerInformation: "Developer Information",
    developerInformationDescription:
      "This project was developed using modern web technologies to provide a professional, fast user experience, with a focus on performance and security.",
    officialWebsite: "Official Website",
    followUsSocial: "Follow us on social media",
    appShareText: "Discover the Baytak app and search for properties with ease.",
    shareLinkCopied: "App link copied.",
    allRightsReserved: "All rights reserved to Baytak",

    // Contact us
    howCanWeHelp: "How can we help you?",
    supportAvailability:
      "Our team is ready to answer your questions around the clock.",
    sendUsMessage: "Send Us a Message",
    messageSubject: "Message Subject",
    yourMessage: "Your Message",
    nameExamplePlaceholder: "Example: Ahmed Mohamed",
    propertyQuestionPlaceholder: "About which property?",
    messageDetailsPlaceholder: "Write the details of your inquiry here...",
    sendMessage: "Send Message",
    mainLocation: "Our Main Location",
    openGoogleMaps: "Tap to open the location in Google Maps",
    contactLocationAddress:
      "El-Mosairy Street, at El-Basta, in front of St. John the Beloved Church",
    messageNameLabel: "Name",

    // Help
    howCanWeHelpIntro: "How can we help you?",
    helpIntroDescription:
      "Here you'll find answers to the most common questions about the Baytak app.",
    frequentlyAskedQuestions: "Frequently Asked Questions",
    faqSearchPropertyQ: "How do I search for a property?",
    faqSearchPropertyA:
      "From the home page, you can search using search and filters and specify property type, location, price, and area.",
    faqAddFavoriteQ: "How do I add a property to favorites?",
    faqAddFavoriteA:
      "Open the property details and tap the heart icon to add it to your favorites.",
    faqEditAccountQ: "How do I edit my account details?",
    faqEditAccountA:
      "Go to Settings, select Edit Profile, update your details, then tap Save Changes.",
    faqForgotPasswordQ: "I forgot my password. What should I do?",
    faqForgotPasswordA:
      "On the login page, tap Forgot Password, then follow the verification and password reset steps.",
    faqChangeContactQ: "How do I change my phone number or email address?",
    faqChangeContactA:
      "In Settings, choose Change Phone Number or Change Email, enter the new details, and follow the confirmation steps.",
    faqContactSupportQ: "How do I contact support?",
    faqContactSupportA:
      "You can contact support through the Contact Us section in Settings.",

    // Privacy policy
    privacyIntroTitle: "Your Privacy Matters",
    privacyIntroDescription:
      "At Baytak, we are committed to protecting your data and privacy while you use the app.",
    privacyInfoCollectedTitle: "Information We Collect",
    privacyInfoCollectedDescription:
      "Baytak may store information you provide when creating an account or using the app, such as your name, phone number, email address, and account type.",
    privacyInfoUsageTitle: "How We Use Information",
    privacyInfoUsageDescription:
      "We use your information to provide app services, improve your experience, and make Baytak's features easier to access.",
    privacyDataProtectionTitle: "Data Protection",
    privacyDataProtectionDescription:
      "We protect user data and do not share it with others unless necessary to provide the service or required by law.",
    privacyLoginDataTitle: "Login Information",
    privacyLoginDataDescription:
      "Users must keep their login credentials confidential and must not share them with anyone else.",
    privacyPolicyUpdatesTitle: "Privacy Policy Updates",
    privacyPolicyUpdatesDescription:
      "The Privacy Policy may be updated from time to time to improve the app or add new services. The updated version will be displayed in the app.",
    privacyContactTitle: "Contact Us",
    privacyContactDescription:
      'If you have any questions or concerns about privacy, you can contact us through the "Contact Us" section in the app.',
    lastUpdated: "Last updated: 2026",

    // Home header
    username: "Username",
    goodMorning: "Good Morning",

    // Filters and categories
    forRent: "For Rent",
    forSale: "For Sale",
    categories: "Categories",
    seeAll: "See All",
    residential: "Residential",
    commercial: "Commercial",
    retail: "Retail",
    industrial: "Industrial",
    vacation: "Vacation",
    land: "Land",

    // Recommendations and featured properties
    recommended: "Recommended",
    noPropertiesAvailable: "No properties are currently available.",
    featuredProperty: "Featured Property",
    beds: "Beds",
    baths: "Baths",
    viewDetails: "View Details",
    profileAlt: "Profile",

    // Search
    voiceSearchUnsupported:
      "Your browser does not support voice search",
    voiceSearch: "Voice search",
    searchPlaceholder: "Search for any property...",
    listingTypeMatches: "Listing type matches",
    propertyType: "Property Type",
    location: "Location",
    priceWithinMax: "Price is within the maximum limit",
    priceWithinMin: "Price is within the minimum limit",
    roomsLabel: "rooms",
    bathroomsLabel: "bathrooms",
    areaLabel: "Area",
    areaWithinMax: "Area is within the maximum limit",
    matchingPropertiesFound: "Found matching properties",

    // Search preferences
    familyFriendly: "Family-friendly",
    quietArea: "Quiet area",
    nearSchools: "Near schools",
    nearHospitals: "Near hospitals",
    nearClinics: "Near clinics and medical centers",
    nearUniversities: "Near universities",
    nearTransportation: "Near public transportation",
    nearMalls: "Near malls",
    nearRestaurants: "Near restaurants",
    nearPharmacies: "Near pharmacies",
    nearServices: "Near services",
    nearMainRoads: "Near main roads and highways",
    nearParks: "Near parks and green spaces",
    nearClub: "Near a club",
    securityGuards: "Security and guards",
    parkingAvailable: "Parking available",
    elevatorAvailable: "Elevator available",
    independentElectricityMeter: "Independent electricity meter",
    independentWaterMeter: "Independent water meter",
    gasMeter: "Gas meter or natural gas",
    modernFinish: "Modern finish",
    furnished: "Furnished or fully equipped",
    airConditioning: "Air conditioning",
    garden: "Garden",
    pool: "Swimming pool",
    balcony: "Balcony or terrace",
    seaView: "Sea view",
    newBuilding: "New building",
    spaciousReception: "Spacious reception area",
    largeKitchen: "Large kitchen",
    matchNo: "🔴 No match",
    matchExcellent: "🟢 Excellent match",
    matchPartial: "🟡 Partial match",

    // Favorites
    backToHome: "Back to Home",
    emptyFavorites: "😔 No saved properties",
    emptyFavoritesHint: "Start adding properties to your favorites ❤️",
    youHave: "You have",
    savedPropertiesCount: "saved properties",
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem("baytakLanguage");
    return translations[savedLanguage] ? savedLanguage : "ar";
  });

  useEffect(() => {
    localStorage.setItem("baytakLanguage", language);

    document.documentElement.lang = language;
    document.documentElement.dir = translations[language].direction;
    document.body.dir = translations[language].direction;
  }, [language]);

  const changeLanguage = (newLanguage) => {
    if (!translations[newLanguage]) return;
    setLanguage(newLanguage);
  };

  const t = translations[language];

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }

  return context;
}
