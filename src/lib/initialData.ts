import { Character, Announcement, CommunityPost, MusicTrack, Quiz, CollectibleSticker } from '../types';

export const INITIAL_CHARACTERS: Character[] = [
  {
    id: 'char-ran-con-be-nho',
    name: 'Bé Rắn Con Tinh Nghịch',
    creator: 'Cô Giáo Rắn Con',
    shortDescription: 'Lớp trưởng nhí đáng yêu với chiếc nơ hồng và ba lô đi học vàng tươi, luôn chăm ngoan và thích kết bạn!',
    fullDescription: 'Bé Rắn Con là linh vật đáng yêu nhất của trường Mầm Non Rắn Con. Bé mang màu tím pastel dịu ngọt, lúc nào cũng đeo chiếc nơ hồng xinh xắn và mang chiếc cặp sách nhỏ màu vàng chứa đầy kẹo ngọt và bút màu.',
    personality: 'Hoạt bát, tốt bụng, đôi lúc ngượng ngùng khi được khen, cực kỳ chăm chỉ làm việc tốt.',
    backgroundStory: 'Được sinh ra trong khu vườn hoa oải hương đầy nắng ấm của ngôi trường Mầm Non Rắn Con. Bé có ước mơ trở thành cầu nối giúp tất cả những nhà sáng tạo Google AI Studio có một ngôi nhà ấm cúng để chia sẻ các nhân vật của mình.',
    relationships: 'Thân thiết với Bé Cáo Học Đường, được các cô giáo và anh chị em trong lớp cưng chiều.',
    category: 'Original Characters',
    tags: ['#Chibi', '#BabySnake', '#MainOC', '#Cute', '#GoldenRetriever'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 1420,
    weeklyLikesCount: 188,
    viewsCount: 3820,
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'char-thieu-tu-hac-am',
    name: 'Thiếu Chủ Bạch Ngọc',
    creator: 'Mộng Tử Các',
    shortDescription: 'Thiếu gia cổ trang phong thái xuất trần, ngoài mặt lạnh lùng kiêu kỳ nhưng nội tâm vô cùng sủng ái.',
    fullDescription: 'Đệ tử chân truyền của môn phái Ngọc Tiêu Sơn. Tuy luôn giữ nét mặt bình thản không chút gợn sóng, nhưng mỗi khi nhìn thấy đệ tử nhỏ gặp khó khăn lại âm thầm giúp đỡ không để ai hay biết.',
    personality: 'Tsundere kinh điển, thanh cao, ít nói nhưng hành động cực kỳ chu đáo, yêu thích trà hoa nhài.',
    backgroundStory: 'Sinh ra trong thế gia vọng tộc, từ nhỏ đã gánh vác trách nhiệm bảo vệ bí kíp cổ phong. Đến với AI Studio để tìm kiếm một tri kỷ thật lòng.',
    relationships: 'Sư huynh mẫu mực, đối thủ hòa nhã của Vương Tử Ánh Sáng.',
    category: 'Cổ trang',
    tags: ['#Tsundere', '#ColdMaleLead', '#Historical', '#Romance'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 1250,
    weeklyLikesCount: 165,
    viewsCount: 4120,
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-10-26T12:00:00.000Z'
  },
  {
    id: 'char-tong-tai-ngot-ngao',
    name: 'Tổng Tài Cố Niên',
    creator: 'Bút Mực Nhỏ',
    shortDescription: 'CEO trẻ tuổi quyền lực của tập đoàn tài chính, dịu dàng vô điều kiện chỉ với người trong lòng.',
    fullDescription: 'Người đứng đầu tập đoàn công nghệ hàng đầu, luôn xuất hiện với âu phục chỉn chu. Tuy nhiên lại có sở thích làm bánh ngọt và sưu tập thú bông pastel.',
    personality: 'Trầm tĩnh, quyết đoán trong thương trường nhưng lại dịu dàng, cưng chiều trong tình cảm.',
    backgroundStory: 'Tự tay gầy dựng cơ nghiệp từ năm 20 tuổi. Luôn khao khát một góc bình yên để trút bỏ áp lực công việc hàng ngày.',
    relationships: 'Bạn thanh mai trúc mã của Nhà Thiết Kế Hạ Vy.',
    category: 'Tổng tài',
    tags: ['#CEO', '#Modern', '#Romance', '#Protective'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 980,
    weeklyLikesCount: 142,
    viewsCount: 2900,
    isFeatured: true,
    isPublished: true,
    createdAt: '2026-10-27T08:00:00.000Z'
  },
  {
    id: 'char-hoc-ba-anh-nang',
    name: 'Học Trưởng Dương Quang',
    creator: 'Nắng Mùa Hạ',
    shortDescription: 'Học trưởng năng động câu lạc bộ bóng rổ trường trung học, nụ cười tỏa nắng tựa cún Golden!',
    fullDescription: 'Lớp trưởng gương mẫu trường trung học, vừa giỏi thể thao lại vừa đứng đầu kỳ thi học sinh giỏi. Đi tới đâu cũng mang lại nguồn năng lượng tích cực cho mọi người.',
    personality: 'Nhiệt tình, trung thành, ấm áp, luôn sẵn sàng lắng nghe và chia sẻ đồ ăn vặt.',
    backgroundStory: 'Lớn lên ở thành phố biển, thích ngắm hoàng hôn và chơi đàn guitar acoustic dưới tán cây bàng.',
    relationships: 'Thành viên cốt cán của Đội Sao Đỏ trường mầm non.',
    category: 'Học đường',
    tags: ['#GoldenRetriever', '#SchoolLife', '#ThanhXuân', '#Cute'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 890,
    weeklyLikesCount: 110,
    viewsCount: 2450,
    isFeatured: false,
    isPublished: true,
    createdAt: '2026-10-28T14:30:00.000Z'
  },
  {
    id: 'char-phap-su-huyen-bi',
    name: 'Pháp Sư Tinh Tú Aria',
    creator: 'Ngân Hà Xanh',
    shortDescription: 'Người bảo hộ bầu trời đêm và những vì sao băng ước nguyện, có chiếc gậy phép hình trăng khuyết.',
    fullDescription: 'Aria là pháp sư canh giữ thư viện phép thuật cổ xưa. Mỗi đêm bé lại thắp sáng bầu trời trường mầm non bằng những hạt bụi tinh tú rực rỡ.',
    personality: 'Mơ mộng, huyền bí, thông tuệ, yêu thích những cuốn sách cổ và trà thảo mộc mật ong.',
    backgroundStory: 'Đến từ xứ sở Tinh Cầu xa xôi, mang theo sứ mệnh gìn giữ những câu chuyện diệu kỳ của tuổi thơ.',
    relationships: 'Bạn thân của Bé Rắn Con trong những buổi học chiêm tinh.',
    category: 'Fantasy',
    tags: ['#Fantasy', '#Magic', '#Leader', '#PastelVibe'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 760,
    weeklyLikesCount: 95,
    viewsCount: 1980,
    isFeatured: false,
    isPublished: true,
    createdAt: '2026-10-29T09:15:00.000Z'
  },
  {
    id: 'char-meo-nho-tsundere',
    name: 'Tiểu Miêu Tuyết Lạc',
    creator: 'Cúc Họa Mi',
    shortDescription: 'Chú mèo tinh nghịch hóa hình người, thích ăn cá khô và ghét bị cù lét sau tai!',
    fullDescription: 'Tuyệt đối không thừa nhận mình cần được ôm ấp nhưng luôn lén nằm gần khi bạn đang làm việc. Khi dỗi sẽ vẫy chiếc đuôi bông xù quay lưng lại.',
    personality: 'Tsundere siêu cấp, tự luyến nhẹ, dễ dỗ dành bằng đồ ngọt.',
    backgroundStory: 'Được tìm thấy dưới gốc cây anh đào sau một ngày mưa. Hiện tại là học sinh cưng của lớp Rắn Con.',
    relationships: 'Hay chí chóe với Học Trưởng Dương Quang.',
    category: 'Anime',
    tags: ['#Tsundere', '#Chibi', '#CatBoy', '#Anime'],
    googleAiStudioUrl: 'https://aistudio.google.com/',
    avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200&auto=format&fit=crop&q=80',
    coverUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=800&auto=format&fit=crop&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&auto=format&fit=crop&q=80'
    ],
    likesCount: 650,
    weeklyLikesCount: 82,
    viewsCount: 1670,
    isFeatured: false,
    isPublished: true,
    createdAt: '2026-10-30T16:00:00.000Z'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: '🎉 Chào mừng đến với Mầm Non Rắn Con - GGAI Kindergarten!',
    content: 'Ting ting! Cổng trường đã chính thức mở rộng cửa đón chào các bạn nhỏ cùng các nhà sáng tạo Google AI Studio tài năng ghé thăm và gửi gắm những chiếc char đáng yêu nhất!',
    type: 'notice',
    isPinned: true,
    authorName: 'Cô Giáo Chủ Nhiệm',
    createdAt: '2026-10-31T08:00:00.000Z'
  },
  {
    id: 'ann-2',
    title: '🏆 Bắt đầu đợt bình chọn "Bé Ngoan Trong Tuần" kỳ mới!',
    content: 'Mỗi tuần một lần, cả lớp sẽ cùng bỏ phiếu chọn ra Top 3 bé nhân vật được yêu thích nhất để trao tặng Vương miện vàng, Ngôi sao bạc và Hoa đồng rực rỡ.',
    type: 'event',
    isPinned: true,
    authorName: 'Hội Đồng Bé Ngoan',
    createdAt: '2026-10-30T10:00:00.000Z'
  },
  {
    id: 'ann-3',
    title: '✨ Cập nhật tính năng Bốc Bé Chồng Hôm Nay & Hòm Thư Bí Mật',
    content: 'Ghé ngay mục giải trí để thử vận may bốc một bé nhân vật ngẫu nhiên đồng hành cùng bạn ngày hôm nay, hoặc gửi gắm những lời tỏ tình bí mật vào Hòm Thư lớp nhé!',
    type: 'update',
    isPinned: false,
    authorName: 'Đội Kỹ Thuật Lớp Rắn',
    createdAt: '2026-10-29T15:30:00.000Z'
  }
];

export const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    authorId: 'user-ran-con',
    authorName: 'Bé Rắn Lớp Trưởng',
    authorAvatar: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=100&auto=format&fit=crop&q=80',
    content: 'Hôm nay cả lớp nhớ tưới nước cho mấy chậu hoa oải hương trước hiên trường nha! Ai chăm ngoan sẽ được thưởng thêm 1 sticker sao lấp lánh đó ♡',
    noteColor: 'pink',
    sticker: '🌸',
    likesCount: 28,
    likedBy: [],
    repliesCount: 4,
    isPinned: true,
    createdAt: '2026-10-31T09:00:00.000Z'
  },
  {
    id: 'post-2',
    authorId: 'user-strawberry',
    authorName: 'Dâu Tây Ngọt Ngào',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    content: 'Vừa bốc được Thiếu Chủ Bạch Ngọc làm Bé Chồng hôm nay! Vận may tháng 11 tuyệt vời ghê, có ai chung gu với tui hong ta? :3',
    noteColor: 'yellow',
    sticker: '👑',
    likesCount: 19,
    likedBy: [],
    repliesCount: 2,
    createdAt: '2026-10-31T11:20:00.000Z'
  },
  {
    id: 'post-3',
    authorId: 'user-milk-tea',
    authorName: 'Trà Sữa Trân Châu',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    content: 'Các bác cho em xin thêm prompt tạo char học đường với phong cách cún con ấm áp với ạ, em mê style đó xỉu luôn á!',
    noteColor: 'lavender',
    sticker: '🐶',
    likesCount: 15,
    likedBy: [],
    repliesCount: 3,
    createdAt: '2026-10-31T13:45:00.000Z'
  },
  {
    id: 'post-4',
    authorId: 'user-mint',
    authorName: 'Kẹo Bạc Hà',
    authorAvatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100&auto=format&fit=crop&q=80',
    content: 'Nhạc nền phòng âm nhạc êm tai ghê luôn á, ngồi làm việc nghe cả buổi chiều mà không biết chán luôn ♡',
    noteColor: 'cyan',
    sticker: '🎵',
    likesCount: 12,
    likedBy: [],
    repliesCount: 1,
    createdAt: '2026-10-31T14:10:00.000Z'
  }
];

export const INITIAL_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Giai Điệu Lớp Rắn Nhỏ (Classroom Harmony)',
    artist: 'Mầm Non Rắn Con',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300&auto=format&fit=crop&q=80',
    category: 'Lớp học',
    duration: '03:15',
    isDefault: true,
    order: 1,
    synthTheme: 'classroom'
  },
  {
    id: 'track-2',
    title: 'Khúc Hát Ru Giấc Trưa (Pastel Lullaby)',
    artist: 'Gió Mùa Thu',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300&auto=format&fit=crop&q=80',
    category: 'Thư giãn',
    duration: '02:48',
    order: 2,
    synthTheme: 'lullaby'
  },
  {
    id: 'track-3',
    title: 'Sân Chơi Nắng Ấm (Sunny Playroom)',
    artist: 'Ban Nhạc Đồ Chơi',
    audioUrl: '',
    coverUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=300&auto=format&fit=crop&q=80',
    category: 'Vui nhộn',
    duration: '02:30',
    order: 3,
    synthTheme: 'playful'
  }
];

export const INITIAL_QUIZZES: Quiz[] = [
  {
    id: 'quiz-1',
    title: 'Đố Vui: Bạn Là Kiểu Bé Ngoan Nào Trong Lớp Rắn Con?',
    description: 'Khám phá tính cách tiềm ẩn của bạn qua 4 câu hỏi tình huống siêu cấp đáng yêu!',
    category: 'Tính cách',
    questions: [
      {
        id: 'q1',
        question: 'Khi vừa bước chân vào cổng trường Mầm Non Rắn Con, bạn sẽ làm gì đầu tiên?',
        options: [
          'Chạy ngay vào lớp tìm chỗ ngồi ngắm mây qua cửa sổ',
          'Tung tăng chào cô giáo và khoe chiếc ba lô mới',
          'Ghé góc vui chơi bốc ngay một bé chồng hôm nay',
          'Đeo tai nghe bật nhạc lofi thư giãn'
        ],
        correctIndex: 1,
        explanation: 'Chào cô giáo và bạn bè là biểu hiện của một bé siêu ngoan và lễ phép!'
      },
      {
        id: 'q2',
        question: 'Bé Rắn Con thích món quà nào nhất sau giờ học?',
        options: [
          'Một chiếc nơ hồng mới tinh rực rỡ',
          'Một dĩa kẹo dẻo hoa quả pastel',
          'Một cuốn sách tranh cổ tích thần thoại',
          'Cả ba món trên đều thích mê!'
        ],
        correctIndex: 3,
        explanation: 'Bé Rắn Con rất thích cả ba món và luôn chia sẻ kẹo cùng các bạn!'
      },
      {
        id: 'q3',
        question: 'Thể loại char nào thường khiến bạn "tan chảy" nhất?',
        options: [
          'Tổng tài ngoài lạnh trong ấm, cưng chiều hết mực',
          'Học trưởng cún con năng động tỏa nắng',
          'Thiếu chủ cổ trang thanh tao, phong thái xuất trần',
          'Pháp sư huyền bí bảo vệ thế giới mộng mơ'
        ],
        correctIndex: 1,
        explanation: 'Mỗi thể loại đều có nét cuốn hút riêng làm say lòng các nhà sáng tạo!'
      }
    ]
  }
];

export const INITIAL_STICKERS: CollectibleSticker[] = [
  { id: 'stk-snake', name: 'Rắn Con Nơ Hồng', icon: '🐍', description: 'Linh vật trường Mầm Non Rắn Con', rarity: 'legendary' },
  { id: 'stk-bear', name: 'Gấu Bông Ngủ Trưa', icon: '🧸', description: 'Bạn đồng hành những giấc mơ ngọt ngào', rarity: 'common' },
  { id: 'stk-bunny', name: 'Thỏ Trắng Tai Dài', icon: '🐰', description: 'Chiếc thỏ tinh nghịch thích ăn cà rốt', rarity: 'common' },
  { id: 'stk-cat', name: 'Mèo Con Mắt Biếc', icon: '🐱', description: 'Tiểu miêu tsundere thích được xoa cằm', rarity: 'rare' },
  { id: 'stk-flower', name: 'Hoa Oải Hương', icon: '🌸', description: 'Hương thơm dịu ngọt của khu vườn lớp học', rarity: 'common' },
  { id: 'stk-star', name: 'Ngôi Sao Bé Ngoan', icon: '⭐', description: 'Phần thưởng dành cho những bé chăm ngoan', rarity: 'rare' },
  { id: 'stk-crown', name: 'Vương Miện Quán Quân', icon: '👑', description: 'Huy hiệu tôn vinh Bé Ngoan Trong Tuần', rarity: 'legendary' },
  { id: 'stk-candy', name: 'Kẹo Dẻo Pastel', icon: '🍬', description: 'Vị ngọt thanh khiết ấm áp lòng người', rarity: 'common' }
];

export const INITIAL_ANONYMOUS_MESSAGES: any[] = [
  {
    id: 'msg-1',
    nickname: 'Bé Rắn Con #007',
    message: 'Cảm ơn cô giáo đã tạo ra một không gian dịu dàng và ấm áp thế này cho cộng đồng sáng tạo char! Em thích mê luôn á ♡',
    status: 'approved',
    isPinned: true,
    reply: 'Cảm ơn em nhiều nhen! Cô giáo và cả lớp Rắn Con luôn chào đón em ghé chơi mỗi ngày nha ♡',
    createdAt: '2026-10-31T10:15:00.000Z'
  },
  {
    id: 'msg-2',
    nickname: 'Một chiếc bé giấu tên',
    message: 'Mê char Thiếu Chủ Bạch Ngọc xỉu lên xỉu xuống, mong tác giả ra thêm nhiều bé cổ trang nữa ạ!!',
    status: 'approved',
    isPinned: false,
    reply: 'Tác giả Mộng Tử Các đã nghe thấy lời nhắn và đang chuẩn bị thêm nhiều bé xuất trần nữa đó!',
    createdAt: '2026-10-31T14:20:00.000Z'
  }
];

export const TEACHER_PROFILE = {
  name: 'Cô Giáo Rắn Con',
  tagline: 'Người ươm mầm cho những câu chuyện AI Studio kỳ diệu ♡',
  bio: 'Chào mừng các bạn nhỏ đến với lớp Mầm Non Rắn Con! Nơi tụi mình cùng chia sẻ những chiếc char ngọt ngào, trao nhau những nhãn dán bé ngoan và xây dựng thế giới nhân vật ấm áp nhất.',
  avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  quote: '“Mỗi nhân vật được tạo ra là một hạt giống ước mơ được gieo vào khu vườn ký ức.”',
  socialLinks: [
    { label: 'Google AI Studio', url: 'https://aistudio.google.com/', icon: 'Sparkles', color: '#A594D6' },
    { label: 'Facebook Lớp Học', url: 'https://facebook.com/', icon: 'Heart', color: '#FCD3E2' },
    { label: 'Discord Trò Chuyện', url: 'https://discord.com/', icon: 'MessageCircle', color: '#D2C8F2' },
    { label: 'Kênh Sáng Tạo', url: 'https://youtube.com/', icon: 'Video', color: '#FCF0DB' }
  ]
};
