#!/usr/bin/env python3
"""Append remaining AR slugs to groupement-custom-locales-extra.ts"""
from pathlib import Path

TARGET = Path(__file__).resolve().parents[1] / "src/cms/defaults/groupement-custom-locales-extra.ts"

AR_REST = r"""
    'tourisme-senior': {
      heroTitle: 'سياحة كبار السن',
      intro:
        'مع تزايد متوسط العمر وتقدّم السكان في العمر، تشهد سياحة كبار السن نموًا قويًا. وغالبًا ما يمتلك المسافرون aged 60 عامًا فأكثر وقتًا أكبر، ويبحثون عن تجارب أصيلة ومريحة وم enriching. وبحلول 2050، يُتوقع أن يبلغ هذا age group 2.1 مليار شخص في العالم، بينما يمثّل في أوروبا اليوم نحو ربع المسافرين الدوليين. ويجعل هذا التطور من سياحة كبار السن سوقًا استراتيجيًا يتيح فرصًا عديدة لتطوير عروض سياحية ملائمة و accessible و sustainable.',
      sections: {
        pourquoiTitle: 'لماذا تونس؟',
        pourquoiSub: 'مجموعة مقومات تنافسية تجعل بلدنا وجهة مفضّلة لل Third age.',
        pourquoi: [
          { title: '300 يوم من الشمس', desc: 'مناخ معتدل م ideal لصحة العظام والرفاه النفسي طوال السنة.', icon: 'sun' },
          { title: 'جودة الرعاية', desc: 'خبرة طبية معترف بها دوليًا وبنى صحية متطورة.', icon: 'care' },
          { title: 'تكلفة تنافسية', desc: 'قدرة شرائية محفوظة تتيح الوصول إلى خدمات premium بأسعار ventajosas.', icon: 'euro' },
          { title: 'سهولة اللغة', desc: 'سكان francophones مرحّبون، مما يسهّل الاندماج والتواصل اليومي.', icon: 'globe' },
          { title: 'القرب الجغرافي', desc: 'ساعتان فقط من العواصم الأوروبية الرئيسية، مما يسهّل الزيارات العائلية.', icon: 'plane' },
          { title: 'الأمن والاستقرار', desc: 'بيئة هادئة وآمنة، ضرورية لتقاعد peaceful و fulfilled.', icon: 'shield' },
        ],
        servicesTitle: 'خدمات متخصّصة وإنسانية',
        servicesSub: 'نطوّر عرضًا متعدد الأبعاد يلبي كل مراحل حياة كبار السن، من المسافر النشط إلى الم resident بحاجة إلى رعاية خاصة.',
        services: [
          { title: 'هياكل راقية مع إشراف طبي دائم.', icon: 'clinic' },
          { title: 'مفاهيم منتجعات م dedicated للاستقلالية والترابط الاجتماعي.', icon: 'resort' },
          { title: 'وحدات متخصّصة بمقاربات علاجية م innovantes.', icon: 'pin' },
        ],
        defisTitle: 'تحديات والتزامات',
        defisSub: 'تلتزم الفيتو بتحويل الإشكاليات الراهنة إلى معايير تميّز operacional.',
        defis: [
          { title: 'إمكانية الوصول', desc: 'إعادة تأهيل الفنادق لحركة بلا عوائق.', icon: 'access' },
          { title: 'الأمن', desc: 'بروتوكولات حماية ومساعدة 24/7.', icon: 'shield' },
          { title: 'الراحة', desc: 'تجهيزات ergonomic وخدمات concierge.', icon: 'comfort' },
          { title: 'التوفر', desc: 'استمرارية الرعاية الطبية وال paramédicale.', icon: 'care' },
        ],
        roadmapTitle: 'خارطة الطريق الاستراتيجية',
        roadmapBody: 'يقود مجموعتنا الإ reformes اللازمة لتثبيت تونس كرائدة في السياحة الطبية وتقاعد.',
        roadmap: [
          { num: '01', title: 'أساس قانوني وتنظيمي', desc: 'وضع إطار juridique خاص يسهّل الاستثمار والإقامة طويلة الأمد لغير الم residents.' },
          { num: '02', title: 'الاعتماد والجودة', desc: 'إطلاق labels جودة "Fi2T Sénior Excellence" لضمان معايير دولية في منشآتنا.' },
          { num: '03', title: 'اتفاقيات التأمين', desc: 'تفاوض accords bilatéraux مع صناديق الضمان الاجتماعي الأجنبية لتغطية الرعاية في تونس.' },
          { num: '04', title: 'تسويق الوجهة', desc: 'استراتيجية communication digitale موجّهة على الأسواق الأوروبية المُصدِّرة لت valoriser الخبرة الصحية التونسية.' },
        ],
      },
    },
"""

text = TARGET.read_text(encoding="utf-8")
text = text.replace("تدفقات اليachting", "تدفقات yachting")
marker = "    /* __APPEND_AR2__ */"
if marker not in text:
    raise SystemExit("marker missing")
text = text.replace(marker, AR_REST.rstrip() + "\n  },\n}")
TARGET.write_text(text, encoding="utf-8")
print("lines:", len(text.splitlines()))
