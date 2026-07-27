/** EN / AR overlays for home page (text + JSON). Images stay in FR base defaults. */

export const HOME_EN: Record<string, string> = {
  'hero.title': 'The future of Tunisian tourism is built here!',
  'hero.subtitle': 'Unite, innovate and promote Tunisian tourism',
  'hero.cta_primary': 'Discover the Federation',
  'hero.cta_secondary': 'Join now',

  'about.title': 'Who we are',
  'about.body':
    'The Interprofessional Federation of Tunisian Tourism is an independent employers’ professional union founded in March 2016 by operators from different tourism activities: travel agencies, alternative accommodation, leisure, entertainment, sports, transport…',
  'about.cta': 'See more',
  'about.badge': "10+\nYEARS OF COMMITMENT",

  'objectifs.title': 'Our Objectives',
  'objectifs.intro':
    'Fi2T aims to bring together different tourism operators within a single professional union.',
  'objectifs.items': JSON.stringify([
    { num: '01', title: 'Strategic vision', desc: 'Contribute to strategic vision for the sector' },
    { num: '02', title: 'Members’ interests', desc: 'Safeguard economic and social interests' },
    { num: '03', title: 'Synergy', desc: 'Create synergy between operators' },
    { num: '04', title: 'Development', desc: 'Contribute to the development of Tunisian tourism' },
  ]),

  'groupements.title': 'Professional Groups',
  'groupements.intro':
    'Led by 3 elected members, they represent and defend operators’ interests.\nEach group defines its own strategy for targeted industry expertise.',
  'groupements.items': JSON.stringify([
    { label: 'Travel agencies', slug: 'agences-de-voyages', icon: '/images/icon1.png' },
    { label: 'Alternative accommodation', slug: 'hebergements-alternatifs', icon: '/images/icon2.png' },
    { label: 'Cultural tourism', slug: 'tourisme-culturel', icon: '/images/icon3.png' },
    { label: 'Health tourism', slug: 'thalassotherapie', icon: '/images/icon4.png' },
    { label: 'Adventure tourism', slug: 'tourisme-aventure', icon: '/images/icon5.png' },
    { label: 'Business tourism', slug: 'tourisme-affaire', icon: '/images/icon6.png' },
    { label: 'Ecological tourism', slug: 'tourisme-thermal', icon: '/images/icon7.png' },
    { label: 'Aeronautical tourism', slug: 'tourisme-senior', icon: '/images/icon8.png' },
    { label: 'Automotive tourism', slug: 'tourisme-automobile', icon: '/images/icon9.png' },
    { label: 'Sports tourism', slug: 'tourisme-golfique', icon: '/images/icon10.png' },
    { label: 'Nautical tourism', slug: 'tourisme-plaisance', icon: '/images/icon11.png' },
    { label: 'Underwater tourism', slug: 'tourisme-medical', icon: '/images/icon12.png' },
  ]),

  'adherer.title': 'Why join Fi2T?',
  'adherer.badge': "50+\nACTIVE MEMBERS",
  'adherer.cta': 'Join now',
  'adherer.reasons': JSON.stringify([
    { title: 'Institutional representation', desc: 'Be represented before governments and institutions' },
    { title: 'Strategic networking', desc: 'Join a structured professional network' },
    { title: 'Greater visibility', desc: 'Improve visibility and business opportunities' },
    { title: 'Quality label', desc: 'Benefit from a quality and compliance label' },
    { title: 'Resources & expertise', desc: 'Access professional resources and training' },
  ]),

  'actualites.title': 'Latest News',
  'actualites.cta': 'See more',
  'actualites.items': JSON.stringify([
    {
      slug: 'walid-tritar-president-fi2t',
      title: 'Tourism: Walid Tritar, new President of Fi2T',
      desc: 'Walid Tritar has been elected new President of Fi2T (Interprofessional Federation of Tunisian Tourism) for 2026–2029....',
      date: '11 May 2026',
      img: '/images/act1.jpg',
    },
    {
      slug: 'secteur-sous-pression',
      title: 'Tourism sector: under pressure, but resilient...',
      desc: 'The global tourism sector is going through a challenging phase, with more demanding markets and later booking decisions....',
      date: '22 May 2026',
      img: '/images/act2.jpg',
    },
    {
      slug: 'houssem-azouz-centre-ouest',
      title: 'Houssem Azouz (President of the Interprofessional Federation...',
      desc: 'Houssem Azouz — the Centre-West of the country, marked by the scale of its heritage and its colours...',
      date: '7 April 2026',
      img: '/images/act3.jpg',
    },
  ]),

  'cta.title': 'Join our vision for the future',
  'cta.body':
    'Become a member of the Federation and take an active part in building\noutstanding Tunisian tourism.',
  'cta.primary': 'Join the federation',
  'cta.secondary': 'Contact the board',
}

export const HOME_AR: Record<string, string> = {
  'hero.title': 'مستقبل السياحة التونسية يُبنى هنا!',
  'hero.subtitle': 'توحيد وابتكار وتعزيز السياحة التونسية',
  'hero.cta_primary': 'اكتشف الفيدرالية',
  'hero.cta_secondary': 'انضم الآن',

  'about.title': 'من نحن؟',
  'about.body':
    'الاتحاد المهني المشترك للسياحة التونسية هو نقابة مهنية لأرباب العمل مستقلة تأسست في مارس 2016 من قبل فاعلين من أنشطة سياحية مختلفة: وكالات أسفار، إقامة بديلة، ترفيه، تنشيط، رياضة، نقل…',
  'about.cta': 'المزيد',
  'about.badge': "10+\nسنوات من الالتزام",

  'objectifs.title': 'أهدافنا',
  'objectifs.intro': 'تهدف Fi2T إلى جمع مختلف الفاعلين السياحيين ضمن نقابة مهنية واحدة.',
  'objectifs.items': JSON.stringify([
    { num: '01', title: 'رؤية استراتيجية', desc: 'المساهمة في الرؤية الاستراتيجية للقطاع' },
    { num: '02', title: 'مصالح الأعضاء', desc: 'حماية المصالح الاقتصادية والاجتماعية' },
    { num: '03', title: 'التآزر', desc: 'خلق تآزر بين الفاعلين' },
    { num: '04', title: 'التطوير', desc: 'المساهمة في تطوير السياحة التونسية' },
  ]),

  'groupements.title': 'التجمعات المهنية',
  'groupements.intro':
    'يديرها 3 أعضاء منتخبون، وتمثل وتدافع عن مصالح الفاعلين.\nيحدد كل تجمع استراتيجيته باستقلالية لخبرة مهنية مستهدفة.',
  'groupements.items': JSON.stringify([
    { label: 'وكالات الأسفار', slug: 'agences-de-voyages', icon: '/images/icon1.png' },
    { label: 'الإقامة البديلة', slug: 'hebergements-alternatifs', icon: '/images/icon2.png' },
    { label: 'السياحة الثقافية', slug: 'tourisme-culturel', icon: '/images/icon3.png' },
    { label: 'سياحة الصحة', slug: 'thalassotherapie', icon: '/images/icon4.png' },
    { label: 'سياحة المغامرة', slug: 'tourisme-aventure', icon: '/images/icon5.png' },
    { label: 'سياحة الأعمال', slug: 'tourisme-affaire', icon: '/images/icon6.png' },
    { label: 'السياحة البيئية', slug: 'tourisme-thermal', icon: '/images/icon7.png' },
    { label: 'السياحة الجوية', slug: 'tourisme-senior', icon: '/images/icon8.png' },
    { label: 'سياحة السيارات', slug: 'tourisme-automobile', icon: '/images/icon9.png' },
    { label: 'السياحة الرياضية', slug: 'tourisme-golfique', icon: '/images/icon10.png' },
    { label: 'السياحة البحرية', slug: 'tourisme-plaisance', icon: '/images/icon11.png' },
    { label: 'السياحة تحت المائية', slug: 'tourisme-medical', icon: '/images/icon12.png' },
  ]),

  'adherer.title': 'لماذا الانضمام إلى Fi2T؟',
  'adherer.badge': "50+\nأعضاء نشطون",
  'adherer.cta': 'انضم الآن',
  'adherer.reasons': JSON.stringify([
    { title: 'التمثيل المؤسسي', desc: 'التمثيل أمام الحكومات والمؤسسات' },
    { title: 'التواصل الاستراتيجي', desc: 'المشاركة في شبكة مهنية منظمة' },
    { title: 'رؤية أكبر', desc: 'تعزيز الظهور والفرص التجارية' },
    { title: 'علامة الجودة', desc: 'الاستفادة من علامة جودة وامتثال' },
    { title: 'موارد وخبرة', desc: 'الوصول إلى موارد مهنية وتكوينات' },
  ]),

  'actualites.title': 'آخر الأخبار',
  'actualites.cta': 'المزيد',
  'actualites.items': JSON.stringify([
    {
      slug: 'walid-tritar-president-fi2t',
      title: 'السياحة: وليد تريتار، الرئيس الجديد لـ Fi2T',
      desc: 'تم انتخاب وليد تريتار رئيساً جديداً لـ Fi2T للفترة 2026–2029....',
      date: '11 مايو 2026',
      img: '/images/act1.jpg',
    },
    {
      slug: 'secteur-sous-pression',
      title: 'القطاع السياحي: تحت الضغط لكنه صامد...',
      desc: 'يشهد القطاع السياحي العالمي مرحلة صعبة مع أسواق أكثر تطلباً وقرارات سفر متأخرة....',
      date: '22 مايو 2026',
      img: '/images/act2.jpg',
    },
    {
      slug: 'houssem-azouz-centre-ouest',
      title: 'حسام عزوز (رئيس الاتحاد المهني المشترك...',
      desc: 'حسام عزوز — الوسط الغربي للبلاد بما يحمله من آثار وألوان...',
      date: '7 أبريل 2026',
      img: '/images/act3.jpg',
    },
  ]),

  'cta.title': 'انضموا إلى رؤيتنا للمستقبل',
  'cta.body': 'كن عضواً في الفيدرالية وشارك بفعالية في بناء\nسياحة تونسية استثنائية.',
  'cta.primary': 'الانضمام إلى الفيدرالية',
  'cta.secondary': 'اتصل بالمكتب',
}
