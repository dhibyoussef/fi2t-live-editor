/**
 * Figma-unique groupement page content (from design-refs + css.css).
 * Used by custom HTML layouts — not the Agences accordion stub.
 */

import { GROUPEMENT_HUBS } from '../../lib/groupement-tree'

function hubChildren(slug: string) {
  return GROUPEMENT_HUBS.find((h) => h.slug === slug)?.children ?? []
}

export type IconCard = { title: string; desc?: string; icon?: string }
export type StatCard = { value: string; label: string; desc?: string; suffix?: string; icon?: string }
export type NumberedCard = { num?: string; title: string; desc: string }
export type PlaceCard = { name: string; tag: string; img: string }
export type BarItem = { label: string; pct: number; fill?: string }
export type TimelineItem = { num?: string; title: string; desc: string }

export type CustomGroupementPage = {
  heroTitle: string
  intro: string
  /** layout id → React switch */
  layout:
    | 'thalasso'
    | 'senior'
    | 'thermal'
    | 'medical'
    | 'aventure'
    | 'affaire'
    | 'golf'
    | 'plaisance'
    | 'auto'
    | 'hebergements'
    | 'culturel'
    | 'hub'
    | 'segment'
  // loosely typed section bags — each layout reads what it needs
  sections: Record<string, unknown>
}

export const CUSTOM_GROUPEMENT_PAGES: Record<string, CustomGroupementPage> = {
  thalassotherapie: {
    layout: 'thalasso',
    heroTitle: 'Thalassothérapie – Dr Kaouthar Meddeb',
    intro:
      "Découvrez l'alliance unique entre l'expertise médicale tunisienne et les vertus thérapeutiques millénaires de la mer Méditerranée.",
    sections: {
      splitTitle: 'Au cœur de la Santé par la Mer',
      splitBody: [
        "La thalassothérapie est l'utilisation combinée, sous surveillance médicale, des bienfaits du milieu marin : climat, eau de mer, boues marines, algues et autres substances extraites de l'Océan.",
        "Aujourd'hui, face à une demande croissante pour le tourisme de santé préventif, la Tunisie s'affirme comme un leader incontesté, offrant des protocoles de soin rigoureux dans un cadre de prestige.",
      ],
      splitImg: '/images/groupement-media/thalasso-split.jpg',
      atoutsTitle: 'Atouts du Secteur',
      atoutsSub: "Un écosystème conçu pour l'excellence et la performance.",
      atouts: [
        { title: '300+ Jours', desc: "D'ensoleillement annuel, favorisant l'héliothérapie naturelle.", icon: 'sun' },
        {
          title: 'Infrastructures de Prestige',
          desc: 'Centres intégrés dans des unités hôtelières 4* et 5* de haut standing.',
          icon: 'building',
        },
        { title: 'Technologie & Expertise', desc: 'Équipements de pointe et personnel médical hautement qualifié pour des soins personnalisés.', icon: 'tech' },
        { title: 'Rigueur Légale', desc: 'Législation stricte et normes ISO 17680 appliquées.', icon: 'scale' },
        { title: 'Compétitivité', desc: 'Un rapport qualité-prix inégalé sur le marché international.', icon: 'wallet' },
      ] satisfies IconCard[],
      diagnosticTitle: 'Diagnostic Économique',
      diagnostic: [
        {
          value: '60',
          label: 'CENTRES ACTIFS',
          desc: "Dont 15 centres actuellement en arrêt d'exploitation pour restructuration.",
        },
        {
          value: '10%',
          label: 'TAUX DE FRÉQUENTATION',
          desc: 'Moyenne annuelle reflétant un fort potentiel de croissance inexploité.',
        },
        {
          value: '48.7m',
          label: "CHIFFRE D'AFFAIRES (DT)",
          desc: 'Indicateur de la résilience du secteur malgré les défis conjoncturels.',
        },
      ] satisfies StatCard[],
      defisTitle: 'Défis Stratégiques',
      defisSub: 'Identification des points de friction structurels pour une vision prospective claire.',
      defis: [
        {
          title: 'Conflit Institutionnel',
          desc: 'Déséquilibre de tutelle entre le Ministère de la Santé et le Ministère du Tourisme.',
        },
        {
          title: "Déficit d'Investissement",
          desc: "Absence d'incitations fiscales spécifiques pour le renouvellement technique.",
        },
        {
          title: 'Gaps de Certification',
          desc: "Nécessité d'accélération de la mise aux normes internationales (ISO).",
        },
        {
          title: 'Concurrence',
          desc: 'Besoin de régulation contre la concurrence déloyale des structures non-homologuées.',
        },
      ] satisfies IconCard[],
      planTitle: 'Plan de Relance : 6 Actions Clés',
      plan: [
        { num: '01', title: 'Certification & Qualité', desc: 'Généralisation des normes ISO pour garantir une qualité de soin irréprochable et certifiée.' },
        { num: '02', title: 'Enrichissement Produits', desc: 'Intégration de soins énergétiques complémentaires pour une offre holistique moderne.' },
        { num: '03', title: 'Marketing Stratégique', desc: 'Collaboration ONTT/ONTH pour conquérir les marchés du Maghreb et du Moyen-Orient.' },
        { num: '04', title: 'Réforme Fiscale', desc: "Révision de la loi de finance pour corriger l'impact des mesures 2018-2019." },
        { num: '05', title: 'Contrôle Éthique', desc: "Mise en place d'une surveillance stricte pour assurer une concurrence saine et loyale." },
        { num: '06', title: 'Cadre Légal', desc: "Renforcement du rôle de l'Office National du Thermalisme et de l'Hydrothérapie." },
      ] satisfies NumberedCard[],
    },
  },

  'tourisme-senior': {
    layout: 'senior',
    heroTitle: 'Tourisme des Sénior',
    intro:
      "Avec l’augmentation de l’espérance de vie et le vieillissement de la population, le tourisme des seniors connaît une forte croissance. Disposant souvent de plus de temps libre, les voyageurs de 60 ans et plus recherchent des expériences authentiques, confortables et enrichissantes. D’ici 2050, cette tranche d’âge devrait atteindre 2,1 milliards de personnes dans le monde, tandis qu’en Europe, elle représente déjà près d’un quart des voyageurs internationaux. Cette évolution fait du tourisme senior un marché stratégique offrant de nombreuses opportunités pour développer des offres touristiques adaptées, accessibles et durables.",
    sections: {
      pourquoiTitle: 'Pourquoi la Tunisie ?',
      pourquoiSub: "Un ensemble d'atouts compétitifs faisant de notre pays une terre d'accueil privilégiée pour le troisième âge.",
      pourquoi: [
        {
          title: '300 jours de Soleil',
          desc: "Un climat tempéré idéal pour la santé osseuse et le bien-être moral tout au long de l'année.",
          icon: 'sun',
        },
        {
          title: 'Qualité des Soins',
          desc: 'Une expertise médicale reconnue internationalement et des infrastructures de santé de pointe.',
          icon: 'care',
        },
        {
          title: 'Coût Compétitif',
          desc: "Un pouvoir d'achat préservé permettant d'accéder à des services premium à des tarifs avantageux.",
          icon: 'euro',
        },
        {
          title: 'Facilité Linguistique',
          desc: "Une population francophone accueillante, facilitant l'intégration et la communication quotidienne.",
          icon: 'globe',
        },
        {
          title: 'Proximité Géographique',
          desc: 'À seulement 2 heures des principales capitales européennes, facilitant les visites familiales.',
          icon: 'plane',
        },
        {
          title: 'Sécurité & Stabilité',
          desc: 'Un environnement serein et sécurisé, essentiel pour une retraite paisible et épanouie.',
          icon: 'shield',
        },
      ] satisfies IconCard[],
      servicesTitle: 'Des Services Spécialisés & Humains',
      servicesSub:
        'Nous développons une offre multidimensionnelle répondant à chaque étape de la vie des séniors, du voyageur actif au résident nécessitant des soins spécifiques.',
      services: [
        { title: 'Structures de standing avec encadrement médical permanent.', icon: 'clinic' },
        { title: "Concepts de resorts dédiés à l'autonomie et au lien social.", icon: 'resort' },
        { title: 'Unités spécialisées avec approches thérapeutiques innovantes.', icon: 'pin' },
      ] satisfies IconCard[],
      defisTitle: 'Défis & Engagements',
      defisSub: "La FI2T s'engage à transformer les problématiques actuelles en standards d'excellence opérationnelle.",
      defis: [
        { title: 'Accessibilité', desc: "Réhabilitation d'hôtels pour une mobilité sans entrave.", icon: 'access' },
        { title: 'Sécurité', desc: "Protocoles de protection et d'assistance 24/7.", icon: 'shield' },
        { title: 'Confort', desc: 'Aménagements ergonomiques et services de conciergerie.', icon: 'comfort' },
        { title: 'Disponibilité', desc: 'Continuité des soins médicaux et paramédicaux.', icon: 'care' },
      ] satisfies IconCard[],
      roadmapTitle: 'Feuille de Route Stratégique',
      roadmapBody:
        'Notre groupement pilote les réformes nécessaires pour asseoir la Tunisie comme leader du tourisme médical et de retraite.',
      roadmap: [
        {
          num: '01',
          title: 'Assise Légale & Réglementaire',
          desc: "Établissement d'un cadre juridique spécifique facilitant l'investissement et le séjour longue durée des non-résidents.",
        },
        {
          num: '02',
          title: 'Certification & Qualité',
          desc: 'Lancement de labels de qualité "Fi2T Sénior Excellence" pour garantir des standards internationaux dans nos établissements.',
        },
        {
          num: '03',
          title: "Conventions d'Assurances",
          desc: "Négociation d'accords bilatéraux avec les caisses de sécurité sociale étrangères pour la prise en charge des soins en Tunisie.",
        },
        {
          num: '04',
          title: 'Marketing de Destination',
          desc: "Stratégie de communication digitale ciblée sur les marchés sources européens pour valoriser l'expertise santé tunisienne.",
        },
      ] satisfies TimelineItem[],
    },
  },

  'tourisme-thermal': {
    layout: 'thermal',
    heroTitle: 'Tourisme thermal',
    intro:
      "Le tourisme thermal est un tourisme de bien-être, un voyage à la poursuite du maintien ou de l'amélioration du bien-être personnel, en prenant soin du corps et de l'esprit.\nActuellement en plus du tourisme de bien être, des cures et mini cures thermales pour la prise en charge de toutes sortes de maladies est de plus en plus demandées par les pays voisins et les pays de l’union Européenne.",
    sections: {
      potTitle: 'Le Potentiel du Secteur',
      potSub:
        "Analyse comparative basée sur le modèle français, illustrant les perspectives de croissance pour l'infrastructure thermale tunisienne.",
      pot: [
        {
          value: '90',
          label: 'STATIONS THERMALES',
          desc: 'Capacité cible pour une exploitation optimale des sources.',
        },
        {
          value: '10M',
          label: 'JOURNÉES DE SOINS',
          desc: 'Volume annuel prévisionnel pour un marché mature.',
        },
        {
          value: '4.9 Md€',
          label: 'RETOMBÉES ÉCONOMIQUES',
          desc: "Impact direct et indirect généré par l'activité thermale globale.",
        },
      ] satisfies StatCard[],
      realTitle: 'Réalité du Produit en Tunisie',
      realBody:
        "La Tunisie possède des sources uniques au monde, alliant tradition et modernité. Malgré un potentiel immense, l'activité se concentre sur des pôles d'excellence historiques.",
      realMetricValue: '55 835',
      realMetricLabel: 'Visiteurs en 2018 (Record)',
      realMetricSub: "Un indicateur clé de l'attractivité croissante pour le thermalisme médical et de bien-être.",
      places: [
        { name: 'Korbous', tag: 'Pôle Historique', img: '/images/groupement-media/thermal-korbous-photo.jpg?v=8' },
        { name: 'Jebel Oust', tag: 'Excellence Médicale', img: '/images/groupement-media/thermal-jebel-photo.jpg?v=8' },
        { name: 'Hammam Bourguiba', tag: 'Retraite Nature', img: '/images/groupement-media/thermal-hammam-photo.jpg?v=8' },
        { name: 'Jerba Les Bains', tag: 'Rivage Bien-être', img: '/images/groupement-media/thermal-jerba-photo.jpg?v=8' },
      ] satisfies PlaceCard[],
      defisTitle: 'Défis & Problématiques Structurelles',
      defis: [
        {
          title: 'Conflits Institutionnels',
          desc: 'Dualité de tutelle entre la santé et le tourisme, créant des lenteurs administratives et des blocages réglementaires.',
          icon: 'building',
        },
        {
          title: "Déficit d'Incitation",
          desc: "Absence de mesures fiscales spécifiques pour stimuler l'investissement privé dans les infrastructures thermales lourdes.",
          icon: 'chart',
        },
        {
          title: 'Besoin de Certification',
          desc: 'Nécessité impérative de normalisation internationale pour garantir la qualité et l’attractivité des soins.',
          icon: 'shield',
        },
      ] satisfies IconCard[],
      roadmapTitle: 'Feuille de Route Stratégique',
      roadmap: [
        {
          num: '01',
          title: "Relancer l'Investissement",
          desc: 'Modernisation du cadre juridique pour attirer les capitaux étrangers et locaux.',
        },
        {
          num: '02',
          title: 'Exploitation Rationnelle',
          desc: 'Gestion durable et optimisée des ressources en eau minérale.',
        },
        {
          num: '03',
          title: 'Diversification',
          desc: "Élargir l'offre vers le bien-être, la remise en forme et le tourisme senior.",
        },
        {
          num: '04',
          title: 'Capital Humain',
          desc: 'Programmes de formation spécialisés pour le personnel thermal et médical.',
        },
        {
          num: '05',
          title: 'Génération de Devises',
          desc: 'Cibler les marchés internationaux à fort pouvoir d’achat.',
        },
        {
          num: '06',
          title: 'Développement Local',
          desc: 'Dynamisation des régions intérieures par le thermalisme de proximité.',
        },
      ] satisfies NumberedCard[],
    },
  },

  'tourisme-medical': {
    layout: 'medical',
    heroTitle: 'Tourisme médical',
    intro:
      "Le tourisme médical consiste à se rendre dans un autre pays pour bénéficier de soins de santé, souvent dans le but d'accéder à des traitements de meilleure qualité, plus rapides ou à moindre coût. Les patients sont également attirés par la disponibilité de certaines spécialités médicales et l'accès à des technologies de pointe. En pleine croissance à l'échelle mondiale, ce secteur représente un levier économique important pour les destinations d'accueil, tout en soulevant des enjeux liés à l'équité et à l'accès aux soins pour les populations locales.",
    sections: {
      advTitle: 'Avantages du Tourisme médical en Tunisie',
      adv: [
        {
          title: 'Coûts abordables',
          desc: 'Économies substantielles de 30% à 50% par rapport aux tarifs européens sans compromis sur la qualité.',
          icon: 'euro',
        },
        {
          title: 'Qualité des soins',
          desc: 'Plateaux techniques de pointe et corps médical formé selon les standards internationaux.',
          icon: 'care',
        },
        {
          title: 'Accessibilité',
          desc: "Proximité géographique stratégique avec l'Europe et le bassin méditerranéen (vols de -3h).",
          icon: 'plane',
        },
        {
          title: 'Expérience culturelle',
          desc: 'Convalescence dans un cadre méditerranéen propice à la récupération et au bien-être.',
          icon: 'globe',
        },
        {
          title: 'Services tout-compris',
          desc: 'Prise en charge intégrale : transfert aéroport, clinique, hébergement et suivi post- opératoire.',
          icon: 'clinic',
        },
        {
          title: 'Accompagnement Fi2T',
          desc: 'Coordination institutionnelle et défense des intérêts par notre groupement professionnel.',
          icon: 'shield',
        },
      ] satisfies IconCard[],
      originTitle: "Quels sont les principaux\npays d'origine des patients\nmédicaux en Tunisie",
      originSub: 'Répartition démographique de la patientèle internationale accueillie\ndans nos structures.',
      bars: [
        { label: 'Algérie', pct: 40 },
        { label: 'Libye (Pic cliniques)', pct: 35 },
        { label: 'Afrique Subsaharienne', pct: 15, fill: '#59DBBD' },
        { label: 'Europe', pct: 10, fill: '#59DBBD' },
      ] satisfies BarItem[],
      donutValue: '100%',
      donutLabel: 'CONFIANCE PATIENT',
      diagIntro: 'Diagnostic structurel des défis à relever pour consolider le secteur.',
      diag: [
        {
          title: 'Déficit de Promotion',
          desc: 'Manque de visibilité internationale structurée et absence de campagnes de communication digitale coordonnées.',
          icon: 'megaphone',
        },
        {
          title: 'Ambiguïté de Tutelle',
          desc: 'Flou juridictionnel entre le Ministère de la Santé et le Ministère du Tourisme, freinant la prise de décision.',
          icon: 'building',
        },
        {
          title: 'Anarchie Extra-médicale',
          desc: "Besoin de régulation des services d'accueil, de logistique et de facilitation pour garantir une expérience patient homogène.",
          icon: 'alert',
        },
      ] satisfies IconCard[],
      actionsTitle: 'Actions à entreprendre',
      actions: [
        {
          num: '1',
          title: 'Coordination Ministérielle',
          desc: 'Institutionnaliser un comité de pilotage permanent entre Santé et Tourisme pour un cadre réglementaire unifié.',
        },
        {
          num: '2',
          title: 'Promotion via Réseaux',
          desc: 'Lancement de campagnes de marketing territorial ciblées via des réseaux spécialisés et médias internationaux de santé.',
        },
      ] satisfies NumberedCard[],
    },
  },

  'tourisme-aventure': {
    layout: 'aventure',
    heroTitle: "Tourisme d'aventure",
    intro:
      "Le tourisme d'aventure ou le tourisme actif sont toutes les formes de produits touristiques induisant un effort physique ou sportif dans leurs pratiques et ce de préférence dans un milieu naturel : randonnées pédestres, équestres et cyclotourisme...",
    sections: {
      marketTitle: 'Potentiel du Marché Global',
      marketBody:
        'Une croissance sans précédent pour un segment autrefois de niche, devenu pilier stratégique.',
      market: [
        { value: '683B', label: 'MILLIARDS USD (2022)' },
        { value: '+17.4%', label: 'CROISSANCE PROJETÉE' },
      ] satisfies StatCard[],
      wealthTitle: 'Richesse Territoriale vs Exploitation',
      wealthBody:
        "La Tunisie possède un patrimoine naturel d'exception : de l'immensité du Sahara et du Grand Erg aux reliefs sculptés du Dahar, en passant par les forêts du Nord-Ouest et le littoral sauvage du Cap Bon.",
      wealthMetricValue: '8,000',
      wealthMetricLabel: 'Randonneurs par an (Estimation Fi2T)',
      wealthMetricSub:
        "Un chiffre dérisoire face au potentiel réel, illustrant un gisement d'opportunités encore inexploité.",
      photos: [
        '/images/groupement-media/aventure-1.jpg?v=2',
        '/images/groupement-media/aventure-2.jpg?v=2',
        '/images/groupement-media/aventure-3.jpg?v=2',
        '/images/groupement-media/aventure-4.jpg?v=2',
      ],
      freinsTitle: 'Freins à la Croissance',
      freinsSub: "Trois axes critiques bloquent aujourd'hui l'essor de la filière.",
      freins: [
        {
          title: 'Procédures sécuritaires',
          desc: "Gestion complexe des zones vertes et rouges, limitant l'accès aux sites les plus emblématiques du sud.",
          icon: 'shield',
        },
        {
          title: 'Promotion insuffisante',
          desc: "Manque de visibilité internationale sur les segments spécifiques de l'aventure et de l'itinérance.",
          icon: 'megaphone',
        },
        {
          title: 'Capital Humain',
          desc: "Carence en guides hautement spécialisés formés aux standards internationaux de l'aventure.",
          icon: 'people',
        },
      ] satisfies IconCard[],
      roadmapTitle: "Feuille de\nRoute Fi2T",
      roadmapSub: "Notre stratégie opérationnelle pour transformer le secteur d'ici 2026.",
      roadmap: [
        {
          num: '1',
          title: 'Coordination Inter-Ministérielle',
          desc: "Dialogue permanent avec le Ministère de l'Intérieur pour lever les obstacles sécuritaires et faciliter l'accès aux zones à fort potentiel.",
        },
        {
          num: '2',
          title: 'Pôle Formation & Métiers',
          desc: "Création de programmes de certification pour les guides d'aventure et les gestionnaires de gîtes ruraux et tourisme alternatif.",
        },
        {
          num: '3',
          title: 'Promotion Ciblée',
          desc: 'Présence offensive sur les réseaux spécifiques : foires internationales outdoor, salons spécialisés et accueils de presse étrangère.',
        },
      ] satisfies TimelineItem[],
    },
  },

  'tourisme-affaire': {
    layout: 'affaire',
    heroTitle: "Tourisme d'affaire",
    intro: '',
    sections: {
      mondialTitle: 'Poids Économique Mondial',
      mondial: [
        {
          value: '1.6 T',
          label: 'TRILLION USD',
          desc: "Valeur estimée du marché mondial du MICE d'ici 2030, représentant une force majeure de l'économie globale.",
        },
        {
          value: '+7%',
          label: 'CROISSANCE ANNUELLE',
          desc: 'Taux de croissance annuel composé (CAGR) projeté sur la période 2023- 2032 pour le secteur des affaires.',
        },
        {
          value: '9%',
          label: 'IMPACT TOURISTIQUE',
          desc: "Part du tourisme d'affaires dans le volume total du tourisme mondial, avec un panier moyen supérieur au loisir.",
        },
      ] satisfies StatCard[],
      tnTitle: 'Poids Économique en Tunisie',
      tnBody:
        "Le MICE n'est pas seulement une alternative au tourisme balnéaire ; c'est un moteur de désaisonnalisation et de montée en gamme pour l'hôtellerie tunisienne.",
      tnStats: [
        { value: '25%', label: "du chiffre d'affaires global du tourisme tunisien provient du segment affaires." },
        { value: '2x', label: 'Dépense moyenne journalière par rapport à un touriste de loisir classique.' },
        { value: 'Top 10', label: 'Positionnement historique en destination MICE régionale (Classement 2018).' },
      ] satisfies StatCard[],
      atoutsTitle: 'Les Atouts Stratégiques',
      atoutsSub:
        "Une combinaison unique d'infrastructures modernes, d'histoire millénaire et d'une position géographique centrale.",
      atouts: [
        {
          title: 'Tarifs compétitifs',
          desc: 'Un rapport qualité-prix inégalé dans le bassin méditerranéen pour les grands groupes.',
          icon: 'euro',
        },
        {
          title: 'Proximité',
          desc: "À moins de 3 heures des principales capitales européennes et hub vers l'Afrique.",
          icon: 'plane',
        },
        {
          title: 'Sites Uniques',
          desc: 'Salles de congrès dans des sites archéologiques ou bivouacs de luxe à Tozeur.',
          icon: 'landmark',
        },
        {
          title: '8,000+ Chambres',
          desc: "Capacité d'accueil massive de haut standing concentrée sur le Grand Tunis.",
          icon: 'building',
        },
      ] satisfies IconCard[],
      diagTitle: "Diagnostic\nStratégique\n&\nContraintes",
      diagBody: 'Une analyse rigoureuse des barrières à la croissance pour définir des actions précises.',
      diag: [
        {
          title: 'CONCURRENCE',
          desc: 'Émergence de nouvelles destinations régionales avec des budgets marketing agressifs et infrastructures neuves.',
          icon: 'chart',
        },
        {
          title: 'INFRASTRUCTURES',
          desc: 'Nécessité de rénover les centres de congrès historiques et de développer des pôles technologiques dédiés.',
          icon: 'building',
        },
        {
          title: 'PERCEPTION',
          desc: 'Transition nécessaire de l\'image "Low-Cost Balnéaire" vers une image "Expertise Corporate & Luxe".',
          icon: 'eye',
        },
        {
          title: 'FORMATION',
          desc: 'Besoin crucial de montée en compétences pour le personnel logistique et évènementiel spécialisé MICE.',
          icon: 'people',
        },
      ] satisfies IconCard[],
      axesTitle: 'Feuille de Route & Actions Fi2T',
      axesSub: "Notre vision pour transformer le secteur d'ici 2026 à travers trois axes fondamentaux.",
      axes: [
        {
          num: 'AXE 01',
          title: "Coordination\nInter-Ministérielle",
          desc: 'Création d\'un "Task Force" permanent réunissant les ministères du Tourisme, de la Culture et de l\'Intérieur pour fluidifier l\'accueil des délégations et la sécurité des évènements d\'envergure.',
          link: 'GUICHET UNIQUE ADMINISTRATIF',
        },
        {
          num: 'AXE 02',
          title: "Promotion &\nInfrastructures",
          desc: 'Campagnes de promotion ciblées sur les marchés émetteurs à forte valeur ajoutée et accélération des partenariats Public-Privé pour la modernisation des centres de congrès nationaux.',
          link: 'PROMOTION DIGITALE B2B',
        },
        {
          num: 'AXE 03',
          title: "Facilitation\nPatrimoniale",
          desc: "Assouplissement des autorisations pour l'organisation de dîners de gala et d'évènements exclusifs sur les sites historiques et archéologiques classés, tout en garantissant leur préservation.",
          link: 'PROTOCOLE DE PROTECTION DU PATRIMOINE',
        },
      ],
    },
  },

  'tourisme-golfique': {
    layout: 'golf',
    heroTitle: 'Tourisme golfique',
    intro: '',
    sections: {
      potTitle: 'Le Potentiel Mondial',
      potSub:
        "Le segment du golf représente l'une des niches les plus lucratives et dynamiques du tourisme international moderne.",
      pot: [
        { value: '15 Md€', label: 'VALEUR ANNUELLE MONDIALE', icon: 'money' },
        { value: '+15%', label: 'CROISSANCE ANNUELLE MOYENNE', icon: 'chart' },
        { value: '65M', label: 'JOUEURS DANS LE MONDE', icon: 'people' },
      ],
      banner: "Un touriste golfeur dépense en moyenne **50% de plus** qu'un touriste balnéaire classique.",
      etatTitle: "L'État des Lieux en Tunisie",
      etatBody:
        "Malgré un climat idéal et une position géographique stratégique, l'offre actuelle reste sous-exploitée par rapport à nos concurrents directs de la rive nord.",
      etatStats: [
        { value: '10 Parcours', label: 'Seulement 5 sont pleinement opérationnels' },
        { value: '60k Joueurs', label: 'Fréquentation annuelle moyenne' },
      ] satisfies StatCard[],
      etatBox: '<1%',
      etatBoxLabel: 'Pénétration du Marché Européen',
      etatBoxSub: 'Un potentiel de croissance massif pour la destination Tunisie sur le segment haut de gamme.',
      defisTitle: 'Défis Stratégiques',
      defisSub: 'Les freins identifiés par la Fi2T pour le développement du secteur',
      defis: [
        { title: 'COÛTS ÉLEVÉS', desc: 'Investissement massif et maintenance complexe des parcours.', icon: 'wallet' },
        { title: 'CONNECTIVITÉ', desc: 'Besoin de liaisons aériennes directes et fluides pour les golfeurs.', icon: 'plane' },
        { title: 'EAU & ÉCOLOGIE', desc: "Gestion critique des ressources en eau pour l'irrigation.", icon: 'drop' },
        { title: 'COMPÉTITIVITÉ', desc: 'Concurrence agressive des pays voisins méditerranéens.', icon: 'swords' },
      ] satisfies IconCard[],
      roadmapTitle: 'Feuille de Route Fi2T',
      roadmapSub:
        "Notre plan d'action articulé autour de 6 piliers majeurs pour transformer structurellement le tourisme golfique tunisien.",
      roadmap: [
        {
          num: '01',
          title: 'Densification des Parcours',
          desc: "Objectif d'un parcours pour 10 000 lits touristiques pour créer des clusters attractifs.",
        },
        {
          num: '02',
          title: "Incentives à l'Investissement",
          desc: 'Révision du cadre fiscal et incitations spécifiques pour les porteurs de projets golfiques.',
        },
        {
          num: '03',
          title: "Gestion de l'Eau",
          desc: 'Amélioration de la qualité des eaux traitées pour garantir une irrigation pérenne.',
        },
        {
          num: '04',
          title: 'Mise à Niveau Technique',
          desc: 'Modernisation des parcours existants pour répondre aux standards internationaux de difficulté.',
        },
        {
          num: '05',
          title: 'Promotion PPP',
          desc: 'Campagnes ciblées, salons internationaux et organisation de tournois de prestige.',
        },
        {
          num: '06',
          title: 'Importations Proshop',
          desc: "Facilitation administrative pour l'importation d'équipements et accessoires spécialisés.",
        },
      ] satisfies NumberedCard[],
    },
  },

  'tourisme-plaisance': {
    layout: 'plaisance',
    heroTitle: 'Tourisme la plaisance',
    intro: '',
    sections: {
      impactTitle: "Un Impact Économique\nDécuplé",
      impactCards: [
        {
          title: 'Ratio 20:1',
          desc: "Un touriste de plaisance génère en moyenne une dépense 20 fois supérieure à celle d'un touriste balnéaire classique.",
          icon: 'money',
        },
        {
          title: '1350 km de Littoral',
          desc: 'Une position stratégique au cœur de la Méditerranée, à quelques heures de navigation des côtes européennes.',
          icon: 'chart',
        },
      ] satisfies IconCard[],
      marinaImg: '/images/groupement-media/plaisance-marina.jpg?v=3',
      parentTitle: 'Le Parent Pauvre du Tourisme',
      parentIcon: '/images/groupement-media/plaisance-parent-icon.png?v=2',
      parentBody:
        'Malgré un potentiel immense, le yachting reste aujourd\'hui le "parent pauvre" de l\'écosystème touristique tunisien. Notre ambition est de transformer cet état de fait par une stratégie collective, ambitieuse et structurée pour positionner la Tunisie comme une destination de plaisance incontournable.',
      probTitle: 'Grandes Problématiques',
      probSub: 'Les 9 piliers stratégiques pour la refonte du secteur.',
      probs: [
        { title: 'Code des ports', desc: 'Modernisation du cadre juridique portuaire.' },
        { title: 'Concession', desc: 'Clarification des contrats de concession de plaisance.' },
        { title: 'Réglementation douanière', desc: 'Assouplissement des procédures douanières spécifiques.' },
        { title: 'Autorités sécuritaires', desc: 'Optimisation de la gestion des flux sécuritaires.' },
        { title: 'Produits et services', desc: "Montée en gamme de l'offre de services en marina." },
        { title: 'Demande locale', desc: 'Développement du marché de la plaisance domestique.' },
        { title: 'Animations nautiques', desc: "Création d'événements et de régates internationales." },
        { title: 'Marketing', desc: 'Promotion de la destination Tunisie Yachting.' },
        { title: 'Formation', desc: 'Professionnalisation des métiers du nautisme.' },
      ] satisfies IconCard[],
      actionsTitle: "Actions à\nentreprendre",
      actionsBody:
        "Une feuille de route concrète pour la transformation du secteur et l'amélioration de la compétitivité régionale de la Tunisie.",
      blueprint: '/images/groupement-media/plaisance-blueprint.jpg?v=3',
      actions: [
        'Volet législatif : Refonte globale',
        'Formation maritime de pointe',
        'Infrastructures & Services premium',
        'Compétitivité régionale accrue',
        'Communication & Branding international',
        'Unification des procédures douanières',
        'Levée des restrictions administratives',
        'Formations spécifiques adaptées au luxe',
      ],
    },
  },

  'tourisme-automobile': {
    layout: 'auto',
    heroTitle: 'Tourisme automobile',
    intro: '',
    sections: {
      visionTitle: 'Une Éclatante Vision de la Mobilité',
      visionBody:
        "Le tourisme automobile transcende le simple voyage routier. Il s'agit d'une immersion culturelle rythmée par les road trips thématiques, le caravaning de prestige et l'organisation de rallyes d'envergure internationale. C'est l'art de la découverte lente, favorisant l'accès à des territoires authentiques, souvent hors des sentiers battus.",
      stats: [
        {
          value: '10%',
          label: 'PIB MONDIAL',
          desc: 'Part générée par le tourisme automobile et ses écosystèmes dérivés.',
          tone: 'light',
        },
        {
          value: '25%',
          label: 'MODÈLE DE RÉUSSITE',
          desc: 'Part du PIB au Monténégro, exemple leader du tourisme itinérant structuré.',
          tone: 'dark',
        },
        {
          value: 'Euro',
          label: 'MARCHÉ PRIORITAIRE',
          desc: "L'Europe constitue le premier vivier de voyageurs motorisés autonomes au monde.",
          tone: 'light',
        },
      ],
      realTitle: 'Réalité du produit en Tunisie',
      realBody:
        'La Tunisie possède plusieurs atouts majeurs en matière de potentiel de développement en tourisme automobile :',
      realItems: [
        'Patrimoine riche',
        'Grande attractivité du sud tunisien',
        'Bonnes infrastructures routières',
        'Accessibilité : Sa proximité avec l\u2019Europe et un climat méditerranéen favorable peuvent attirer les visiteurs tout au long de l\u2019année',
        'Bonne connexion maritime avec l\u2019Europe (ports de Marseille, Gênes, Palerme, Naples...)',
      ],
      realImg: '/images/groupement-media/auto-road.jpg?v=2',
      actionsTitle: 'Actions à entreprendre',
      actionsItems: [
        'Pourquoi pas de bus à 2 étages à Tunis ? malgré leurs avantages : capacité accrue, efficacité économique cout/passager, expérience touristique améliorée, moins d\u2019espaces requis...',
        'La quasi absence de modes d\u2019hébergements adaptés au tourisme automobile en particulier les aires aménagées de camping caravaning (les véhicules qui viennent en Tunisie sont obligés de faire du camping caravaning sauvage)',
        'Absence de promotion dans les marchés cibles en Europe',
        'Absence de coordination et collaboration entre l\u2019Automobile Club de Tunisie (représentant exclusif de la FIA) et la Fédération Tunisienne des Sports Automobiles ce qui empêche l\u2019organisation de rallyes et autres événements.',
      ],
      actionsBody:
        'Actions à entreprendre : Promotion du secteur via les réseaux spécifiques : foires et salons spécialisés, magazines, invitation presse et médias spécialisés...Et surtout trouver un compromis entre l\u2019Automobile Club de Tunisie et la Fédération des Sports Automobile.',
      actionsImg: '/images/groupement-media/auto-hands.jpg?v=2',
    },
  },

  'hebergements-alternatifs': {
    layout: 'hebergements',
    heroTitle: "L'hébergement alternatif touristique",
    intro:
      "L'hébergement alternatif touristique fait partie d'un concept plus large connu sous le nom de tourisme alternatif, qui se distingue du tourisme de masse par son approche responsable et durable.",
    sections: {
      introLead: "l'hébergement alternatif touristique",
      introBody:
        "L'hébergement alternatif désigne des types de logements qui offrent une expérience unique et souvent immersive, en opposition aux structures hôtelières conventionnelles. Ce type d'hébergement peut inclure :",
      types: [
        {
          name: 'Eco-lodges',
          desc: "Conçus pour minimiser l'impact environnemental tout en offrant un confort.",
          img: '/images/groupement-media/heb-ecolodge-photo.jpg',
          wide: true,
        },
        {
          name: "Maisons d'hôtes",
          desc: "L'élégance du patrimoine architectural tunisien au service d'un accueil personnalisé et chaleureux.",
          img: '/images/groupement-media/heb-maisons-photo.jpg',
          wide: false,
        },
        {
          name: 'Hébergements Insolites',
          desc: 'Cabanes, habitats troglodytes ou palais en Médina pour une expérience de séjour unique et mémorable.',
          img: '/images/groupement-media/heb-insolites-photo.jpg',
          wide: false,
        },
        {
          name: "Séjours chez l'habitant",
          desc: 'Permettent aux voyageurs de vivre avec des familles locales, favorisant ainsi un échange culturel.',
          img: '/images/groupement-media/heb-habitant-photo.jpg',
          wide: true,
        },
      ],
      values: [
        {
          title: 'Durabilité',
          desc: "Ces hébergements sont souvent construits et gérés avec un souci de respect de l'environnement, utilisant des matériaux durables et des pratiques écologiques",
          icon: '/images/groupement-media/heb-value-durabilite.png?v=3',
        },
        {
          title: 'Authenticité',
          desc: "L'accent est mis sur la culture locale, permettant aux voyageurs de s'immerger dans les traditions et modes de vie des communautés",
          icon: '/images/groupement-media/heb-value-authenticite.png?v=3',
        },
        {
          title: 'Interaction',
          desc: 'Les voyageurs sont encouragés à interagir avec les habitants, ce qui enrichit leur expérience et soutient les économies locales',
          icon: '/images/groupement-media/heb-value-interaction.png?v=3',
        },
        {
          title: 'Impact',
          desc: "L'objectif est de générer des bénéfices pour les communautés locales tout en préservant leur patrimoine culturel et naturel",
          icon: '/images/groupement-media/heb-value-impact.png?v=3',
        },
      ] satisfies IconCard[],
      growthTitle: 'Un secteur en pleine croissance',
      growthBody:
        "L’hébergement alternatif touristique connaît une croissance continue et s’impose comme une solution de voyage plus responsable et authentique. En privilégiant les maisons d’hôtes, les gîtes ruraux ou les éco-lodges, les voyageurs soutiennent les économies locales tout en favorisant la préservation du patrimoine culturel et environnemental. En Tunisie, ce secteur représente une part croissante du marché touristique et génère des retombées économiques importantes pour les communautés locales. Porté par la demande pour des expériences durables et immersives, l’hébergement alternatif s’affirme comme un levier essentiel du tourisme de demain.",
      growthStats: [
        { value: '+20%', label: 'de croissance des maisons d’hôtes et gîtes ruraux (2019-2022)' },
        { value: '9%', label: 'du marché touristique tunisien' },
        { value: '50m', suffix: 'TND', label: 'générés pour les communautés locales en 2022' },
      ] satisfies StatCard[],
      diagTitle: 'Le Diagnostic Stratégique',
      diag: [
        {
          num: '01',
          title: 'Anarchie du Marché',
          desc: "L’étude Fi2T/EMHROD a démontré qu’il existe en Tunisie plus de 2500 hébergements alternatifs touristiques (sous différentes formes légales et illégales). Moins d’une centaine exercent avec un agrément officiel de l’ONTT",
          side: 'left',
        },
        {
          num: '02',
          title: 'Procédures',
          desc: 'Ceci prouve que le cadre légal et les procédures nécessitent révision et souplesse afin d’englober le maximum d’opérateurs dans le circuit légal',
          side: 'right',
        },
        {
          num: '03',
          title: 'Cahier des Charges',
          desc: 'un projet de cahier des charges a été élaboré depuis presque deux ans et n’a pas encore vu le jour. Il est à craindre que le projet de cahier des charges pose plus de contraintes que les lois',
          side: 'left',
        },
        {
          num: '04',
          title: 'Contrôle',
          desc: 'qui a la charge du contrôle des hébergements alternatifs : CRT, police touristique ..',
          side: 'right',
        },
      ],
    },
  },

  'tourisme-culturel': {
    layout: 'culturel',
    heroTitle: 'Tourisme culturel',
    intro:
      "Redécouvrir la Tunisie à travers le prisme de l'authenticité, du savoir-faire et de l'innovation institutionnelle.",
    sections: {
      stats: [
        {
          value: '40%',
          label: 'PART DU TOURISME INTERNATIONAL',
          desc: "Le tourisme culturel s'impose comme le segment moteur de la mobilité mondiale.",
          icon: 'globe',
        },
        {
          value: '3x',
          label: 'DÉPENSE PAR TOURISTE',
          desc: "Un profil de voyageur à haute valeur ajoutée, contribuant significativement à l'économie locale.",
          icon: 'euro',
        },
        {
          value: '10%',
          label: 'CONTRIBUTION AU PIB MONDIAL',
          desc: 'Une force économique transversale qui dépasse la simple visite de sites.',
          icon: 'chart',
        },
      ],
      atoutsTitle: 'Nos Atouts Stratégiques',
      atoutsBody:
        "La Tunisie n'est pas seulement une destination; c'est un carrefour de civilisations. De la légende d'Alyssa aux stratégies de Hannibal, nous portons 3000 ans d'histoire.",
      atouts: [
        { title: "3000 ANS D'HISTOIRE", desc: 'Un patrimoine archéologique unique en Méditerranée.', icon: 'landmark' },
        { title: 'PROXIMITÉ EUROPÉENNE', desc: 'Un accès rapide pour le marché émetteur principal.', icon: 'plane' },
      ] satisfies IconCard[],
      artisanImg: '/images/groupement-media/culturel-artisanat.png',
      quote: "\"L'artisanat est l'âme de notre territoire, le prolongement vivant de notre histoire.\"",
      diagTitle: 'Diagnostic Stratégique',
      diagSub: 'Identifier les leviers de croissance en adressant les défis actuels.',
      diag: [
        {
          title: 'Mise en Valeur',
          desc: "Besoin urgent de réhabiliter les sites et d'améliorer l'expérience visiteur sur place.",
          icon: '/images/groupement-media/culturel-diag-alert.png?v=4',
        },
        {
          title: 'Coordination',
          desc: "Nécessité d'une synergie accrue entre les ministères du Tourisme et de la Culture.",
          icon: '/images/groupement-media/culturel-diag-sync.png?v=4',
        },
        {
          title: 'Promotion',
          desc: 'Manque de visibilité ciblée sur les segments spécialisés à l’international.',
          icon: '/images/groupement-media/culturel-diag-megaphone.png?v=4',
        },
      ] satisfies IconCard[],
      roadmapTitle: 'Feuille de Route Institutionnelle',
      roadmapBody: 'Notre stratégie repose sur trois piliers fondamentaux pour transformer le potentiel en réalité économique.',
      roadmap: [
        { num: '01', title: 'Intégration Culturelle', desc: 'Créer des parcours touristiques liant patrimoine immatériel et sites archéologiques.' },
        {
          num: '02',
          title: 'Promotion Ciblée',
          desc: "Organisation d'eductours, invitations de presse spécialisée et présence dans les salons de niche.",
        },
        { num: '03', title: 'Digitization & Access', desc: 'Moderniser la billetterie et proposer des guides interactifs multilingues.' },
      ] satisfies TimelineItem[],
    },
  },

  /* —— Hubs (Accueil cards that open a child grid) —— */
  'tourisme-de-sante': {
    layout: 'hub',
    heroTitle: 'Tourisme de santé',
    intro:
      'Le tourisme de santé regroupe l’ensemble des séjours dont le motif principal est le soin, la prévention ou la remise en forme. La Tunisie y dispose d’un avantage rare : un corps médical reconnu, des infrastructures hôtelières intégrées aux centres de soin, une façade méditerranéenne et des ressources naturelles — eau de mer, boues, sources thermales — exploitées depuis l’Antiquité.\nCe pôle rassemble quatre filières qui partagent les mêmes clients, les mêmes canaux de distribution et les mêmes exigences de qualité. Les traiter ensemble permet de construire une offre lisible à l’international, de mutualiser la promotion et de parler d’une seule voix face aux autorités de santé, de tutelle et de transport.',
    sections: {
      hubSlug: 'tourisme-de-sante',
      lead: 'Soins médicaux, thalassothérapie, thermalisme et séjours séniors : quatre filières, une même promesse de santé méditerranéenne.',
      statsTitle: 'Le pôle en chiffres',
      stats: [
        {
          value: '4',
          label: 'FILIÈRES REPRÉSENTÉES',
          desc: 'Médical, thalassothérapie, thermal et séniors — pilotées au sein d’un même pôle.',
        },
        {
          value: '60',
          label: 'CENTRES DE THALASSOTHÉRAPIE',
          desc: 'Dont 15 à l’arrêt, en attente de restructuration et de remise à niveau.',
        },
        {
          value: '300+',
          label: 'JOURS D’ENSOLEILLEMENT / AN',
          desc: 'Un climat qui autorise les cures et l’héliothérapie sur l’ensemble de l’année.',
        },
        {
          value: '2 h',
          label: 'DE VOL DES MARCHÉS ÉMETTEURS',
          desc: 'Proximité immédiate des principales capitales européennes.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Le rôle de la Fi2T sur ce pôle',
      pillarsSub: 'Quatre chantiers transversaux menés pour l’ensemble des filières santé.',
      pillars: [
        {
          title: 'Qualité & accréditation',
          desc: 'Harmoniser les protocoles, accompagner les démarches d’accréditation et sécuriser la confiance du patient étranger.',
          icon: 'shield',
        },
        {
          title: 'Cadre réglementaire',
          desc: 'Porter auprès des autorités les adaptations nécessaires : visas médicaux, transfert de dossiers, statut des accompagnants.',
          icon: 'scale',
        },
        {
          title: 'Promotion internationale',
          desc: 'Une bannière « Tunisie Santé » commune sur les salons, auprès des assureurs et des agences spécialisées.',
          icon: 'megaphone',
        },
        {
          title: 'Formation & métiers',
          desc: 'Professionnaliser l’accueil multilingue, la coordination des séjours et les métiers du bien-être médicalisé.',
          icon: 'people',
        },
      ] satisfies IconCard[],
      gridTitle: 'Les filières du pôle santé',
      gridSub: 'Chaque filière dispose de sa fiche détaillée : diagnostic, atouts et actions à entreprendre.',
      children: hubChildren('tourisme-de-sante'),
      ctaTitle: 'Vous êtes un acteur du tourisme de santé ?',
      ctaBody:
        'Cliniques, centres de thalassothérapie et de cure, résidences séniors, agences spécialisées : rejoignez le groupement et participez aux travaux du pôle.',
      ctaLabel: 'Adhérer à la Fi2T',
      ctaTo: '/fiche-adhesion',
      eyebrow: 'Pôle du groupement',
      discoverCta: 'Découvrir la filière',
    },
  },
  'tourisme-sportif': {
    layout: 'hub',
    heroTitle: 'Tourisme sportif',
    intro:
      'Le tourisme sportif réunit les séjours motivés par la pratique d’une discipline, la préparation d’une saison ou la participation à une compétition. Il repose sur trois atouts tunisiens : un climat praticable toute l’année, des équipements de niveau international et des coûts d’accueil très compétitifs face aux destinations concurrentes du bassin méditerranéen.\nLe golf constitue la première filière structurée de ce pôle, la plus mature en termes d’équipements et de clientèle internationale. D’autres disciplines — stages de clubs, sports de raquette, cyclisme sur route, disciplines de plein air — rejoindront progressivement le groupement à mesure que leurs opérateurs s’organisent.',
    sections: {
      hubSlug: 'tourisme-sportif',
      lead: 'Un pôle bâti sur le climat, les équipements et la compétitivité tunisienne — avec le golf comme filière pilote.',
      statsTitle: 'Le pôle en chiffres',
      stats: [
        {
          value: '10',
          label: 'PARCOURS DE GOLF',
          desc: 'Répartis sur le littoral et le sud, dont 5 seulement sont pleinement opérationnels.',
        },
        {
          value: '60k',
          label: 'JOUEURS PAR AN',
          desc: 'Fréquentation annuelle moyenne des parcours tunisiens, très en deçà du potentiel.',
        },
        {
          value: '65M',
          label: 'PRATIQUANTS DANS LE MONDE',
          desc: 'Un marché mondial de 15 Md€ en croissance de +15 % par an.',
        },
        {
          value: '12 mois',
          label: 'DE SAISON EXPLOITABLE',
          desc: 'Un climat qui permet la pratique et les stages hors des pics touristiques.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Le rôle de la Fi2T sur ce pôle',
      pillarsSub: 'Structurer une offre sportive vendable et désaisonnalisée.',
      pillars: [
        {
          title: 'Équipements & entretien',
          desc: 'Remettre à niveau les installations sous-exploitées et sécuriser leur exploitation dans la durée.',
          icon: 'building',
        },
        {
          title: 'Packaging séjour',
          desc: 'Construire des forfaits « sport + hébergement + transfert » commercialisables auprès des tours opérateurs spécialisés.',
          icon: 'sync',
        },
        {
          title: 'Événements & compétitions',
          desc: 'Attirer tournois, stages de clubs et rencontres internationales, puissants leviers de notoriété.',
          icon: 'megaphone',
        },
        {
          title: 'Désaisonnalisation',
          desc: 'Utiliser le sport pour remplir les mois creux et allonger la durée moyenne de séjour.',
          icon: 'chart',
        },
      ] satisfies IconCard[],
      gridTitle: 'Les filières du pôle sportif',
      gridSub: 'Le golf ouvre le pôle ; les prochaines disciplines sont en cours de structuration.',
      children: hubChildren('tourisme-sportif'),
      ctaTitle: 'Votre discipline n’est pas encore représentée ?',
      ctaBody:
        'Clubs, académies, gestionnaires d’équipements et organisateurs d’événements sportifs : contactez-nous pour ouvrir une nouvelle filière au sein du pôle.',
      ctaLabel: 'Nous contacter',
      ctaTo: '/contact',
      eyebrow: 'Pôle du groupement',
      discoverCta: 'Découvrir la filière',
    },
  },
  'tourisme-nautique': {
    layout: 'hub',
    heroTitle: 'Tourisme nautique',
    intro:
      'Le tourisme nautique couvre l’ensemble des activités touristiques dont la mer est le support : plaisance et yachting, escales de croisière, sports de mer, événements et régates. Avec 1 350 km de côtes au cœur de la Méditerranée occidentale, la Tunisie se trouve sur la route naturelle des flottes européennes — à quelques heures de navigation de la Sicile, de la Sardaigne et des Baléares.\nLe potentiel reste largement sous-exploité : le cadre portuaire, les procédures douanières et le niveau de services en marina freinent encore l’escale et l’hivernage. Le pôle nautique porte ces sujets de façon coordonnée, en commençant par la filière plaisance, la plus avancée en termes de diagnostic et de feuille de route.',
    sections: {
      hubSlug: 'tourisme-nautique',
      lead: '1 350 km de côtes, une position centrale en Méditerranée et une filière plaisance à débloquer.',
      statsTitle: 'Le pôle en chiffres',
      stats: [
        {
          value: '1 350 km',
          label: 'DE LITTORAL',
          desc: 'Une position stratégique à quelques heures de navigation des côtes européennes.',
        },
        {
          value: '20:1',
          label: 'RATIO DE DÉPENSE',
          desc: 'Un plaisancier dépense en moyenne vingt fois plus qu’un touriste balnéaire classique.',
        },
        {
          value: '9',
          label: 'CHANTIERS PRIORITAIRES',
          desc: 'Du code des ports à la formation : les piliers identifiés pour refonder le secteur.',
        },
        {
          value: '12 mois',
          label: 'POTENTIEL D’HIVERNAGE',
          desc: 'Un climat qui permet de capter la maintenance et l’hivernage des unités européennes.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Le rôle de la Fi2T sur ce pôle',
      pillarsSub: 'Lever les freins réglementaires et monter en gamme sur les services.',
      pillars: [
        {
          title: 'Cadre portuaire',
          desc: 'Moderniser le code des ports et clarifier les contrats de concession des marinas.',
          icon: 'scale',
        },
        {
          title: 'Fluidité des escales',
          desc: 'Simplifier et unifier les procédures douanières et sécuritaires à l’arrivée comme au départ.',
          icon: 'sync',
        },
        {
          title: 'Services & maintenance',
          desc: 'Développer les services techniques, l’avitaillement et l’hivernage attendus par la clientèle yachting.',
          icon: 'tech',
        },
        {
          title: 'Animation & notoriété',
          desc: 'Régates, événements nautiques et promotion d’une véritable destination « Tunisie Yachting ».',
          icon: 'megaphone',
        },
      ] satisfies IconCard[],
      gridTitle: 'Les filières du pôle nautique',
      gridSub: 'La plaisance ouvre le pôle ; sports de mer et croisière suivront.',
      children: hubChildren('tourisme-nautique'),
      ctaTitle: 'Vous opérez sur le littoral ou en marina ?',
      ctaBody:
        'Gestionnaires de ports, chantiers, loueurs, clubs et prestataires nautiques : rejoignez le pôle et pesez sur les réformes en cours.',
      ctaLabel: 'Adhérer à la Fi2T',
      ctaTo: '/fiche-adhesion',
      eyebrow: 'Pôle du groupement',
      discoverCta: 'Découvrir la filière',
    },
  },

  /* —— New leaf pages (Accueil grid, no Figma artboard yet) —— */
  'tourisme-ecologique': {
    layout: 'segment',
    heroTitle: 'Tourisme écologique',
    intro:
      'Le tourisme écologique place la préservation des écosystèmes et le développement des territoires au cœur de l’expérience du voyageur. La Tunisie dispose pour cela d’un capital naturel rare et très diversifié : parcs nationaux, oasis de montagne et de plaine, zones humides classées, forêts du nord-ouest et littoral encore préservé.\nLe segment existe déjà sur le terrain, porté par des écolodges, des maisons d’hôtes rurales et des guides indépendants. Il souffre en revanche d’un déficit de structuration : offre éclatée, absence de référentiel commun et visibilité internationale insuffisante. Le groupement fédère ces opérateurs pour construire une offre lisible, certifiée et réellement commercialisable.',
    sections: {
      eyebrow: 'Groupement Fi2T',
      lead: 'Une offre nature déjà vivante sur le terrain, qu’il s’agit désormais de labelliser et de rendre commercialisable.',
      statsTitle: 'Le segment en chiffres',
      stats: [
        {
          value: '+20%',
          label: 'CROISSANCE DES GÎTES RURAUX',
          desc: 'Progression des maisons d’hôtes et gîtes ruraux entre 2019 et 2022.',
        },
        {
          value: '9%',
          label: 'DU MARCHÉ TOURISTIQUE',
          desc: 'Poids actuel des formes alternatives d’hébergement en Tunisie.',
        },
        {
          value: 'Europe',
          label: 'MARCHÉ PRIORITAIRE',
          desc: 'Les marchés européens sont les plus sensibles aux critères de durabilité.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Piliers du segment',
      pillars: [
        {
          title: 'Nature & biodiversité',
          desc: 'Parcs nationaux, réserves et itinéraires nature pour une découverte respectueuse des milieux.',
          icon: 'globe',
        },
        {
          title: 'Communautés locales',
          desc: 'Retombées économiques pour les territoires et savoir-faire locaux (artisanat, agriculture, guidage).',
          icon: 'care',
        },
        {
          title: 'Certification & labels',
          desc: 'Montée en gamme via des labels environnementaux et des chartes d’accueil durable.',
          icon: 'shield',
        },
      ] satisfies IconCard[],
      challengesTitle: 'Défis à relever',
      challenges: [
        'Fragmentation de l’offre et manque de packaging commercial clair.',
        'Besoin de formation des guides et d’opérateurs aux standards écotouristiques.',
        'Pression sur certains sites sensibles sans outils de gestion des flux.',
        'Visibilité internationale encore insuffisante face aux destinations concurrents.',
      ],
      actionsTitle: 'Actions Fi2T',
      actions: [
        'Cartographier et labelliser les opérateurs engagés.',
        'Construire des circuits écotouristiques commercialisables (B2B / B2C).',
        'Renforcer le dialogue avec les autorités environnementales et territoriales.',
        'Promouvoir le segment sur les marchés européens sensibles à la durabilité.',
      ],
      ctaTitle: 'Vous portez un projet d’écotourisme ?',
      ctaBody:
        'Écolodges, gîtes ruraux, guides nature et opérateurs de circuits durables : rejoignez le groupement et participez à la construction du référentiel.',
      ctaLabel: 'Adhérer à la Fi2T',
      ctaTo: '/fiche-adhesion',
    },
  },
  'tourisme-aeronautique': {
    layout: 'segment',
    heroTitle: 'Tourisme aéronautique',
    intro:
      'Le tourisme aéronautique regroupe l’aviation légère et de loisir, l’aviation d’affaires, les meetings aériens et l’ensemble des expériences construites autour du vol. Il s’appuie sur un maillage aéroportuaire dense, un réseau d’aéroclubs historiques et une position géographique charnière entre l’Europe et l’Afrique.\nC’est le segment le plus récent du groupement. Sa priorité n’est pas la promotion mais la structuration : identifier les opérateurs, cartographier les freins réglementaires qui pèsent sur l’aviation légère et d’affaires, et faire émerger des produits associant le vol à la découverte du territoire.',
    sections: {
      eyebrow: 'Groupement Fi2T',
      lead: 'Un segment en cours de structuration, où le premier chantier est réglementaire avant d’être commercial.',
      statsTitle: 'Le segment en chiffres',
      stats: [
        {
          value: '9',
          label: 'AÉROPORTS INTERNATIONAUX',
          desc: 'Un maillage qui couvre le littoral, le centre et le sud du pays.',
        },
        {
          value: '2 h',
          label: 'DE VOL DES HUBS EUROPÉENS',
          desc: 'Une accessibilité immédiate pour le charter et l’aviation d’affaires.',
        },
        {
          value: 'En création',
          label: 'GROUPEMENT DU SEGMENT',
          desc: 'Les opérateurs intéressés sont invités à se déclarer auprès de la fédération.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Piliers du segment',
      pillars: [
        {
          title: 'Connectivité',
          desc: 'Réseau aéroportuaire et potentiel de vols charter / aviation d’affaires.',
          icon: 'plane',
        },
        {
          title: 'Aviation légère',
          desc: 'Aéroclubs, baptêmes de l’air et tourisme sportif aérien à développer.',
          icon: 'tech',
        },
        {
          title: 'Événementiel',
          desc: 'Meetings aériens et expériences premium pour une clientèle internationale.',
          icon: 'megaphone',
        },
      ] satisfies IconCard[],
      challengesTitle: 'Défis à relever',
      challenges: [
        'Cadre réglementaire et procédures à fluidifier pour l’aviation légère et d’affaires.',
        'Infrastructures d’accueil (FBOs, hangars, services) encore limitées.',
        'Offre packagée (vol + séjour) peu visible auprès des tours opérateurs spécialisés.',
        'Coordination entre autorités aéronautiques, tourisme et opérateurs privés.',
      ],
      actionsTitle: 'Actions Fi2T',
      actions: [
        'Structurer le groupement et la représentation des opérateurs du segment.',
        'Identifier les freins réglementaires et proposer des mesures concrètes.',
        'Développer des produits « aviation + découverte du territoire ».',
        'Attirer des événements et des clients aviation d’affaires ciblés.',
      ],
      ctaTitle: 'Vous êtes un opérateur du secteur aérien ?',
      ctaBody:
        'Aéroclubs, exploitants, prestataires d’assistance et organisateurs d’événements aériens : déclarez-vous pour participer à la création du groupement.',
      ctaLabel: 'Nous contacter',
      ctaTo: '/contact',
    },
  },
  'tourisme-subaquatique': {
    layout: 'segment',
    heroTitle: 'Tourisme subaquatique',
    intro:
      'Plongée sous-marine, snorkeling, apnée et sports subaquatiques s’appuient sur un littoral de 1 350 km offrant une grande variété de sites : tombants rocheux du nord, épaves, herbiers de posidonie et réserves marines du sud. La ressource est réelle et la saison longue.\nLa filière reste toutefois hétérogène : les standards de sécurité et de formation varient d’un club à l’autre, les sites les plus fréquentés subissent une pression croissante et la commercialisation internationale demeure artisanale. Le groupement travaille ces trois axes de front — professionnalisation, protection et mise en marché.',
    sections: {
      eyebrow: 'Groupement Fi2T',
      lead: 'Une ressource sous-marine remarquable, à protéger et à professionnaliser avant de la vendre à l’international.',
      statsTitle: 'Le segment en chiffres',
      stats: [
        {
          value: '1 350 km',
          label: 'DE CÔTES PLONGEABLES',
          desc: 'Tombants, épaves et réserves marines répartis du nord jusqu’à Djerba.',
        },
        {
          value: '8 mois',
          label: 'DE SAISON EXPLOITABLE',
          desc: 'Des températures d’eau favorables du printemps à l’automne.',
        },
        {
          value: 'Europe',
          label: 'MARCHÉS ÉMETTEURS',
          desc: 'France, Italie et Allemagne concentrent les clubs et voyagistes plongée.',
        },
      ] satisfies StatCard[],
      pillarsTitle: 'Piliers du segment',
      pillars: [
        {
          title: 'Sites & biodiversité marine',
          desc: 'Fonds marins, épaves et réserves — un capital naturel à protéger et à valoriser.',
          icon: 'globe',
        },
        {
          title: 'Clubs & formation',
          desc: 'Réseau de centres de plongée, moniteurs certifiés et standards de sécurité.',
          icon: 'shield',
        },
        {
          title: 'Expériences premium',
          desc: 'Packages plongée + hébergement pour une clientèle européenne et régionale.',
          icon: 'care',
        },
      ] satisfies IconCard[],
      challengesTitle: 'Défis à relever',
      challenges: [
        'Hétérogénéité des standards de sécurité et de formation entre clubs.',
        'Protection des sites face à la pression touristique et à la pollution.',
        'Saisonnalité et dépendance aux flux balnéaires classiques.',
        'Marketing international encore peu structuré pour la plongée tunisienne.',
      ],
      actionsTitle: 'Actions Fi2T',
      actions: [
        'Harmoniser les bonnes pratiques et renforcer la professionnalisation des clubs.',
        'Co-construire avec les autorités des règles de protection des sites sensibles.',
        'Créer une offre packagée B2B pour les marchés plongée européens.',
        'Former et labelliser les opérateurs du groupement subaquatique.',
      ],
      ctaTitle: 'Vous exploitez un centre de plongée ?',
      ctaBody:
        'Clubs, moniteurs, loueurs de matériel et structures d’accueil : rejoignez le groupement pour porter les standards de la filière.',
      ctaLabel: 'Adhérer à la Fi2T',
      ctaTo: '/fiche-adhesion',
    },
  },
}

import {
  CUSTOM_GROUPEMENT_LOCALES,
  deepMergePage,
} from './groupement-custom-locales'

export function getCustomGroupementPage(
  slug: string,
  locale = 'fr',
): CustomGroupementPage | undefined {
  const base = CUSTOM_GROUPEMENT_PAGES[slug]
  if (!base) return undefined
  const lang = (locale || 'fr').split('-')[0]
  if (lang === 'fr') return base
  return deepMergePage(base, CUSTOM_GROUPEMENT_LOCALES[lang]?.[slug])
}
