import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { PrismaClient, WordType } from '../generated/prisma/client';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // ===== 1. USERS =====
  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@udemy.com' },
    update: {},
    create: {
      email: 'admin@udemy.com',
      name: 'Admin',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@gmail.com' },
    update: {},
    create: {
      email: 'user@gmail.com',
      name: 'Dương Nhật Thành',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Dương Nhật Thành',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
        },
      },
      notebook: { create: {} },
      streakInfo: {
        create: {
          currentStreak: 12,
          longestStreak: 20,
          lastStudiedDate: new Date(),
          streakShieldCount: 2,
        },
      },
      rankInfo: {
        create: {
          currentTier: 'SILVER',
          xpThisWeek: 80,
          xpTotal: 350,
        },
      },
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'user2@gmail.com' },
    update: {},
    create: {
      email: 'user2@gmail.com',
      name: 'Nguyễn Văn A',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Nguyễn Văn A',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user2',
        },
      },
      notebook: { create: {} },
      streakInfo: {
        create: {
          currentStreak: 5,
          longestStreak: 10,
          lastStudiedDate: new Date(),
          streakShieldCount: 1,
        },
      },
      rankInfo: {
        create: {
          currentTier: 'SILVER',
          xpThisWeek: 120,
          xpTotal: 500,
        },
      },
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@gmail.com' },
    update: {},
    create: {
      email: 'user3@gmail.com',
      name: 'Trần Thị B',
      password: hashedPassword,
      role: 'USER',
      status: 'ACTIVE',
      profile: {
        create: {
          displayName: 'Trần Thị B',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user3',
        },
      },
      notebook: { create: {} },
      streakInfo: {
        create: {
          currentStreak: 3,
          longestStreak: 7,
          lastStudiedDate: new Date(),
          streakShieldCount: 0,
        },
      },
      rankInfo: {
        create: {
          currentTier: 'SILVER',
          xpThisWeek: 60,
          xpTotal: 200,
        },
      },
    },
  });
  console.log('Tạo users thành công');

  // ===== 2. COURSES =====
  const course = await prisma.course.upsert({
    where: { id: 'course-toeic-001' },
    update: {},
    create: {
      id: 'course-toeic-001',
      title: 'TOEIC 600+',
      subtitle: 'Chinh phục TOEIC với 600+ từ vựng thiết yếu',
      description:
        'Khóa học từ vựng TOEIC dành cho người mới bắt đầu đến trung cấp.',
      imageUrl:
        'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
      isPremium: false,
      isPublished: true,
      orderIndex: 1,
    },
  });

  const course2 = await prisma.course.upsert({
    where: { id: 'course-thpt-001' },
    update: {},
    create: {
      id: 'course-thpt-001',
      title: 'Từ vựng THPT Quốc gia',
      subtitle: 'Ôn thi THPT với 500+ từ vựng quan trọng',
      description: 'Tổng hợp từ vựng tiếng Anh thường gặp trong đề thi THPT.',
      imageUrl:
        'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400',
      isPremium: false,
      isPublished: true,
      orderIndex: 2,
    },
  });

  const course3 = await prisma.course.upsert({
    where: { id: 'course-ielts-001' },
    update: {},
    create: {
      id: 'course-ielts-001',
      title: 'IELTS Academic',
      subtitle: 'Từ vựng học thuật cho IELTS 6.5+',
      description:
        'Khóa học từ vựng chuyên sâu dành cho kỳ thi IELTS Academic.',
      imageUrl:
        'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400',
      isPremium: true,
      isPublished: true,
      orderIndex: 3,
    },
  });

  // ===== 3. TOPICS =====
  const topic1 = await prisma.topic.upsert({
    where: { id: 'topic-office-001' },
    update: {},
    create: {
      id: 'topic-office-001',
      courseId: course.id,
      title: 'Unit 1 - Văn phòng',
      subtitle: 'Từ vựng về môi trường văn phòng',
      imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400',
      orderIndex: 1,
      isPremium: false,
    },
  });

  const topic2 = await prisma.topic.upsert({
    where: { id: 'topic-travel-001' },
    update: {},
    create: {
      id: 'topic-travel-001',
      courseId: course.id,
      title: 'Unit 2 - Du lịch',
      subtitle: 'Từ vựng về du lịch và khách sạn',
      imageUrl:
        'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=400',
      orderIndex: 2,
      isPremium: false,
    },
  });

  const topic3 = await prisma.topic.upsert({
    where: { id: 'topic-food-001' },
    update: {},
    create: {
      id: 'topic-food-001',
      courseId: course.id,
      title: 'Unit 3 - Ẩm thực',
      subtitle: 'Từ vựng về đồ ăn và nhà hàng',
      imageUrl:
        'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
      orderIndex: 3,
      isPremium: false,
    },
  });

  // ===== 4. WORDS + TOPIC WORDS =====
  const wordsData = [
    // Unit 1 - Văn phòng
    {
      id: 'word-office-001',
      term: 'office',
      phonetic: '/ˈɒfɪs/',
      audioUrl:
        'https://ssl.gstatic.com/dictionary/static/sounds/oxford/office--_gb_1.mp3',
      definitions: [
        { wordType: WordType.NOUN, meaning: 'văn phòng, phòng làm việc' },
      ],
      examples: [
        {
          sentence: 'I work in a modern office.',
          translation: 'Tôi làm việc trong một văn phòng hiện đại.',
        },
      ],
      topicId: topic1.id,
      orderIndex: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1497366216548-37526070297c?w=300',
    },
    {
      id: 'word-meeting-001',
      term: 'meeting',
      phonetic: '/ˈmiːtɪŋ/',
      audioUrl:
        'https://ssl.gstatic.com/dictionary/static/sounds/oxford/meeting--_gb_1.mp3',
      definitions: [
        { wordType: WordType.NOUN, meaning: 'cuộc họp, buổi gặp mặt' },
      ],
      examples: [
        {
          sentence: 'We have a meeting every Monday.',
          translation: 'Chúng tôi có cuộc họp vào mỗi thứ Hai.',
        },
      ],
      topicId: topic1.id,
      orderIndex: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=300',
    },
    {
      id: 'word-deadline-001',
      term: 'deadline',
      phonetic: '/ˈdedlaɪn/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'hạn chót, thời hạn' }],
      examples: [
        {
          sentence: 'The deadline for this project is Friday.',
          translation: 'Hạn chót của dự án này là thứ Sáu.',
        },
      ],
      topicId: topic1.id,
      orderIndex: 3,
      imageUrl:
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300',
    },
    {
      id: 'word-report-001',
      term: 'report',
      phonetic: '/rɪˈpɔːt/',
      audioUrl: '',
      definitions: [
        { wordType: WordType.NOUN, meaning: 'báo cáo' },
        { wordType: WordType.VERB, meaning: 'báo cáo, tường trình' },
      ],
      examples: [
        {
          sentence: 'I need to submit my report by tomorrow.',
          translation: 'Tôi cần nộp báo cáo vào ngày mai.',
        },
      ],
      topicId: topic1.id,
      orderIndex: 4,
      imageUrl:
        'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300',
    },
    {
      id: 'word-schedule-001',
      term: 'schedule',
      phonetic: '/ˈʃedjuːl/',
      audioUrl: '',
      definitions: [
        { wordType: WordType.NOUN, meaning: 'lịch trình, thời gian biểu' },
        { wordType: WordType.VERB, meaning: 'lên lịch, sắp xếp' },
      ],
      examples: [
        {
          sentence: 'Please check the schedule for next week.',
          translation: 'Vui lòng kiểm tra lịch trình tuần tới.',
        },
      ],
      topicId: topic1.id,
      orderIndex: 5,
      imageUrl:
        'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=300',
    },
    // Unit 2 - Du lịch
    {
      id: 'word-hotel-001',
      term: 'hotel',
      phonetic: '/həʊˈtel/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'khách sạn' }],
      examples: [
        {
          sentence: 'We stayed at a five-star hotel.',
          translation: 'Chúng tôi ở tại một khách sạn năm sao.',
        },
      ],
      topicId: topic2.id,
      orderIndex: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=300',
    },
    {
      id: 'word-passport-001',
      term: 'passport',
      phonetic: '/ˈpɑːspɔːt/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'hộ chiếu' }],
      examples: [
        {
          sentence: "Don't forget to bring your passport.",
          translation: 'Đừng quên mang theo hộ chiếu.',
        },
      ],
      topicId: topic2.id,
      orderIndex: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=300',
    },
    {
      id: 'word-flight-001',
      term: 'flight',
      phonetic: '/flaɪt/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'chuyến bay' }],
      examples: [
        {
          sentence: 'My flight departs at 6 AM.',
          translation: 'Chuyến bay của tôi khởi hành lúc 6 giờ sáng.',
        },
      ],
      topicId: topic2.id,
      orderIndex: 3,
      imageUrl:
        'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300',
    },
    // Unit 3 - Ẩm thực
    {
      id: 'word-restaurant-001',
      term: 'restaurant',
      phonetic: '/ˈrestərɒnt/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'nhà hàng' }],
      examples: [
        {
          sentence: "Let's go to the restaurant for dinner.",
          translation: 'Hãy đến nhà hàng ăn tối.',
        },
      ],
      topicId: topic3.id,
      orderIndex: 1,
      imageUrl:
        'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300',
    },
    {
      id: 'word-menu-001',
      term: 'menu',
      phonetic: '/ˈmenjuː/',
      audioUrl: '',
      definitions: [{ wordType: WordType.NOUN, meaning: 'thực đơn' }],
      examples: [
        {
          sentence: 'Could I see the menu please?',
          translation: 'Cho tôi xem thực đơn được không?',
        },
      ],
      topicId: topic3.id,
      orderIndex: 2,
      imageUrl:
        'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300',
    },
  ];

  for (const wordData of wordsData) {
    const { topicId, orderIndex, imageUrl, definitions, examples, ...word } =
      wordData;
    const createdWord = await prisma.word.upsert({
      where: { id: word.id, term: word.term },
      update: {},
      create: {
        id: word.id,
        term: word.term,
        phonetic: word.phonetic,
        audioUrl: word.audioUrl || null,
        definitions: { create: definitions },
        examples: { create: examples },
      },
    });
    await prisma.topicWord.upsert({
      where: { topicId_wordId: { topicId, wordId: createdWord.id } },
      update: {},
      create: {
        topicId,
        wordId: createdWord.id,
        orderIndex,
        imageUrl: imageUrl || null,
      },
    });
  }

  // ===== 5. COURSE ENROLLMENT =====
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course.id } },
    update: {},
    create: { userId: user.id, courseId: course.id },
  });
  await prisma.courseEnrollment.upsert({
    where: { userId_courseId: { userId: user.id, courseId: course2.id } },
    update: {},
    create: { userId: user.id, courseId: course2.id },
  });

  // ===== 6. NOTEBOOK ENTRIES =====
  const notebook = await prisma.notebook.findUnique({
    where: { userId: user.id },
  });
  if (notebook) {
    const wordIds = [
      'word-office-001',
      'word-meeting-001',
      'word-deadline-001',
    ];
    for (const wordId of wordIds) {
      await prisma.notebookEntry.upsert({
        where: { notebookId_wordId: { notebookId: notebook.id, wordId } },
        update: {},
        create: {
          notebookId: notebook.id,
          wordId,
          nextReviewAt: new Date(),
          intervalDays: 1,
          easeFactor: 2.5,
          reviewCount: 1,
        },
      });
    }
  }

  // ===== 7. PREMIUM PLANS =====
  await prisma.premiumPlan.upsert({
    where: { id: 'plan-3months' },
    update: {},
    create: {
      id: 'plan-3months',
      name: 'Premium 3 Tháng',
      duration: 'THREE_MONTHS',
      price: 250000,
      originalPrice: 360000,
      badge: 'Tiết kiệm 30%',
      description: 'Tiết kiệm 30% so với gói 1 tháng',
    },
  });
  await prisma.premiumPlan.upsert({
    where: { id: 'plan-1year' },
    update: {},
    create: {
      id: 'plan-1year',
      name: 'Premium 1 Năm',
      duration: 'ONE_YEAR',
      price: 798000,
      originalPrice: 1440000,
      badge: 'Tiết kiệm 45%',
      description: 'Tiết kiệm 45% so với gói 1 tháng',
    },
  });

  // ===== 8. RANK TIER CONFIG =====
  const rankTiers = [
    { tier: 'BRONZE', xpRequired: 50, xpToMaintain: 0 },
    { tier: 'SILVER', xpRequired: 100, xpToMaintain: 50 },
    { tier: 'GOLD', xpRequired: 200, xpToMaintain: 100 },
    { tier: 'PLATINUM', xpRequired: 350, xpToMaintain: 200 },
    { tier: 'DIAMOND', xpRequired: 999, xpToMaintain: 350 },
  ];
  for (const tier of rankTiers) {
    await prisma.rankTierConfig.upsert({
      where: { tier: tier.tier as any },
      update: {},
      create: tier as any,
    });
  }

  // ===== 9. POSTS =====
  await prisma.post.upsert({
    where: { id: 'post-001' },
    update: {},
    create: {
      id: 'post-001',
      userId: user.id,
      title: 'Kinh nghiệm học TOEIC 800+ trong 3 tháng',
      content:
        '<p>Chia sẻ kinh nghiệm học TOEIC của mình sau 3 tháng luyện tập...</p>',
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });
  await prisma.post.upsert({
    where: { id: 'post-002' },
    update: {},
    create: {
      id: 'post-002',
      userId: user2.id,
      title: 'Mẹo nhớ từ vựng tiếng Anh hiệu quả',
      content: '<p>Những mẹo giúp bạn ghi nhớ từ vựng lâu hơn...</p>',
      status: 'APPROVED',
      reviewedBy: admin.id,
      reviewedAt: new Date(),
    },
  });
  await prisma.post.upsert({
    where: { id: 'post-003' },
    update: {},
    create: {
      id: 'post-003',
      userId: user3.id,
      title: 'Review app ThChi sau 1 tháng sử dụng',
      content: '<p>Sau 1 tháng dùng ThChi, mình đã học được 200 từ mới...</p>',
      status: 'PENDING',
    },
  });
  console.log('Tạo posts thành công');

  console.log(' Seed data hoàn tất!');
}

main()
  .catch((e) => {
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
