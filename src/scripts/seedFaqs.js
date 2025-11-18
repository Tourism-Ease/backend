import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
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
      question: 'ما هي سياسة الإلغاء؟',
      answer: 'يمكنك الإلغاء قبل 48 ساعة من الرحلة لاسترداد المبلغ بعد خصم الرسوم.',
      tags: ['cancel', 'policy'],
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
