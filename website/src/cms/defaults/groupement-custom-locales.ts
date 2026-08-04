/**
 * EN / AR overlays for Figma-unique groupement layouts that are not CMS-driven.
 * Deep-merged onto the FR page by getCustomGroupementPage(slug, locale).
 */
import type { CustomGroupementPage } from './groupement-custom-pages'

type PageOverlay = Partial<CustomGroupementPage> & {
  sections?: Record<string, unknown>
}

const HEB_EN: PageOverlay = {
  heroTitle: 'Alternative tourist accommodation',
  intro:
    'Alternative tourist accommodation is part of a broader concept known as alternative tourism, which differs from mass tourism through its responsible and sustainable approach.',
  sections: {
    introLead: 'alternative tourist accommodation',
    introBody:
      'Alternative accommodation refers to lodging types that offer a unique and often immersive experience, as opposed to conventional hotel structures. This kind of accommodation can include:',
    types: [
      {
        name: 'Eco-lodges',
        desc: 'Designed to minimise environmental impact while still offering comfort.',
        img: '/images/groupement-media/heb-ecolodge-photo.jpg',
        wide: true,
      },
      {
        name: 'Guest houses',
        desc: 'The elegance of Tunisian architectural heritage in the service of warm, personalised hospitality.',
        img: '/images/groupement-media/heb-maisons-photo.jpg',
        wide: false,
      },
      {
        name: 'Unusual stays',
        desc: 'Cabins, troglodyte dwellings or medina palaces for a unique and memorable stay.',
        img: '/images/groupement-media/heb-insolites-photo.jpg',
        wide: false,
      },
      {
        name: 'Homestays',
        desc: 'Allow travellers to live with local families, fostering cultural exchange.',
        img: '/images/groupement-media/heb-habitant-photo.jpg',
        wide: true,
      },
    ],
    values: [
      {
        title: 'Sustainability',
        desc: 'These accommodations are often built and managed with respect for the environment, using sustainable materials and ecological practices',
        icon: '/images/groupement-media/heb-value-durabilite.png?v=3',
      },
      {
        title: 'Authenticity',
        desc: 'The focus is on local culture, allowing travellers to immerse themselves in the traditions and lifestyles of communities',
        icon: '/images/groupement-media/heb-value-authenticite.png?v=3',
      },
      {
        title: 'Interaction',
        desc: 'Travellers are encouraged to interact with residents, which enriches their experience and supports local economies',
        icon: '/images/groupement-media/heb-value-interaction.png?v=3',
      },
      {
        title: 'Impact',
        desc: 'The aim is to generate benefits for local communities while preserving their cultural and natural heritage',
        icon: '/images/groupement-media/heb-value-impact.png?v=3',
      },
    ],
    growthTitle: 'A fast-growing sector',
    growthBody:
      'Alternative tourist accommodation continues to grow and is establishing itself as a more responsible and authentic way to travel. By favouring guest houses, rural cottages or eco-lodges, travellers support local economies while helping to preserve cultural and environmental heritage. In Tunisia, this sector accounts for a growing share of the tourism market and generates significant economic returns for local communities. Driven by demand for sustainable, immersive experiences, alternative accommodation is asserting itself as an essential lever of tomorrow’s tourism.',
    growthStats: [
      { value: '+20%', label: 'growth in guest houses and rural cottages (2019-2022)' },
      { value: '9%', label: 'of the Tunisian tourism market' },
      { value: '50m', suffix: 'TND', label: 'generated for local communities in 2022' },
    ],
    diagTitle: 'The Strategic Diagnosis',
    diag: [
      {
        num: '01',
        title: 'Market anarchy',
        desc: 'The Fi2T/EMHROD study showed that Tunisia has more than 2,500 alternative tourist accommodations (in various legal and illegal forms). Fewer than a hundred operate with an official ONTT licence',
        side: 'left',
      },
      {
        num: '02',
        title: 'Procedures',
        desc: 'This proves that the legal framework and procedures need revision and flexibility in order to bring as many operators as possible into the legal circuit',
        side: 'right',
      },
      {
        num: '03',
        title: 'Specifications',
        desc: 'A draft set of specifications was prepared almost two years ago and has still not been published. There is a risk that the draft will impose more constraints than the laws themselves',
        side: 'left',
      },
      {
        num: '04',
        title: 'Control',
        desc: 'who is responsible for controlling alternative accommodations: CRT, tourism police…',
        side: 'right',
      },
    ],
  },
}

const HEB_AR: PageOverlay = {
  heroTitle: 'الإيواء السياحي البديل',
  intro:
    'يندرج الإيواء السياحي البديل ضمن مفهوم أوسع يُعرف بالسياحة البديلة، ويتميز عن السياحة الجماعية بنهجه المسؤول والمستدام.',
  sections: {
    introLead: 'الإيواء السياحي البديل',
    introBody:
      'يقصد بالإيواء البديل أنواعًا من أماكن الإقامة تقدّم تجربة فريدة وغالباً غامرة، بخلاف الهياكل الفندقية التقليدية. ويمكن أن يشمل هذا النوع من الإيواء:',
    types: [
      {
        name: 'الإيكولوجات',
        desc: 'مصمّمة لتقليل الأثر البيئي مع توفير الراحة.',
        img: '/images/groupement-media/heb-ecolodge-photo.jpg',
        wide: true,
      },
      {
        name: 'بيوت الضيافة',
        desc: 'أناقة التراث المعماري التونسي في خدمة استقبال شخصي ودافئ.',
        img: '/images/groupement-media/heb-maisons-photo.jpg',
        wide: false,
      },
      {
        name: 'إقامات غير تقليدية',
        desc: 'أكواخ أو مساكن كهفية أو قصور في المدينة لتجربة إقامة فريدة لا تُنسى.',
        img: '/images/groupement-media/heb-insolites-photo.jpg',
        wide: false,
      },
      {
        name: 'الإقامة لدى السكان',
        desc: 'تتيح للمسافرين العيش مع عائلات محلية، مما يعزّز التبادل الثقافي.',
        img: '/images/groupement-media/heb-habitant-photo.jpg',
        wide: true,
      },
    ],
    values: [
      {
        title: 'الاستدامة',
        desc: 'غالباً ما تُبنى هذه الإقامات وتُدار باحترام للبيئة، باستخدام مواد مستدامة وممارسات إيكولوجية',
        icon: '/images/groupement-media/heb-value-durabilite.png?v=3',
      },
      {
        title: 'الأصالة',
        desc: 'يُركَّز على الثقافة المحلية، مما يتيح للمسافرين الانغماس في تقاليد وأنماط عيش المجتمعات',
        icon: '/images/groupement-media/heb-value-authenticite.png?v=3',
      },
      {
        title: 'التفاعل',
        desc: 'يُشجَّع المسافرون على التفاعل مع السكان، مما يثري تجربتهم ويدعم الاقتصادات المحلية',
        icon: '/images/groupement-media/heb-value-interaction.png?v=3',
      },
      {
        title: 'الأثر',
        desc: 'الهدف هو تحقيق منافع للمجتمعات المحلية مع الحفاظ على تراثها الثقافي والطبيعي',
        icon: '/images/groupement-media/heb-value-impact.png?v=3',
      },
    ],
    growthTitle: 'قطاع في نمو متواصل',
    growthBody:
      'يعرف الإيواء السياحي البديل نموًا مستمرًا ويؤكد نفسه كحل سفر أكثر مسؤولية وأصالة. ومن خلال تفضيل بيوت الضيافة والنزل الريفية أو الإيكولوجات، يدعم المسافرون الاقتصادات المحلية ويعززون الحفاظ على التراث الثقافي والبيئي. وفي تونس يمثل هذا القطاع حصة متزايدة من السوق السياحي ويولّد عوائد اقتصادية مهمة للمجتمعات المحلية. مدفوعًا بالطلب على تجارب مستدامة وغامرة، يثبت الإيواء البديل نفسه كرافعة أساسية لسياحة الغد.',
    growthStats: [
      { value: '+20%', label: 'نمو بيوت الضيافة والنزل الريفية (2019-2022)' },
      { value: '9%', label: 'من السوق السياحي التونسي' },
      { value: '50m', suffix: 'TND', label: 'عائدات للمجتمعات المحلية سنة 2022' },
    ],
    diagTitle: 'التشخيص الاستراتيجي',
    diag: [
      {
        num: '01',
        title: 'فوضى السوق',
        desc: 'أظهرت دراسة Fi2T/EMHROD وجود أكثر من 2500 إيواء سياحي بديل في تونس (بأشكال قانونية وغير قانونية مختلفة). وأقل من مائة منها يعمل بترخيص رسمي من الديوان الوطني للسياحة التونسية',
        side: 'left',
      },
      {
        num: '02',
        title: 'الإجراءات',
        desc: 'يثبت ذلك أن الإطار القانوني والإجراءات تحتاج إلى مراجعة ومرونة لإدماج أكبر عدد ممكن من المشغّلين في المسار القانوني',
        side: 'right',
      },
      {
        num: '03',
        title: 'كراس الشروط',
        desc: 'أُعدّ مشروع كراس شروط منذ نحو سنتين ولم يرَ النور بعد. ويُخشى أن يفرض المشروع قيودًا أكثر من القوانين نفسها',
        side: 'left',
      },
      {
        num: '04',
        title: 'المراقبة',
        desc: 'من يتولى مراقبة الإيواء البديل: المندوبيات الجهوية للسياحة، الشرطة السياحية…',
        side: 'right',
      },
    ],
  },
}

const CULT_EN: PageOverlay = {
  heroTitle: 'Cultural tourism',
  intro:
    'Rediscover Tunisia through the prism of authenticity, craftsmanship and institutional innovation.',
  sections: {
    stats: [
      {
        value: '40%',
        label: 'SHARE OF INTERNATIONAL TOURISM',
        desc: 'Cultural tourism is establishing itself as the driving segment of global mobility.',
        icon: 'globe',
      },
      {
        value: '3x',
        label: 'SPEND PER TOURIST',
        desc: 'A high-value traveller profile that contributes significantly to the local economy.',
        icon: 'euro',
      },
      {
        value: '10%',
        label: 'CONTRIBUTION TO GLOBAL GDP',
        desc: 'A cross-cutting economic force that goes beyond simply visiting sites.',
        icon: 'chart',
      },
    ],
    atoutsTitle: 'Our Strategic Strengths',
    atoutsBody:
      'Tunisia is not merely a destination; it is a crossroads of civilisations. From the legend of Alyssa to the strategies of Hannibal, we carry 3,000 years of history.',
    atouts: [
      {
        title: '3,000 YEARS OF HISTORY',
        desc: 'An archaeological heritage unique in the Mediterranean.',
        icon: 'landmark',
      },
      {
        title: 'EUROPEAN PROXIMITY',
        desc: 'Quick access for the main source market.',
        icon: 'plane',
      },
    ],
    quote: '"Craftsmanship is the soul of our territory, the living extension of our history."',
    diagTitle: 'Strategic Diagnosis',
    diagSub: 'Identify growth levers by addressing current challenges.',
    diag: [
      {
        title: 'Enhancement',
        desc: 'Urgent need to rehabilitate sites and improve the on-site visitor experience.',
        icon: '/images/groupement-media/culturel-diag-alert.png?v=4',
      },
      {
        title: 'Coordination',
        desc: 'Need for greater synergy between the Ministries of Tourism and Culture.',
        icon: '/images/groupement-media/culturel-diag-sync.png?v=4',
      },
      {
        title: 'Promotion',
        desc: 'Lack of targeted visibility on specialised segments internationally.',
        icon: '/images/groupement-media/culturel-diag-megaphone.png?v=4',
      },
    ],
    roadmapTitle: 'Institutional Roadmap',
    roadmapBody:
      'Our strategy rests on three fundamental pillars to turn potential into economic reality.',
    roadmap: [
      {
        num: '01',
        title: 'Cultural Integration',
        desc: 'Create tourist itineraries linking intangible heritage and archaeological sites.',
      },
      {
        num: '02',
        title: 'Targeted Promotion',
        desc: 'Organisation of eductours, specialised press invitations and presence at niche trade shows.',
      },
      {
        num: '03',
        title: 'Digitization & Access',
        desc: 'Modernise ticketing and offer interactive multilingual guides.',
      },
    ],
  },
}

const CULT_AR: PageOverlay = {
  heroTitle: 'السياحة الثقافية',
  intro:
    'إعادة اكتشاف تونس من خلال أصالة التجربة والحِرف والابتكار المؤسسي.',
  sections: {
    stats: [
      {
        value: '40%',
        label: 'حصة السياحة الدولية',
        desc: 'تفرض السياحة الثقافية نفسها كقطاع محرّك للتنقل العالمي.',
        icon: 'globe',
      },
      {
        value: '3x',
        label: 'الإنفاق لكل سائح',
        desc: 'ملف مسافر ذي قيمة مضافة عالية يساهم بشكل ملموس في الاقتصاد المحلي.',
        icon: 'euro',
      },
      {
        value: '10%',
        label: 'المساهمة في الناتج العالمي',
        desc: 'قوة اقتصادية عرضية تتجاوز مجرد زيارة المواقع.',
        icon: 'chart',
      },
    ],
    atoutsTitle: 'مقوماتنا الاستراتيجية',
    atoutsBody:
      'تونس ليست مجرد وجهة؛ إنها ملتقى حضارات. من أسطورة إليسا إلى استراتيجيات حنبعل، نحمل ثلاثة آلاف سنة من التاريخ.',
    atouts: [
      {
        title: '3000 سنة من التاريخ',
        desc: 'تراث أثري فريد في حوض البحر الأبيض المتوسط.',
        icon: 'landmark',
      },
      {
        title: 'القرب من أوروبا',
        desc: 'وصول سريع إلى السوق المُصدِّر الرئيسي.',
        icon: 'plane',
      },
    ],
    quote: '"الحِرف هي روح أرضنا، والامتداد الحي لتاريخنا."',
    diagTitle: 'التشخيص الاستراتيجي',
    diagSub: 'تحديد رافعات النمو عبر معالجة التحديات الراهنة.',
    diag: [
      {
        title: 'التثمين',
        desc: 'حاجة ملحّة لإعادة تأهيل المواقع وتحسين تجربة الزائر في عين المكان.',
        icon: '/images/groupement-media/culturel-diag-alert.png?v=4',
      },
      {
        title: 'التنسيق',
        desc: 'ضرورة تعزيز التآزر بين وزارتي السياحة والثقافة.',
        icon: '/images/groupement-media/culturel-diag-sync.png?v=4',
      },
      {
        title: 'الترويج',
        desc: 'نقص في الظهور المستهدف على الشرائح المتخصصة دوليًا.',
        icon: '/images/groupement-media/culturel-diag-megaphone.png?v=4',
      },
    ],
    roadmapTitle: 'خارطة الطريق المؤسسية',
    roadmapBody:
      'تقوم استراتيجيتنا على ثلاثة أعمدة أساسية لتحويل الإمكانات إلى واقع اقتصادي.',
    roadmap: [
      {
        num: '01',
        title: 'الإدماج الثقافي',
        desc: 'إحداث مسارات سياحية تربط التراث غير المادي بالمواقع الأثرية.',
      },
      {
        num: '02',
        title: 'ترويج موجّه',
        desc: 'تنظيم جولات تعريفية ودعوات للصحافة المتخصصة والحضور في المعارض المتخصصة.',
      },
      {
        num: '03',
        title: 'الرقمنة والوصول',
        desc: 'تحديث التذاكر وتقديم أدلة تفاعلية متعددة اللغات.',
      },
    ],
  },
}

const SANTE_CHILDREN_EN = [
  {
    slug: 'tourisme-medical',
    label: 'Medical tourism',
    tag: 'Care & surgery',
    blurb:
      'Accredited private clinics, cutting-edge technical platforms and end-to-end care for international patients, from diagnosis to post-operative follow-up.',
    face: '/images/groupement-photos/face-tourisme-medical.jpg',
  },
  {
    slug: 'thalassotherapie',
    label: 'Thalassotherapy',
    tag: 'Health by the sea',
    blurb:
      'Medically supervised protocols around seawater, muds and algae, in centres integrated into 4★ and 5★ coastal hotels.',
    face: '/images/groupement-photos/face-thalassotherapie.jpg',
  },
  {
    slug: 'tourisme-thermal',
    label: 'Thermal tourism',
    tag: 'Springs & hammams',
    blurb:
      'Hot springs of Korbous, Jebel Oust or Jerba and an ancient thermal tradition to modernise into true spa hubs.',
    face: '/images/groupement-photos/face-tourisme-thermal.jpg',
  },
  {
    slug: 'tourisme-senior',
    label: 'Senior tourism',
    tag: 'Long-stay breaks',
    blurb:
      'Wintering, accessibility and dedicated support: a loyal clientele that lengthens the season and consumes care as well as leisure.',
    face: '/images/groupement-photos/face-tourisme-senior.jpg',
  },
]

const SANTE_CHILDREN_AR = [
  {
    slug: 'tourisme-medical',
    label: 'السياحة الطبية',
    tag: 'رعاية وجراحة',
    blurb:
      'عيادات خاصة معتمدة ومنصات تقنية متقدمة ورعاية شاملة للمرضى الدوليين، من التشخيص إلى المتابعة بعد العملية.',
    face: '/images/groupement-photos/face-tourisme-medical.jpg',
  },
  {
    slug: 'thalassotherapie',
    label: 'العلاج بمياه البحر',
    tag: 'صحة عبر البحر',
    blurb:
      'بروتوكولات بإشراف طبي حول مياه البحر والطين والطحالب، في مراكز مدمجة بفنادق الشاطئ من فئة 4★ و5★.',
    face: '/images/groupement-photos/face-thalassotherapie.jpg',
  },
  {
    slug: 'tourisme-thermal',
    label: 'السياحة الحرارية',
    tag: 'ينابيع وحمامات',
    blurb:
      'ينابيع حارة في قربص وجبل الوسط وجربة وتقاليد حرارية عريقة ينبغي تحديثها إلى أقطاب علاج حقيقية.',
    face: '/images/groupement-photos/face-tourisme-thermal.jpg',
  },
  {
    slug: 'tourisme-senior',
    label: 'سياحة كبار السن',
    tag: 'إقامات طويلة',
    blurb:
      'تشتية وسهولة وصول ومرافقة مخصّصة: زبائن أوفياء يطيلون الموسم ويستهلكون الرعاية كما الترفيه.',
    face: '/images/groupement-photos/face-tourisme-senior.jpg',
  },
]

const SANTE_EN: PageOverlay = {
  heroTitle: 'Health tourism',
  intro:
    'Health tourism covers all stays whose main purpose is care, prevention or wellness. Tunisia has a rare advantage here: a recognised medical profession, hotel infrastructure integrated with care centres, a Mediterranean coastline and natural resources — seawater, muds, thermal springs — used since antiquity.\nThis hub brings together four segments that share the same clients, the same distribution channels and the same quality requirements. Treating them together makes it possible to build a clear international offer, pool promotion and speak with one voice to health, supervisory and transport authorities.',
  sections: {
    lead: 'Medical care, thalassotherapy, thermalism and senior stays: four segments, one Mediterranean health promise.',
    statsTitle: 'The hub in figures',
    stats: [
      {
        value: '4',
        label: 'SEGMENTS REPRESENTED',
        desc: 'Medical, thalassotherapy, thermal and seniors — steered within a single hub.',
      },
      {
        value: '60',
        label: 'THALASSOTHERAPY CENTRES',
        desc: 'Of which 15 are idle, awaiting restructuring and upgrading.',
      },
      {
        value: '300+',
        label: 'SUNNY DAYS / YEAR',
        desc: 'A climate that allows treatments and heliotherapy year-round.',
      },
      {
        value: '2 h',
        label: 'FLIGHT FROM SOURCE MARKETS',
        desc: 'Immediate proximity to major European capitals.',
      },
    ],
    pillarsTitle: 'Fi2T’s role on this hub',
    pillarsSub: 'Four cross-cutting workstreams carried out for all health segments.',
    pillars: [
      {
        title: 'Quality & accreditation',
        desc: 'Harmonise protocols, support accreditation processes and secure the foreign patient’s trust.',
        icon: 'shield',
      },
      {
        title: 'Regulatory framework',
        desc: 'Advocate with the authorities for needed adaptations: medical visas, file transfers, accompanying-person status.',
        icon: 'scale',
      },
      {
        title: 'International promotion',
        desc: 'A shared “Tunisia Health” banner at trade shows, with insurers and specialised agencies.',
        icon: 'megaphone',
      },
      {
        title: 'Training & professions',
        desc: 'Professionalise multilingual reception, stay coordination and medical wellness trades.',
        icon: 'people',
      },
    ],
    gridTitle: 'Health hub segments',
    gridSub: 'Each segment has its own detailed sheet: diagnosis, strengths and actions to take.',
    ctaTitle: 'Are you a health tourism operator?',
    ctaBody:
      'Clinics, thalassotherapy and spa centres, senior residences, specialised agencies: join the groupement and take part in the hub’s work.',
    ctaLabel: 'Join Fi2T',
    eyebrow: 'Groupement hub',
    discoverCta: 'Discover the segment',
    children: SANTE_CHILDREN_EN,
  },
}

const SANTE_AR: PageOverlay = {
  heroTitle: 'سياحة الصحة',
  intro:
    'تجمع سياحة الصحة كل الإقامات التي يكون دافعها الأساسي العلاج أو الوقاية أو استعادة اللياقة. وتتمتع تونس في هذا المجال بميزة نادرة: كفاءات طبية معترف بها، وبُنى فندقية مدمجة بمراكز الرعاية، وواجهة متوسطية وموارد طبيعية — مياه بحر وطين وينابيع حرارية — تُستغل منذ العصور القديمة.\nيجمع هذا القطب أربع شعب تشترك في الزبائن نفسها وقنوات التوزيع ومتطلبات الجودة. ومعالجتها معًا تتيح بناء عرض واضح دوليًا، وتوحيد الترويج، والتحدث بصوت واحد أمام سلطات الصحة والإشراف والنقل.',
  sections: {
    lead: 'رعاية طبية وعلاج بمياه البحر وحرارية وإقامات كبار السن: أربع شعب ووعد واحد بصحة متوسطية.',
    statsTitle: 'القطب بالأرقام',
    stats: [
      {
        value: '4',
        label: 'شعب ممثَّلة',
        desc: 'طبية وعلاج بمياه البحر وحرارية وكبار السن — تُقاد ضمن قطب واحد.',
      },
      {
        value: '60',
        label: 'مراكز علاج بمياه البحر',
        desc: 'منها 15 متوقفة في انتظار إعادة هيكلة وتحديث.',
      },
      {
        value: '300+',
        label: 'يوم مشمس / سنة',
        desc: 'مناخ يتيح العلاج والعلاج بالشمس على مدار السنة.',
      },
      {
        value: '2 h',
        label: 'من الطيران عن الأسواق المُصدِّرة',
        desc: 'قرب مباشر من العواصم الأوروبية الرئيسية.',
      },
    ],
    pillarsTitle: 'دور الفيتو في هذا القطب',
    pillarsSub: 'أربعة محاور عرضية تُنجَز لفائدة كل شعب الصحة.',
    pillars: [
      {
        title: 'الجودة والاعتماد',
        desc: 'مواءمة البروتوكولات ومرافقة مسارات الاعتماد وتعزيز ثقة المريض الأجنبي.',
        icon: 'shield',
      },
      {
        title: 'الإطار التنظيمي',
        desc: 'الدفاع أمام السلطات عن التكييفات اللازمة: التأشيرات الطبية ونقل الملفات ووضع المرافقين.',
        icon: 'scale',
      },
      {
        title: 'الترويج الدولي',
        desc: 'راية مشتركة «تونس الصحة» في المعارض ولدى شركات التأمين والوكالات المتخصصة.',
        icon: 'megaphone',
      },
      {
        title: 'التكوين والمهن',
        desc: 'تأهيل الاستقبال متعدد اللغات وتنسيق الإقامات ومهن الرفاه الطبي.',
        icon: 'people',
      },
    ],
    gridTitle: 'شعب قطب الصحة',
    gridSub: 'لكل شعبة بطاقة مفصّلة: تشخيص ومقومات وإجراءات مطلوبة.',
    ctaTitle: 'هل أنتم فاعلون في سياحة الصحة؟',
    ctaBody:
      'عيادات ومراكز علاج بمياه البحر والمنتجعات ومساكن كبار السن ووكالات متخصصة: انضموا إلى المجموعة وشاركوا في أعمال القطب.',
    ctaLabel: 'الانضمام إلى الفيتو',
    eyebrow: 'قطب المجموعة',
    discoverCta: 'اكتشف الشعبة',
    children: SANTE_CHILDREN_AR,
  },
}

const MED_EN: PageOverlay = {
  heroTitle: 'Medical tourism',
  intro:
    'Medical tourism means travelling to another country for health care, often to access better-quality, faster or more affordable treatments. Patients are also drawn by certain medical specialties and cutting-edge technologies. Growing worldwide, this sector is an important economic lever for host destinations, while raising issues of equity and access to care for local populations.',
  sections: {
    advTitle: 'Advantages of medical tourism in Tunisia',
    adv: [
      {
        title: 'Affordable costs',
        desc: 'Substantial savings of 30% to 50% compared with European rates, with no compromise on quality.',
        icon: 'euro',
      },
      {
        title: 'Quality of care',
        desc: 'Cutting-edge technical platforms and medical staff trained to international standards.',
        icon: 'care',
      },
      {
        title: 'Accessibility',
        desc: 'Strategic geographic proximity to Europe and the Mediterranean basin (flights under 3 hours).',
        icon: 'plane',
      },
      {
        title: 'Cultural experience',
        desc: 'Convalescence in a Mediterranean setting conducive to recovery and well-being.',
        icon: 'globe',
      },
      {
        title: 'All-inclusive services',
        desc: 'End-to-end care: airport transfer, clinic, accommodation and post-operative follow-up.',
        icon: 'clinic',
      },
      {
        title: 'Fi2T support',
        desc: 'Institutional coordination and defence of interests by our professional groupement.',
        icon: 'shield',
      },
    ],
    originTitle: 'What are the main\ncountries of origin of medical\npatients in Tunisia',
    originSub:
      'Demographic breakdown of the international patient base welcomed\nin our facilities.',
    bars: [
      { label: 'Algeria', pct: 70 },
      { label: 'Libya (clinic peak)', pct: 80 },
      { label: 'Sub-Saharan Africa', pct: 15, fill: '#59DBBD' },
      { label: 'Europe', pct: 15, fill: '#59DBBD' },
    ],
    donutValue: '100%',
    donutLabel: 'PATIENT TRUST',
    diagIntro: 'Structural diagnosis of the challenges to consolidate the sector.',
    diag: [
      {
        title: 'Promotion gap',
        desc: 'Lack of structured international visibility and absence of coordinated digital communication campaigns.',
        icon: 'megaphone',
      },
      {
        title: 'Unclear oversight',
        desc: 'Jurisdictional blur between the Ministry of Health and the Ministry of Tourism, slowing decision-making.',
        icon: 'building',
      },
      {
        title: 'Extra-medical disorder',
        desc: 'Need to regulate reception, logistics and facilitation services to guarantee a consistent patient experience.',
        icon: 'alert',
      },
    ],
    actionsTitle: 'Actions to take',
    actions: [
      {
        num: '1',
        title: 'Ministerial coordination',
        desc: 'Institutionalise a permanent steering committee between Health and Tourism for a unified regulatory framework.',
      },
      {
        num: '2',
        title: 'Promotion via networks',
        desc: 'Launch targeted territorial marketing campaigns through specialised networks and international health media.',
      },
    ],
  },
}

const MED_AR: PageOverlay = {
  heroTitle: 'السياحة الطبية',
  intro:
    'تعني السياحة الطبية الانتقال إلى بلد آخر للحصول على رعاية صحية، غالبًا بهدف الاستفادة من علاجات أجود أو أسرع أو أقل تكلفة. وينجذب المرضى أيضًا لتوفر بعض التخصصات الطبية والتقنيات المتطورة. وفي نمو متواصل عالميًا، يمثّل هذا القطاع رافعة اقتصادية مهمة للوجهات المستقبلة، مع طرح قضايا تتعلق بالإنصاف ووصول السكان المحليين إلى الرعاية.',
  sections: {
    advTitle: 'مزايا السياحة الطبية في تونس',
    adv: [
      {
        title: 'تكاليف ميسورة',
        desc: 'وفورات كبيرة من 30% إلى 50% مقارنة بالتعريفات الأوروبية دون المساس بالجودة.',
        icon: 'euro',
      },
      {
        title: 'جودة الرعاية',
        desc: 'منصات تقنية متقدمة وكفاءات طبية مكوَّنة وفق المعايير الدولية.',
        icon: 'care',
      },
      {
        title: 'سهولة الوصول',
        desc: 'قرب جغرافي استراتيجي من أوروبا وحوض المتوسط (رحلات أقل من 3 ساعات).',
        icon: 'plane',
      },
      {
        title: 'تجربة ثقافية',
        desc: 'نقاهة في إطار متوسطي ملائم للتعافي والرفاه.',
        icon: 'globe',
      },
      {
        title: 'خدمات شاملة',
        desc: 'تكفّل كامل: نقل من المطار والعيادة والإقامة والمتابعة بعد العملية.',
        icon: 'clinic',
      },
      {
        title: 'مرافقة الفيتو',
        desc: 'تنسيق مؤسسي والدفاع عن المصالح عبر مجموعتنا المهنية.',
        icon: 'shield',
      },
    ],
    originTitle: 'ما هي أبرز\nبلدان منشأ المرضى\nالطبيين في تونس',
    originSub: 'التوزيع الديمغرافي للمرضى الدوليين المستقبَلين\nفي منشآتنا.',
    bars: [
      { label: 'الجزائر', pct: 70 },
      { label: 'ليبيا (ذروة العيادات)', pct: 80 },
      { label: 'إفريقيا جنوب الصحراء', pct: 15, fill: '#59DBBD' },
      { label: 'أوروبا', pct: 15, fill: '#59DBBD' },
    ],
    donutValue: '100%',
    donutLabel: 'ثقة المريض',
    diagIntro: 'تشخيص هيكلي للتحديات الواجب رفعها لتعزيز القطاع.',
    diag: [
      {
        title: 'نقص الترويج',
        desc: 'ضعف الظهور الدولي المنظَّم وغياب حملات تواصل رقمي منسَّقة.',
        icon: 'megaphone',
      },
      {
        title: 'غموض الإشراف',
        desc: 'ضبابية الاختصاص بين وزارة الصحة ووزارة السياحة تعيق اتخاذ القرار.',
        icon: 'building',
      },
      {
        title: 'فوضى خارج طبية',
        desc: 'حاجة لتنظيم خدمات الاستقبال واللوجستيك والتيسير لضمان تجربة مريض متجانسة.',
        icon: 'alert',
      },
    ],
    actionsTitle: 'إجراءات ينبغي اتخاذها',
    actions: [
      {
        num: '1',
        title: 'تنسيق وزاري',
        desc: 'إرساء لجنة قيادة دائمة بين الصحة والسياحة لإطار تنظيمي موحّد.',
      },
      {
        num: '2',
        title: 'ترويج عبر الشبكات',
        desc: 'إطلاق حملات تسويق ترابي موجَّهة عبر شبكات متخصصة ووسائل إعلام صحية دولية.',
      },
    ],
  },
}

import { EXTRA_GROUPEMENT_LOCALES } from './groupement-custom-locales-extra'

export const CUSTOM_GROUPEMENT_LOCALES: Record<string, Record<string, PageOverlay>> = {
  en: {
    'hebergements-alternatifs': HEB_EN,
    'tourisme-culturel': CULT_EN,
    'tourisme-de-sante': SANTE_EN,
    'tourisme-medical': MED_EN,
    ...EXTRA_GROUPEMENT_LOCALES.en,
  },
  ar: {
    'hebergements-alternatifs': HEB_AR,
    'tourisme-culturel': CULT_AR,
    'tourisme-de-sante': SANTE_AR,
    'tourisme-medical': MED_AR,
    ...EXTRA_GROUPEMENT_LOCALES.ar,
  },
}

export function deepMergePage(
  base: CustomGroupementPage,
  overlay?: PageOverlay,
): CustomGroupementPage {
  if (!overlay) return base
  return {
    ...base,
    ...overlay,
    sections: {
      ...base.sections,
      ...(overlay.sections ?? {}),
    },
  }
}
