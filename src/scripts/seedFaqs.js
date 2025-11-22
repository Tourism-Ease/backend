import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FAQModel from '../models/faq.model.js';

// Explicitly point to the project root .env
dotenv.config({ path: './config.env' });

async function seed() {
  const DB = process.env.DB_URI;

  if (!DB) {
    process.exit(1);
  }

  await mongoose.connect(DB);

  const faqs = [
    // English FAQs

    {
      question: 'Hello',
      answer: 'Hello! How can I assist you today?',
      tags: ['greeting', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Hi',
      answer: 'Hi there! How can I help you?',
      tags: ['greeting', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Hey',
      answer: 'Hey! How can I assist with your travel plans?',
      tags: ['greeting', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Good morning',
      answer: 'Good morning! How can I help you today?',
      tags: ['greeting', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Good evening',
      answer: 'Good evening! What can I help you with?',
      tags: ['greeting', 'conversation'],
      lang: 'en',
    },
    {
      question: 'How are you?',
      answer: "I'm doing great and ready to help you! What can I do for you?",
      tags: ['smalltalk', 'conversation'],
      lang: 'en',
    },
    {
      question: "How's it going?",
      answer: "I'm doing well! How can I assist you today?",
      tags: ['smalltalk', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Can you help me?',
      answer: 'Of course! Tell me what you need help with.',
      tags: ['help', 'conversation'],
      lang: 'en',
    },
    {
      question: 'What can you do?',
      answer:
        'I can help you explore destinations, browse packages, and answer questions about TourEase.',
      tags: ['info', 'conversation'],
      lang: 'en',
    },
    {
      question: 'Who are you?',
      answer: "I'm the TourEase Assistant — here to help you with all your travel questions!",
      tags: ['info', 'identity'],
      lang: 'en',
    },
    {
      question: 'What is TourEase?',
      answer:
        'TourEase is a travel platform that helps you explore destinations, book hotels, and find the best packages.',
      tags: ['info', 'tourEase'],
      lang: 'en',
    },
    {
      question: 'I need help planning a trip',
      answer: 'Sure! Tell me your destination and travel dates, and I’ll help you get started.',
      tags: ['planning', 'help'],
      lang: 'en',
    },
    {
      question: "I don't understand",
      answer: 'No problem! Could you repeat or clarify your question?',
      tags: ['help', 'clarification'],
      lang: 'en',
    },
    {
      question: 'Explain again',
      answer: "Sure! Let me know which part you'd like me to explain again.",
      tags: ['help', 'clarification'],
      lang: 'en',
    },

    {
      question: 'How do I book a trip?',
      answer:
        'Choose a package, pick dates, payment online, then you will get confirmation by email.',
      tags: ['booking', 'payment'],
      lang: 'en',
    },
    {
      question: 'Can I cancel my booking?',
      answer: 'Cancellations are allowed up to 48 hours before departure. Fees may apply.',
      tags: ['cancellation', 'refund'],
      lang: 'en',
    },
    {
      question: 'What does the package include?',
      answer:
        'Packages typically include accommodation and listed activities — check package details for specifics.',
      tags: ['inclusion'],
      lang: 'en',
    },
    {
      question: 'How can I change dates?',
      answer: 'Contact support or use your bookings page. Changes are subject to availability.',
      tags: ['change', 'modify'],
      lang: 'en',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept credit cards, debit cards, PayPal, and bank transfers.',
      tags: ['payment', 'methods'],
      lang: 'en',
    },
    {
      question: 'Is my payment secure?',
      answer: 'Yes, we use SSL encryption and comply with PCI standards for secure transactions.',
      tags: ['payment', 'security'],
      lang: 'en',
    },
    {
      question: 'How do I get a refund?',
      answer:
        'Refunds are processed within 7-10 business days after approval, depending on your payment method.',
      tags: ['refund', 'process'],
      lang: 'en',
    },
    {
      question: 'Can I book for multiple people?',
      answer: 'Yes, you can add multiple travelers during the booking process.',
      tags: ['booking', 'group'],
      lang: 'en',
    },
    {
      question: 'What if I need special accommodations?',
      answer: 'Please specify your needs during booking; we will do our best to accommodate.',
      tags: ['accessibility', 'special'],
      lang: 'en',
    },
    {
      question: 'How do I contact customer support?',
      answer: 'You can reach us via email at support@example.com or call our hotline.',
      tags: ['support', 'contact'],
      lang: 'en',
    },
    {
      question: 'Are there any hidden fees?',
      answer: 'No hidden fees; all costs are disclosed upfront in the package details.',
      tags: ['fees', 'transparency'],
      lang: 'en',
    },
    {
      question: 'Can I modify my itinerary?',
      answer:
        'Modifications are possible up to 72 hours before departure, subject to availability.',
      tags: ['itinerary', 'modify'],
      lang: 'en',
    },
    {
      question: 'What documents do I need for travel?',
      answer:
        'Typically, a valid passport and visa if required. Check destination-specific requirements.',
      tags: ['documents', 'travel'],
      lang: 'en',
    },
    {
      question: 'Do you offer travel insurance?',
      answer:
        'Yes, we recommend purchasing travel insurance for coverage against unforeseen events.',
      tags: ['insurance', 'coverage'],
      lang: 'en',
    },
    {
      question: 'How do I check my booking status?',
      answer: 'Log in to your account and view your bookings dashboard.',
      tags: ['booking', 'status'],
      lang: 'en',
    },
    {
      question: 'Can I book last-minute trips?',
      answer: 'Yes, we have last-minute deals available on our website.',
      tags: ['booking', 'last-minute'],
      lang: 'en',
    },
    {
      question: 'What is the cancellation fee?',
      answer: 'Cancellation fees vary by package; refer to the terms and conditions.',
      tags: ['cancellation', 'fee'],
      lang: 'en',
    },
    {
      question: 'Do you provide airport transfers?',
      answer: 'Airport transfers are included in select packages; otherwise, available as add-ons.',
      tags: ['transportation', 'transfers'],
      lang: 'en',
    },
    {
      question: 'How do I apply a discount code?',
      answer: 'Enter the code at checkout before payment.',
      tags: ['discount', 'promo'],
      lang: 'en',
    },
    {
      question: 'Can I book hotels separately?',
      answer: 'Yes, you can book hotels independently or as part of a package.',
      tags: ['hotel', 'booking'],
      lang: 'en',
    },
    {
      question: 'What are the check-in and check-out times?',
      answer: 'Standard check-in is 3 PM, check-out is 11 AM, but varies by hotel.',
      tags: ['hotel', 'check-in'],
      lang: 'en',
    },
    {
      question: 'Do hotels have Wi-Fi?',
      answer: 'Most hotels offer complimentary Wi-Fi; confirm in hotel details.',
      tags: ['hotel', 'amenities'],
      lang: 'en',
    },
    {
      question: 'Can I request a specific room type?',
      answer: 'Room requests are noted but not guaranteed; subject to availability.',
      tags: ['hotel', 'room'],
      lang: 'en',
    },
    {
      question: 'What transportation options are available?',
      answer: 'We offer flights, trains, buses, and car rentals depending on the destination.',
      tags: ['transportation', 'options'],
      lang: 'en',
    },
    {
      question: 'How do I book transportation?',
      answer: 'Transportation can be added during package booking or separately.',
      tags: ['transportation', 'booking'],
      lang: 'en',
    },
    {
      question: 'Are meals included?',
      answer: 'Meal inclusions vary; check package details for breakfast, lunch, etc.',
      tags: ['meals', 'inclusion'],
      lang: 'en',
    },
    {
      question: 'What if my flight is delayed?',
      answer: 'Contact our support team; we will assist with rebooking if needed.',
      tags: ['flight', 'delay'],
      lang: 'en',
    },
    {
      question: 'Can I travel with pets?',
      answer: 'Pet policies vary; some packages allow pets with prior notice.',
      tags: ['pets', 'travel'],
      lang: 'en',
    },
    {
      question: 'How do I get my tickets?',
      answer: 'Tickets are emailed after confirmation; digital versions available.',
      tags: ['tickets', 'delivery'],
      lang: 'en',
    },
    {
      question: 'What is your privacy policy?',
      answer: 'We protect your data as per our privacy policy; no sharing without consent.',
      tags: ['privacy', 'policy'],
      lang: 'en',
    },
    {
      question: 'Do you have a mobile app?',
      answer: 'Yes, download our app for easy booking on the go.',
      tags: ['app', 'mobile'],
      lang: 'en',
    },
    {
      question: 'How do I reset my password?',
      answer: 'Use the forgot password link on the login page.',
      tags: ['account', 'password'],
      lang: 'en',
    },
    {
      question: 'Can I book for children?',
      answer: 'Yes, child rates apply; specify ages during booking.',
      tags: ['booking', 'children'],
      lang: 'en',
    },
    {
      question: 'What currencies do you accept?',
      answer: 'We accept multiple currencies; conversion rates apply.',
      tags: ['payment', 'currency'],
      lang: 'en',
    },
    {
      question: 'How do I leave a review?',
      answer: 'After your trip, access the review section in your account.',
      tags: ['review', 'feedback'],
      lang: 'en',
    },
    {
      question: 'Are there group discounts?',
      answer: 'Yes, discounts available for groups of 10 or more.',
      tags: ['discount', 'group'],
      lang: 'en',
    },
    {
      question: 'What if I have dietary restrictions?',
      answer: 'Inform us in advance; we will accommodate where possible.',
      tags: ['dietary', 'restrictions'],
      lang: 'en',
    },
    {
      question: 'How do I cancel transportation only?',
      answer: 'Contact support; cancellation policies for transport apply.',
      tags: ['transportation', 'cancel'],
      lang: 'en',
    },
    {
      question: 'Can I extend my stay?',
      answer: 'Extensions are possible subject to hotel availability.',
      tags: ['hotel', 'extend'],
      lang: 'en',
    },
    {
      question: 'What is the baggage allowance?',
      answer: 'Check airline policies; standard allowances apply.',
      tags: ['baggage', 'allowance'],
      lang: 'en',
    },
    {
      question: 'Do you offer guided tours?',
      answer: 'Guided tours are available as add-ons in select packages.',
      tags: ['tours', 'guided'],
      lang: 'en',
    },
    {
      question: 'How do I get a receipt?',
      answer: 'Receipts are emailed automatically after payment.',
      tags: ['receipt', 'payment'],
      lang: 'en',
    },
    {
      question: 'Can I book international trips?',
      answer: 'Yes, we offer trips worldwide.',
      tags: ['international', 'travel'],
      lang: 'en',
    },
    {
      question: 'What if I miss my flight?',
      answer: 'Contact us immediately; rebooking fees may apply.',
      tags: ['flight', 'missed'],
      lang: 'en',
    },
    {
      question: 'Are there age restrictions?',
      answer: 'No strict age limits, but some activities have minimum ages.',
      tags: ['age', 'restrictions'],
      lang: 'en',
    },
    {
      question: 'How do I update my profile?',
      answer: 'Log in and edit your profile information.',
      tags: ['profile', 'update'],
      lang: 'en',
    },
    {
      question: 'Do you have loyalty programs?',
      answer: 'Yes, earn points on bookings for future discounts.',
      tags: ['loyalty', 'program'],
      lang: 'en',
    },
    {
      question: 'What if the weather affects my trip?',
      answer: 'We monitor weather; cancellations possible with refunds.',
      tags: ['weather', 'cancellation'],
      lang: 'en',
    },
    {
      question: 'Can I book for seniors?',
      answer: 'Yes, senior discounts available.',
      tags: ['senior', 'discount'],
      lang: 'en',
    },
    {
      question: 'How do I track my booking?',
      answer: 'Use the tracking link in your confirmation email.',
      tags: ['booking', 'track'],
      lang: 'en',
    },
    // Arabic FAQs
    {
      question: 'كيف أحجز رحلة؟',
      answer:
        'اختر باقة، حدد التواريخ، ادفع عبر الإنترنت، ثم ستتلقى تأكيدًا عبر البريد الإلكتروني.',
      tags: ['booking', 'payment'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني إلغاء الحجز؟',
      answer: 'يُسمح بالإلغاء حتى 48 ساعة قبل المغادرة. قد تطبق رسوم.',
      tags: ['cancellation', 'refund'],
      lang: 'ar',
    },
    {
      question: 'ما الذي تشمله الباقة؟',
      answer: 'تشمل الباقات عادةً الإقامة والأنشطة المدرجة — تحقق من تفاصيل الباقة للتفاصيل.',
      tags: ['inclusion'],
      lang: 'ar',
    },
    {
      question: 'كيف يمكنني تغيير التواريخ؟',
      answer: 'اتصل بالدعم أو استخدم صفحة الحجوزات. التغييرات تخضع للتوفر.',
      tags: ['change', 'modify'],
      lang: 'ar',
    },
    {
      question: 'ما هي سياسة الإلغاء؟',
      answer: 'يمكنك الإلغاء قبل 48 ساعة من الرحلة لاسترداد المبلغ بعد خصم الرسوم.',
      tags: ['cancel', 'policy'],
      lang: 'ar',
    },
    {
      question: 'ما طرق الدفع التي تقبلونها؟',
      answer: 'نقبل بطاقات الائتمان، بطاقات الخصم، PayPal، والتحويلات البنكية.',
      tags: ['payment', 'methods'],
      lang: 'ar',
    },
    {
      question: 'هل دفعي آمن؟',
      answer: 'نعم، نستخدم تشفير SSL ونتوافق مع معايير PCI للمعاملات الآمنة.',
      tags: ['payment', 'security'],
      lang: 'ar',
    },
    {
      question: 'كيف أحصل على استرداد؟',
      answer: 'يتم معالجة الاستردادات خلال 7-10 أيام عمل بعد الموافقة، حسب طريقة الدفع.',
      tags: ['refund', 'process'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني الحجز لعدة أشخاص؟',
      answer: 'نعم، يمكنك إضافة مسافرين متعددين أثناء عملية الحجز.',
      tags: ['booking', 'group'],
      lang: 'ar',
    },
    {
      question: 'ماذا لو احتجت إلى ترتيبات خاصة؟',
      answer: 'يرجى تحديد احتياجاتك أثناء الحجز؛ سنبذل قصارى جهدنا لتلبيتها.',
      tags: ['accessibility', 'special'],
      lang: 'ar',
    },
    {
      question: 'كيف أتصل بدعم العملاء؟',
      answer:
        'يمكنك الوصول إلينا عبر البريد الإلكتروني support@example.com أو الاتصال بخط المساعدة.',
      tags: ['support', 'contact'],
      lang: 'ar',
    },
    {
      question: 'هل هناك رسوم مخفية؟',
      answer: 'لا توجد رسوم مخفية؛ جميع التكاليف مكشوفة مسبقًا في تفاصيل الباقة.',
      tags: ['fees', 'transparency'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني تعديل خط سير الرحلة؟',
      answer: 'التعديلات ممكنة حتى 72 ساعة قبل المغادرة، حسب التوفر.',
      tags: ['itinerary', 'modify'],
      lang: 'ar',
    },
    {
      question: 'ما الوثائق التي أحتاجها للسفر؟',
      answer: 'عادةً جواز سفر صالح وتأشيرة إذا لزم الأمر. تحقق من متطلبات الوجهة المحددة.',
      tags: ['documents', 'travel'],
      lang: 'ar',
    },
    {
      question: 'هل تقدمون تأمين سفر؟',
      answer: 'نعم، نوصي بشراء تأمين السفر للتغطية ضد الأحداث غير المتوقعة.',
      tags: ['insurance', 'coverage'],
      lang: 'ar',
    },
    {
      question: 'كيف أتحقق من حالة حجزي؟',
      answer: 'سجل الدخول إلى حسابك وعرض لوحة الحجوزات.',
      tags: ['booking', 'status'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني الحجز لرحلات في اللحظة الأخيرة؟',
      answer: 'نعم، لدينا عروض في اللحظة الأخيرة متاحة على موقعنا.',
      tags: ['booking', 'last-minute'],
      lang: 'ar',
    },
    {
      question: 'ما هي رسوم الإلغاء؟',
      answer: 'تختلف رسوم الإلغاء حسب الباقة؛ راجع الشروط والأحكام.',
      tags: ['cancellation', 'fee'],
      lang: 'ar',
    },
    {
      question: 'هل تقدمون نقل المطار؟',
      answer: 'نقل المطار مشمول في بعض الباقات؛ وإلا متاح كإضافات.',
      tags: ['transportation', 'transfers'],
      lang: 'ar',
    },
    {
      question: 'كيف أطبق رمز الخصم؟',
      answer: 'أدخل الرمز في صفحة الدفع قبل الدفع.',
      tags: ['discount', 'promo'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني حجز الفنادق بشكل منفصل؟',
      answer: 'نعم، يمكنك حجز الفنادق بشكل مستقل أو كجزء من باقة.',
      tags: ['hotel', 'booking'],
      lang: 'ar',
    },
    {
      question: 'ما أوقات الوصول والمغادرة؟',
      answer:
        'الوصول القياسي في الساعة 3 مساءً، المغادرة في الساعة 11 صباحًا، لكنها تختلف حسب الفندق.',
      tags: ['hotel', 'check-in'],
      lang: 'ar',
    },
    {
      question: 'هل الفنادق لديها Wi-Fi؟',
      answer: 'معظم الفنادق تقدم Wi-Fi مجاني؛ تأكد في تفاصيل الفندق.',
      tags: ['hotel', 'amenities'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني طلب نوع غرفة محدد؟',
      answer: 'طلبات الغرف مسجلة لكن غير مضمونة؛ حسب التوفر.',
      tags: ['hotel', 'room'],
      lang: 'ar',
    },
    {
      question: 'ما خيارات النقل المتاحة؟',
      answer: 'نقدم رحلات جوية، قطارات، حافلات، وتأجير سيارات حسب الوجهة.',
      tags: ['transportation', 'options'],
      lang: 'ar',
    },
    {
      question: 'كيف أحجز النقل؟',
      answer: 'يمكن إضافة النقل أثناء حجز الباقة أو بشكل منفصل.',
      tags: ['transportation', 'booking'],
      lang: 'ar',
    },
    {
      question: 'هل الوجبات مشمولة؟',
      answer: 'تختلف شمول الوجبات؛ تحقق من تفاصيل الباقة للإفطار، الغداء، إلخ.',
      tags: ['meals', 'inclusion'],
      lang: 'ar',
    },
    {
      question: 'ماذا لو تأخر رحلتي الجوية؟',
      answer: 'اتصل بفريق الدعم؛ سنساعد في إعادة الحجز إذا لزم الأمر.',
      tags: ['flight', 'delay'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني السفر مع الحيوانات الأليفة؟',
      answer: 'تختلف سياسات الحيوانات الأليفة؛ بعض الباقات تسمح بها مع إشعار مسبق.',
      tags: ['pets', 'travel'],
      lang: 'ar',
    },
    {
      question: 'كيف أحصل على تذاكري؟',
      answer: 'يتم إرسال التذاكر عبر البريد الإلكتروني بعد التأكيد؛ نسخ رقمية متاحة.',
      tags: ['tickets', 'delivery'],
      lang: 'ar',
    },
    {
      question: 'ما هي سياسة الخصوصية؟',
      answer: 'نحمي بياناتك وفقًا لسياسة الخصوصية؛ لا مشاركة بدون موافقة.',
      tags: ['privacy', 'policy'],
      lang: 'ar',
    },
    {
      question: 'هل لديكم تطبيق جوال؟',
      answer: 'نعم، قم بتنزيل تطبيقنا للحجز السهل أثناء التنقل.',
      tags: ['app', 'mobile'],
      lang: 'ar',
    },
    {
      question: 'كيف أعيد تعيين كلمة المرور؟',
      answer: 'استخدم رابط نسيت كلمة المرور في صفحة تسجيل الدخول.',
      tags: ['account', 'password'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني الحجز للأطفال؟',
      answer: 'نعم، تطبق أسعار الأطفال؛ حدد الأعمار أثناء الحجز.',
      tags: ['booking', 'children'],
      lang: 'ar',
    },
    {
      question: 'ما العملات التي تقبلونها؟',
      answer: 'نقبل عملات متعددة؛ تطبق معدلات التحويل.',
      tags: ['payment', 'currency'],
      lang: 'ar',
    },
    {
      question: 'كيف أترك تقييمًا؟',
      answer: 'بعد رحلتك، قم بالوصول إلى قسم التقييم في حسابك.',
      tags: ['review', 'feedback'],
      lang: 'ar',
    },
    {
      question: 'هل هناك خصومات للمجموعات؟',
      answer: 'نعم، خصومات متاحة للمجموعات من 10 أشخاص أو أكثر.',
      tags: ['discount', 'group'],
      lang: 'ar',
    },
    {
      question: 'ماذا لو كان لدي قيود غذائية؟',
      answer: 'أخبرنا مسبقًا؛ سنرتب حيث أمكن.',
      tags: ['dietary', 'restrictions'],
      lang: 'ar',
    },
    {
      question: 'كيف ألغي النقل فقط؟',
      answer: 'اتصل بالدعم؛ تطبق سياسات الإلغاء للنقل.',
      tags: ['transportation', 'cancel'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني تمديد إقامتي؟',
      answer: 'التمديدات ممكنة حسب توفر الفندق.',
      tags: ['hotel', 'extend'],
      lang: 'ar',
    },
    {
      question: 'ما هو حد الأمتعة؟',
      answer: 'تحقق من سياسات الشركة الجوية؛ الحدود القياسية تنطبق.',
      tags: ['baggage', 'allowance'],
      lang: 'ar',
    },
    {
      question: 'هل تقدمون جولات موجهة؟',
      answer: 'الجولات الموجهة متاحة كإضافات في بعض الباقات.',
      tags: ['tours', 'guided'],
      lang: 'ar',
    },
    {
      question: 'كيف أحصل على إيصال؟',
      answer: 'يتم إرسال الإيصالات تلقائيًا عبر البريد الإلكتروني بعد الدفع.',
      tags: ['receipt', 'payment'],
      lang: 'ar',
    },
    {
      question: 'هل يمكنني الحجز لرحلات دولية؟',
      answer: 'نعم، نقدم رحلات حول العالم.',
      tags: ['international', 'travel'],
      lang: 'ar',
    },
    {
      question: 'ماذا لو فاتني رحلتي؟',
      answer: 'اتصل بنا فورًا؛ قد تطبق رسوم إعادة الحجز.',
      tags: ['flight', 'missed'],
      lang: 'ar',
    },
    {
      question: 'هل هناك قيود عمرية؟',
      answer: 'لا حدود عمرية صارمة، لكن بعض الأنشطة لها أعمار دنيا.',
      tags: ['age', 'restrictions'],
      lang: 'ar',
    },
    {
      question: 'كيف أحدث ملفي الشخصي؟',
      answer: 'سجل الدخول وقم بتحرير معلومات ملفك الشخصي.',
      tags: ['profile', 'update'],
      lang: 'ar',
    },
    {
      question: 'هل لديكم برامج ولاء؟',
      answer: 'نعم، اكسب نقاطًا على الحجوزات لخصومات مستقبلية.',
      tags: ['loyalty', 'program'],
      lang: 'ar',
    },
    {
      question: 'ماذا لو أثر الطقس على رحلتي؟',
      answer: 'نراقب الطقس؛ إلغاءات ممكنة مع استرداد.',
      tags: ['weather', 'cancellation'],
      lang: 'ar',
    },
    {
      question: 'كيف أتتبع حجزي؟',
      answer: 'استخدم رابط التتبع في بريد التأكيد.',
      tags: ['booking', 'track'],
      lang: 'ar',
    },
    {
      question: 'مرحبا',
      answer: 'مرحباً! كيف يمكنني مساعدتك اليوم؟',
      tags: ['greeting', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'اهلا',
      answer: 'أهلاً بك! كيف يمكنني خدمتك؟',
      tags: ['greeting', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'هاي',
      answer: 'هاي! كيف أقدر أساعدك؟',
      tags: ['greeting', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'صباح الخير',
      answer: 'صباح النور! كيف أقدر أساعدك اليوم؟',
      tags: ['greeting', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'مساء الخير',
      answer: 'مساء النور! كيف أقدر أساعدك؟',
      tags: ['greeting', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'عامل ايه؟',
      answer: 'تمام الحمدلله! كيف أقدر أساعدك؟',
      tags: ['smalltalk', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'ممكن تساعدني؟',
      answer: 'أكيد! قلّي إنت محتاج مساعدة في إيه.',
      tags: ['help', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'ايه تقدر تعمل؟',
      answer: 'أقدر أساعدك في استكشاف الوجهات، تصفح الباقات، والرد على أي أسئلة عن TourEase.',
      tags: ['info', 'conversation'],
      lang: 'ar',
    },
    {
      question: 'انت مين؟',
      answer: 'أنا مساعد TourEase، موجود هنا لمساعدتك في أي سؤال أو استفسار.',
      tags: ['info', 'identity'],
      lang: 'ar',
    },
    {
      question: 'ايه هو TourEase؟',
      answer: 'TourEase منصة سفر تساعدك تستكشف الوجهات وتحجز الفنادق والباقات بسهولة.',
      tags: ['info', 'tourEase'],
      lang: 'ar',
    },
    {
      question: 'عايز اخطط رحلة',
      answer: 'تمام! قلّي وجهتك المفضلة وتواريخ السفر وأنا أبدأ أساعدك.',
      tags: ['planning', 'help'],
      lang: 'ar',
    },
    {
      question: 'مش فاهم',
      answer: 'ولا يهمك! ممكن توضح لي أكتر أو تعيد السؤال؟',
      tags: ['help', 'clarification'],
      lang: 'ar',
    },
    {
      question: 'إشرح تاني',
      answer: 'حاضر! قُلّي الجزء اللي محتاج تفهمه أكتر وأنا أشرحه لك.',
      tags: ['help', 'clarification'],
      lang: 'ar',
    },
  ];

  for (const f of faqs) {
    await FAQModel.updateOne({ question: f.question, lang: f.lang }, { $set: f }, { upsert: true });
  }

  process.exit(0);
}

seed().catch((e) => {
  process.exit(1);
});
