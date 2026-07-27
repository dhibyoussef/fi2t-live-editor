export const FICHE_ADHESION_DEFAULTS: Record<string, string> = {
  'hero.image': '/hero.jpg',
  'hero.title': 'Fiche adhésion',

  'intro.title': 'Rejoignez la FI2T',
  'intro.body':
    "Devenez membre de la Fédération Interprofessionnelle du Tourisme Tunisien et participez activement à la modernisation, la diversification et la professionnalisation du tourisme tunisien.",

  'benefits.title': 'Pourquoi adhérer ?',
  'benefits.items': JSON.stringify([
    { title: 'Représentation', desc: 'Défense collective des intérêts professionnels auprès des autorités.' },
    { title: 'Réseau', desc: 'Accès à un réseau d’opérateurs et de partenaires du secteur.' },
    { title: 'Visibilité', desc: 'Valorisation de votre activité au sein de la Fédération.' },
    { title: 'Ressources', desc: 'Formations, informations et accompagnement métier.' },
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
}
