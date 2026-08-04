export const FICHE_ADHESION_DEFAULTS: Record<string, string> = {
  'hero.image': '/images/desert-banner.jpg?v=1',
  'hero.title': 'Fiche adhésion',

  'intro.title': 'Rejoignez la FI2T',
  'intro.body':
    "Devenez membre de la Fédération Interprofessionnelle du Tourisme Tunisien et participez activement à la modernisation, la diversification et la professionnalisation du tourisme tunisien.",

  'adherer.title': 'Pourquoi adhérer à la Fi2T ?',
  'adherer.image': '/images/Rectangle 27.png',
  'adherer.badge': "50+\nMEMBRES ACTIFS",
  'adherer.badge_pos': JSON.stringify({ right: -26, bottom: -41 }),
  'adherer.per_page': '5',
  'adherer.reasons': JSON.stringify([
    {
      title: 'Représentation Institutionnelle',
      desc: 'Être représenté auprès des gouvernements et institutions',
    },
    {
      title: 'Réseautage Stratégique',
      desc: 'Participer à un réseau professionnel structuré',
    },
    {
      title: 'Visibilité Accrue',
      desc: 'Améliorer sa visibilité et ses opportunités commerciales',
    },
    {
      title: 'Label de Qualité',
      desc: 'Bénéficier d’un label de qualité et de conformité',
    },
    {
      title: 'Ressources & Expertise',
      desc: 'Accéder à des ressources professionnelles et formations, renforçant ainsi sa compétitivité sur le marché tunisien et international',
    },
  ]),

  'form.title': 'Demande d’adhésion',
  'form.label_org': 'RAISON SOCIALE',
  'form.placeholder_org': 'Nom de votre structure',
  'form.label_contact': 'NOM DU CONTACT',
  'form.placeholder_contact': 'Nom et prénom',
  'form.label_email': 'ADRESSE EMAIL',
  'form.placeholder_email': 'nom@exemple.com',
  'form.label_phone': 'TÉLÉPHONE',
  'form.placeholder_phone': '+216 XX XXX XXX',
  'form.label_activity': 'ACTIVITÉ / GROUPEMENT',
  'form.placeholder_activity': 'Ex: Agences de voyages',
  'form.label_message': 'MESSAGE',
  'form.placeholder_message': 'Présentez brièvement votre activité…',
  'form.submit': 'Envoyer la demande',
  'form.success': 'Merci — votre demande d’adhésion a bien été envoyée.',
}
