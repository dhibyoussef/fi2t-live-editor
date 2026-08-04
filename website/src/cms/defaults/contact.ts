export const CONTACT_DEFAULTS: Record<string, string> = {
  'hero.image': '/images/desert-banner.jpg?v=1',
  'hero.title': 'Contact',

  'info.title': 'Informations de contact',
  'info.per_page': '3',
  'info.items': JSON.stringify([
    {
      icon: '/images/icon-address.svg',
      label: 'Adresse',
      value: "Rue du Lac Turkana, Les Berges du\nLac 1\n1053 Tunis, Tunisie",
    },
    {
      icon: '/images/icon-phone.svg',
      label: 'Téléphone',
      value: '+216 29 710 507',
    },
    {
      icon: '/images/icon-email.svg',
      label: 'Email',
      value: 'contact@fi2t.tn',
    },
  ]),

  'form.label_name': 'NOM COMPLET',
  'form.placeholder_name': 'Nom et prénom',
  'form.label_email': 'ADRESSE EMAIL',
  'form.placeholder_email': 'nom@exemple.com',
  'form.label_subject': 'SUJET',
  'form.placeholder_subject': 'Ex: Demande de...',
  'form.label_message': 'MESSAGE',
  'form.placeholder_message': 'Votre message ici...',
  'form.submit': 'Envoyer',
  'form.success': 'Merci — votre message a bien été envoyé.',
}
