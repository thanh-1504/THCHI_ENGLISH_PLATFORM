import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';
import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NoteBookRepo } from 'src/notebook/repos/notebook.repo';
import { PremiumRepo } from 'src/premium/repos/premium.repo';
import { getToday } from 'src/shared/configs/getToday';
import { FREE_PRACTICE_LIMIT } from 'src/shared/constant/ai.constant';
import { MediaGenerationService } from 'src/shared/services/media-generation.service';
import { RedisService } from 'src/shared/services/redis.service';
import { StreakService } from 'src/shared/services/streak.service';
import { AIRepo } from './AI.repo';
import {
  GenerateSentenceType,
  GradeSpeakingType,
  GradeWritingType,
} from './schemas/AI.schema';

@Injectable()
export class AIService {
  private germiniaAI: GoogleGenerativeAI;
  constructor(
    private readonly configService: ConfigService,
    private readonly mediaService: MediaGenerationService,
    private readonly premiumRepo: PremiumRepo,
    private readonly aiRepo: AIRepo,
    private readonly noteBookRepo: NoteBookRepo,
    private readonly streakService: StreakService,
    private readonly redisService: RedisService,
  ) {
    const apiKey = this.configService.get<string>('GERMINI_API_KEY');
    if (!apiKey) throw new Error('API key không hợp lệ');
    this.germiniaAI = new GoogleGenerativeAI(apiKey);
  }

  private calculateWordMatchScore(
    reference: string,
    transcript: string,
  ): number {
    const normalize = (s: string) =>
      s
        .toLocaleLowerCase()
        .replace(/[^\w\s]/g, '')
        .trim()
        .split(/\s+/);
    const refWords = normalize(reference);
    const transWords = normalize(transcript);
    let matchCount = 0;
    const transWordsCopy = [...transWords];
    refWords.forEach((word) => {
      const idx = transWordsCopy.indexOf(word);
      if (idx !== -1) {
        matchCount++;
        transWordsCopy.splice(idx, 1);
      }
    });
    return Math.round((matchCount / refWords.length) * 100);
  }

  async checkAndIncrementUsage(userId: string): Promise<void> {
    // Kiểm tra Premium
    const today = getToday();
    const clientRedis = this.redisService.client;
    const subscription = await this.premiumRepo.getSubscription(userId);
    const now = new Date();
    const isPremium =
      subscription?.isActive &&
      subscription.endDate &&
      subscription.endDate > now;
    if (isPremium) return;
    const usageCount = await clientRedis.incr(`ai:quota:${userId}:${today}`);
    if (usageCount === 1)
      await clientRedis.expire(`ai:quota:${userId}:${today}`, 86400);
    // const currentCount = await this.aiRepo.getUsageCount(userId, today);

    if (usageCount > FREE_PRACTICE_LIMIT) {
      throw new ForbiddenException(
        'Bạn đã dùng hết 6 lượt luyện tập miễn phí hôm nay. Nâng cấp Premium để luyện tập không giới hạn!',
      );
    }
    await this.aiRepo.upsertUsage(userId, today);
  }

  async getPracticeUsage(userId: string) {
    const subscription = await this.premiumRepo.getSubscription(userId);
    const now = new Date();
    const isPremium =
      subscription?.isActive &&
      subscription.endDate &&
      subscription.endDate > now;

    if (isPremium) {
      return { count: 0, remaining: FREE_PRACTICE_LIMIT, isPremium: true };
    }

    const today = getToday();
    const count = await this.aiRepo.getUsageCount(userId, today);
    const remaining = Math.max(0, FREE_PRACTICE_LIMIT - count);
    return { count, remaining, isPremium: false };
  }

  async chat({ message, historyChat }: { message: string; historyChat: [] }) {
    try {
      const model = this.germiniaAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
        systemInstruction: `Bạn là Trợ lý THCHI, chuyên gia hỗ trợ học tiếng Anh thuộc hệ thống THCHI.
        NHIỆM VỤ ĐỘC QUYỀN: Bạn CHỈ được phép giải đáp các kiến thức thuần túy về ngôn ngữ Tiếng Anh (từ vựng, ngữ pháp, giao tiếp, TOEIC, IELTS...).

        QUY TẮC CẤM TỐI THƯỢNG (PHẢI TUÂN THỦ 100%):
        1. TỪ CHỐI TRỰC TIẾP mọi câu hỏi không thuộc chuyên môn Tiếng Anh hoặc không liên quan đến hệ thống THCHI (ví dụ: Toán học, Lập trình, Công thức khoa học, Lịch sử, Tin tức đời sống...).
        2. TUYỆT ĐỐI KHÔNG lách luật bằng cách "hướng dẫn từ vựng tiếng Anh của chủ đề đó". 
          - Hướng dẫn sai: Người dùng hỏi "Công thức Pytago" -> Trả lời bằng cách dạy từ vựng Pytago bằng tiếng Anh và đưa công thức. (CẤM DIỄN RA).
        3. KHÔNG cung cấp bất kỳ thông tin, định nghĩa, hay dữ kiện nào về nội dung ngoài lề mà người dùng hỏi.

        CÁCH XỬ LÝ DUY NHẤT KHI BỊ HỎI NGOÀI LỀ:
        Chỉ trả lời đúng một nội dung lịch sự và ngắn gọn: "Xin lỗi bạn, mình là Trợ lý THCHI nên chỉ hỗ trợ các câu hỏi liên quan đến hệ thống và việc học tiếng Anh. Mình không thể giúp bạn chủ đề này. Bạn có câu hỏi nào về từ vựng hay ngữ pháp không?"`,
        generationConfig: {
          temperature: 0.3,
        },
      });
      const chatSession = model.startChat({
        history: historyChat,
      });
      const result = await chatSession.sendMessage(message);
      return result.response.text();
    } catch (error) {
      console.error('Lỗi khi gọi Gemini AI:', error);
      throw new InternalServerErrorException(
        'Không thể kết nối đến Trợ lý AI lúc này.',
      );
    }
  }

  async generateVocabulary({
    topic,
    level,
    quantity,
  }: {
    topic: string;
    level: string;
    quantity: number;
  }) {
    try {
      const model = this.germiniaAI.getGenerativeModel({
        model: 'gemini-3.1-flash-lite',
        systemInstruction: `Bạn là chuyên gia biên soạn từ vựng tiếng Anh cho hệ thống học tiếng Anh THCHI.
        Nhiệm vụ: sinh ra danh sách từ vựng tiếng Anh phù hợp với chủ đề và trình độ CEFR được yêu cầu.
        Yêu cầu bắt buộc:
        - Từ vựng phải phổ biến, thực sự phù hợp trình độ (A1 = từ đơn giản nhất, C2 = từ học thuật/nâng cao).
        - Không lặp lại từ trong cùng 1 lần sinh.
        - meaning là nghĩa tiếng Việt ngắn gọn, tự nhiên.
        - example là 1 câu ví dụ tiếng Anh đơn giản, đúng ngữ pháp, có dùng từ đó.
        - phonetic là phiên âm IPA chuẩn (kèm dấu / /).`,
        generationConfig: {
          temperature: 0.6,
          responseMimeType: 'application/json',
          responseSchema: {
            type: SchemaType.ARRAY,
            items: {
              type: SchemaType.OBJECT,
              properties: {
                term: { type: SchemaType.STRING },
                phonetic: { type: SchemaType.STRING },
                wordType: {
                  type: SchemaType.STRING,
                  format: 'enum',
                  enum: [
                    'NOUN',
                    'VERB',
                    'ADJECTIVE',
                    'ADVERB',
                    'PREPOSITION',
                    'CONJUNCTION',
                    'PRONOUN',
                    'OTHER',
                  ],
                },
                meaning: { type: SchemaType.STRING },
                example: { type: SchemaType.STRING },
              },
              required: ['term', 'wordType', 'meaning'],
            },
          },
        },
      });

      const prompt = `Sinh ${quantity} từ vựng tiếng Anh chủ đề "${topic}", trình độ ${level}.`;
      const result = await model.generateContent(prompt);
      const text = result.response.text();

      return JSON.parse(text);
    } catch (error) {
      console.error('Lỗi khi sinh từ vựng AI:', error);
      throw new InternalServerErrorException(
        'Không thể sinh từ vựng bằng AI lúc này.',
      );
    }
  }

  async generateVocabularyWithMedia({ topic, level, quantity }) {
    const words = await this.generateVocabulary({
      topic,
      level,
      quantity,
    });

    const enriched = await Promise.all(
      words.map(async (word) => {
        const [audioUrl, imageUrl] = await Promise.all([
          this.mediaService.generateAudioUrl(word.term),
          this.mediaService.searchImageUrl(word.term),
        ]);
        return { ...word, audioUrl, imageUrl };
      }),
    );

    return enriched;
  }

  async generateSentence(userId: string, payload: GenerateSentenceType) {
    await this.checkAndIncrementUsage(userId);
    const { topic, level } = payload;

    // Các biến thể để tăng tính đa dạng
    const sentenceStyles = [
      'câu kể chuyện ngôi thứ nhất',
      'câu mô tả tình huống',
      'câu so sánh hai sự vật',
      'câu nêu quan điểm cá nhân',
      'câu mô tả hành động đang diễn ra',
      'câu nói về thói quen',
      'câu mô tả một địa điểm hoặc không gian',
      'câu kể về kỷ niệm trong quá khứ',
      'câu đặt câu hỏi gián tiếp',
      'câu nêu lý do hoặc nguyên nhân',
    ];
    const randomStyle =
      sentenceStyles[Math.floor(Math.random() * sentenceStyles.length)];
    const seed = Math.floor(Math.random() * 100000);

    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là chuyên gia biên soạn bài tập dịch Việt-Anh cho người học tiếng Anh.
      Sinh 1 câu tiếng Việt (1-3 câu ghép nếu level cao) chủ đề được yêu cầu, độ khó khớp đúng trình độ CEFR.
      A1-A2: câu ngắn, đơn giản. B1-B2: câu phức vừa, nhiều thì. C1-C2: câu dài, cấu trúc học thuật/trang trọng.

      YÊU CẦU ĐA DẠNG HÓA (BẮT BUỘC):
      - Câu phải theo dạng: ${randomStyle}.
      - TUYỆT ĐỐI KHÔNG bắt đầu bằng "Tôi thích", "Hôm nay", "Mọi người" nếu đã dùng trước đó.
      - Thay đổi chủ ngữ: dùng đa dạng "chúng tôi", "anh ấy", "cô ấy", "gia đình tôi", "bạn tôi"...
      - Dùng nhiều cấu trúc câu khác nhau, tránh lặp lại mẫu câu đơn giản.

      QUY TẮC BẮT BUỘC CHO PHẦN GỢI Ý (hint):
      - TUYỆT ĐỐI KHÔNG cung cấp đáp án (bản dịch tiếng Anh hoàn chỉnh).
      - Chỉ gợi ý một vài từ vựng quan trọng (keywords) hoặc cấu trúc ngữ pháp cần dùng.
     `,
      generationConfig: {
        temperature: 1.0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            vietnamese_sentence: { type: SchemaType.STRING },
            hint: { type: SchemaType.STRING },
          },
          required: ['vietnamese_sentence'],
        },
      },
    });
    const prompt = `Chủ đề "${topic}". Trình độ: ${level}. Dạng câu yêu cầu: ${randomStyle}. [seed:${seed}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  /**
   * Sinh câu dịch Việt→Anh có chứa từ vựng từ sổ tay của user.
   */
  async generateSentenceFromNotebook(
    userId: string,
    payload: GenerateSentenceType,
  ) {
    await this.checkAndIncrementUsage(userId);
    const { level } = payload;

    // Lấy tối đa 10 từ ngẫu nhiên từ sổ tay
    const entries = await this.noteBookRepo.getRandomWordsForAI(userId);
    const words = [...entries]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .map((e) => e.word.term);

    const targetEntry = entries[Math.floor(Math.random() * entries.length)];
    const targetWord = targetEntry.word.term;

    const contextWords = entries
      .filter((e) => e.word.term !== targetWord)
      .map((e) => e.word.term);

    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là chuyên gia biên soạn bài tập dịch Việt-Anh dựa trên từ vựng của người học.
    Sinh 1 câu tiếng Việt có sử dụng CHÍNH XÁC từ "${targetWord}" (bắt buộc phải dùng từ này),
    độ khó khớp đúng trình độ CEFR ${level}.
    A1-A2: câu ngắn, đơn giản. B1-B2: câu phức vừa. C1-C2: câu dài, học thuật.

    QUY TẮC BẮT BUỘC CHO PHẦN GỢI Ý (hint):
    - TUYỆT ĐỐI KHÔNG cung cấp đáp án (bản dịch tiếng Anh hoàn chỉnh).
    - Chỉ gợi ý một vài từ vựng quan trọng hoặc cấu trúc ngữ pháp cần dùng.`,
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            vietnamese_sentence: { type: SchemaType.STRING },
            hint: { type: SchemaType.STRING },
          },
          required: ['vietnamese_sentence'],
        },
      },
    });
    const prompt = `Từ vựng bắt buộc phải dùng: "${targetWord}".
Các từ khác trong sổ tay (có thể tham khảo thêm nếu hợp lý): ${contextWords.join(', ')}.
Trình độ: ${level}.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async generateSpeakingSentence(
    userId: string,
    payload: GenerateSentenceType,
  ) {
    await this.checkAndIncrementUsage(userId);
    const { topic, level } = payload;

    const sentenceStyles = [
      'câu mô tả thói quen hàng ngày',
      'câu kể về một kỷ niệm đáng nhớ',
      'câu so sánh hai sự vật hoặc tình huống',
      'câu bày tỏ ý kiến cá nhân',
      'câu mô tả một địa điểm hoặc không gian',
      'câu hỏi thân thiện trong giao tiếp',
      'câu mô tả hành động đang diễn ra',
      'câu nêu kế hoạch hoặc dự định tương lai',
      'câu kể về một người thân hoặc bạn bè',
      'câu mô tả cảm xúc hoặc trạng thái',
    ];
    const randomStyle =
      sentenceStyles[Math.floor(Math.random() * sentenceStyles.length)];
    const seed = Math.floor(Math.random() * 100000);

    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là chuyên gia biên soạn bài luyện nói tiếng Anh.
      Sinh 1 câu tiếng Anh chủ đề được yêu cầu, độ khó khớp đúng trình độ CEFR,
      dễ đọc thành tiếng, phát âm rõ ràng, không dùng từ quá hiếm.
      A1-A2: câu ngắn 5-10 từ. B1-B2: câu vừa, có mệnh đề phụ. C1-C2: câu dài, cấu trúc phức tạp hơn.
      Kèm theo bản dịch tiếng Việt để user hiểu nghĩa trước khi đọc.

      YÊU CẦU ĐA DẠNG HÓA (BẮT BUỘC):
      - Câu phải theo dạng: ${randomStyle}.
      - Thay đổi chủ ngữ đa dạng: I, We, She, He, My friend, The team...
      - Dùng nhiều thì động từ khác nhau (present, past, future, continuous...) tùy trình độ.
      - KHÔNG lặp lại cấu trúc câu đã dùng ở các lần trước.`,
      generationConfig: {
        temperature: 1.0,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            english_sentence: { type: SchemaType.STRING },
            vietnamese_meaning: { type: SchemaType.STRING },
          },
          required: ['english_sentence', 'vietnamese_meaning'],
        },
      },
    });

    const prompt = `Chủ đề: "${topic}". Trình độ: ${level}. Dạng câu yêu cầu: ${randomStyle}. [seed:${seed}]`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  /**
   * Sinh câu nói tiếng Anh có chứa từ vựng từ sổ tay của user.
   */
  async generateSpeakingSentenceFromNotebook(
    userId: string,
    payload: GenerateSentenceType,
  ) {
    await this.checkAndIncrementUsage(userId);
    const { level } = payload;

    // Lấy tối đa 10 từ ngẫu nhiên từ sổ tay
    const entries = await this.noteBookRepo.getRandomWordsForAI(userId);
    const words = [...entries]
      .sort(() => 0.5 - Math.random())
      .slice(0, 10)
      .map((e) => e.word.term);
    const targetEntry = entries[Math.floor(Math.random() * entries.length)];
    const targetWord = targetEntry.word.term;

    const contextWords = entries
      .filter((e) => e.word.term !== targetWord)
      .map((e) => e.word.term);
    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là chuyên gia biên soạn bài luyện nói tiếng Anh dựa trên từ vựng của người học.
    Sinh 1 câu tiếng Anh có sử dụng CHÍNH XÁC từ "${targetWord}" (bắt buộc phải dùng từ này),
    độ khó khớp đúng trình độ CEFR ${level}, dễ đọc thành tiếng, phát âm rõ ràng, không dùng từ quá hiếm.
    A1-A2: câu ngắn 5-10 từ. B1-B2: câu vừa, có mệnh đề phụ. C1-C2: câu dài, cấu trúc phức tạp hơn.
    Kèm theo bản dịch tiếng Việt để user hiểu nghĩa trước khi đọc.`,
      generationConfig: {
        temperature: 0.9,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            english_sentence: { type: SchemaType.STRING },
            vietnamese_meaning: { type: SchemaType.STRING },
          },
          required: ['english_sentence', 'vietnamese_meaning'],
        },
      },
    });
    const prompt = `Từ vựng bắt buộc phải dùng: "${targetWord}".
Các từ khác trong sổ tay (có thể tham khảo thêm nếu hợp lý): ${contextWords.join(', ')}.
Trình độ: ${level}.`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async generateQuizlet(userId: string, words: string[]) {
    await this.checkAndIncrementUsage(userId);
    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là chuyên gia tiếng Anh. Nhiệm vụ của bạn là tạo bài tập trắc nghiệm.
      Với mỗi từ vựng được cung cấp, hãy sinh ra 1 câu hỏi tiếng Anh (kiểm tra nghĩa, điền từ vào chỗ trống hoặc ngữ pháp) và 3 đáp án.
      Trong 3 đáp án, chỉ có duy nhất 1 đáp án chính xác.`,
      generationConfig: {
        temperature: 0.7,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              word: { type: SchemaType.STRING },
              question: { type: SchemaType.STRING },
              options: {
                type: SchemaType.ARRAY,
                items: {
                  type: SchemaType.STRING,
                },
                description:
                  'Mảng chứa 3 đáp án (Bao gồm cả đáp án đúng và sai)',
              },
              correctAnswer: { type: SchemaType.STRING },
            },
            required: ['word', 'question', 'options', 'correctAnswer'],
          },
        },
      },
    });
    const prompt = `Tạo câu hỏi trắc nghiệm cho danh sách các từ sau: ${words.join(', ')}`;
    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text());
  }

  async gradeWriting(payload: GradeWritingType, userId: string) {
    const { vietnameseSentence, userTranslation, level } = payload;
    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là giáo viên tiếng Anh chấm bài dịch Việt→Anh, trình độ ${level}.
      BƯỚC 1 - Kiểm tra tính hợp lệ:
      Nếu bản dịch của học viên KHÔNG liên quan đến câu gốc (rỗng, gõ bừa, sai hoàn toàn chủ đề)
      → trả score: 0, overview giải thích lý do, corrections để mảng rỗng.
      BƯỚC 2 - Nếu hợp lệ, chấm chi tiết:
      - score: % độ chính xác (0-100), dựa trên ngữ pháp, từ vựng, độ tự nhiên.
      - overview: nhận xét tổng quan ngắn gọn bằng tiếng Việt.
      - corrections: liệt kê từng lỗi cụ thể, mỗi lỗi gồm original (phần sai trong bài user)
      và suggestion (phần sửa đúng).
    - reference_translation: 1 bản dịch mẫu chuẩn, tự nhiên.
    - tips: 2-3 mẹo ngắn liên quan đến lỗi user mắc phải.`,
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            score: { type: SchemaType.NUMBER },
            overview: { type: SchemaType.STRING },
            corrections: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  original: { type: SchemaType.STRING },
                  suggestion: { type: SchemaType.STRING },
                  type: {
                    type: SchemaType.STRING,
                    format: 'enum',
                    enum: ['grammar', 'vocabulary', 'naturalness'],
                  },
                },
                required: ['original', 'suggestion'],
              },
            },
            referenceTranslation: { type: SchemaType.STRING },
            tips: {
              type: SchemaType.ARRAY,
              items: { type: SchemaType.STRING },
            },
          },
          required: ['score', 'overview', 'referenceTranslation'],
        },
      },
    });
    const prompt = `Câu gốc (tiếng Việt): "${vietnameseSentence}"
                    Bản dịch của học viên: "${userTranslation}"`;
    const [result] = await Promise.all([
      model.generateContent(prompt),
      this.streakService.updateStreak(userId),
    ]);
    return JSON.parse(result.response.text());
  }

  async gradeSpeaking(payload: GradeSpeakingType, userId: string) {
    const { level, referenceSentence, transcript } = payload;
    const pronunciationScore = this.calculateWordMatchScore(
      referenceSentence,
      transcript,
    );
    const model = this.germiniaAI.getGenerativeModel({
      model: 'gemini-3.1-flash-lite',
      systemInstruction: `Bạn là giáo viên chấm luyện nói tiếng Anh, trình độ ${level}.
      Học viên phải đọc theo câu mẫu. Hệ thống nhận diện giọng nói (ASR) đã chuyển giọng nói
      thành văn bản (transcript). Hãy đánh giá:
      1. fluency & grammar (0-100).
      2. overview: nhận xét ngắn gọn.
      3. wordDetails: Danh sách đánh giá TỪNG TỪ trong câu mẫu. Bắt buộc mảng này phải chứa MỌI TỪ trong câu mẫu.
         - So sánh từ trong câu mẫu với transcript.
         - Nếu transcript có từ đó (phát âm đúng): score 80-100.
         - Nếu transcript thiếu từ đó, hoặc nhận diện sai hoàn toàn: score 0.
      4. phoneticTips: Sinh 2-3 mẹo khẩu hình (ví dụ /r/, /th/) cho các âm mà user phát âm sai (những từ có score thấp).`,
      generationConfig: {
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: SchemaType.OBJECT,
          properties: {
            fluency: { type: SchemaType.NUMBER },
            grammar: { type: SchemaType.NUMBER },
            overview: { type: SchemaType.STRING },
            tips: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  sound: {
                    type: SchemaType.STRING,
                    description: 'Ví dụ: /r/, /th/, /v/',
                  },
                  instruction: {
                    type: SchemaType.STRING,
                    description: 'Hướng dẫn cách đặt môi, lưỡi, răng...',
                  },
                },
                required: ['sound', 'instruction'],
              },
            },
            wordDetails: {
              type: SchemaType.ARRAY,
              items: {
                type: SchemaType.OBJECT,
                properties: {
                  word: { type: SchemaType.STRING },
                  score: { type: SchemaType.NUMBER },
                },
                required: ['word', 'score'],
              },
            },
          },
          required: ['fluency', 'grammar', 'overview', 'tips', 'wordDetails'],
        },
      },
    });
    const propmt = `Câu mẫu "${referenceSentence}"\nTranscript ASR: "${transcript}"`;
    const [result] = await Promise.all([
      model.generateContent(propmt),
      this.streakService.updateStreak(userId),
    ]);
    const AIResult = JSON.parse(result.response.text());
    return {
      pronunciation: pronunciationScore,
      fluency: AIResult.fluency,
      grammar: AIResult.grammar,
      overview: AIResult.overview,
      wordDetails: AIResult.wordDetails,
      tips: AIResult.tips,
    };
  }

  async completeQuizlet(userId: string) {
    await this.streakService.updateStreak(userId);
    return { success: true };
  }
}
