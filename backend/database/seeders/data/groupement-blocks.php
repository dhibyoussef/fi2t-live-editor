<?php

/** @return array<int, array{title: string, icon: string}> */
function groupementPillars(): array
{
    return [
        ['title' => 'Secteur structuré', 'icon' => '/images/g-icon-structure.svg'],
        ['title' => 'Intérêts professionnels', 'icon' => '/images/g-icon-interets.svg'],
        ['title' => 'Valeur ajoutée', 'icon' => '/images/g-icon-valeur.svg'],
        ['title' => 'Cadre réglementaire', 'icon' => '/images/g-icon-cadre.svg'],
    ];
}

/** @return array<string, string> */
function buildGroupementDefaults(array $opts): array
{
    return [
        'hero.image' => '/hero.jpg',
        'hero.title' => $opts['title'],
        'positioning.title' => 'Positionnement FI2T',
        'positioning.body' => $opts['intro'],
        'positioning.pillars' => json_encode($opts['pillars'] ?? groupementPillars(), JSON_UNESCAPED_UNICODE),
        'challenges.title' => $opts['challengesTitle'] ?? 'Positionnement FI2T',
        'challenges.items' => json_encode($opts['challenges'] ?? [], JSON_UNESCAPED_UNICODE),
        'enjeux.title' => $opts['enjeuxTitle'] ?? 'Enjeux stratégiques',
        'enjeux.image' => $opts['enjeuxImage'] ?? '/images/groupement-enjeux.jpg',
        'enjeux.items' => json_encode($opts['enjeuxItems'] ?? [], JSON_UNESCAPED_UNICODE),
        'proposals.title' => $opts['proposalsTitle'] ?? 'Propositions stratégiques',
        'proposals.items' => json_encode($opts['proposals'] ?? [], JSON_UNESCAPED_UNICODE),
    ];
}

/** @return array<string, string> */
function agencesDeVoyagesDefaults(): array
{
    return buildGroupementDefaults([
        'title' => 'Agences de voyages',
        'intro' => "La Fédération Interprofessionnelle du Tourisme Tunisien (FI2T) représente un ensemble d'acteurs engagés dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÀ travers ses membres, notamment les agences de voyages, la Fi2T œuvre pour :",
        'challenges' => [
            [
                'number' => '01',
                'title' => 'Cadre réglementaire obsolète',
                'body' => "• Législation obsolète ne tenant pas compte de la diversification des métiers du voyage.\n• Absence de reconnaissance formelle des :\n  - DMC,\n  - agences spécialisées,\n  - opérateurs de tourisme alternatif, culturel, sportif ou durable\n  - catégorie Tour Opérateur (surtout pour les opérateurs outgoing et DMC)\n• Procédures administratives lourdes et garanties financières dissuasives.",
                'constat' => "Constat FI2T : le cadre actuel freine l'innovation, encourage l'informel et pénalise les initiatives structurées.",
            ],
            [
                'number' => '02',
                'title' => 'Fragilité économique des agences de voyages',
                'body' => "Marges réduites, dépendance aux tour-opérateurs et saisonnalité forte limitent la capacité d'investissement et de modernisation des agences.",
            ],
            [
                'number' => '03',
                'title' => 'Insuffisante diversification',
                'body' => "L'offre reste trop concentrée sur le tourisme de masse, au détriment des produits à forte valeur ajoutée (culturel, durable, sportif, MICE).",
            ],
            [
                'number' => '04',
                'title' => 'Retard numérique',
                'body' => 'Digitalisation partielle des process, faible présence en ligne et outils de distribution insuffisamment adaptés aux nouveaux comportements clients.',
            ],
            [
                'number' => '05',
                'title' => 'Déficit de compétences',
                'body' => "Besoin de formation continue sur les métiers émergents, la relation client digitale et la conception de produits d'expérience.",
            ],
        ],
        'enjeuxItems' => [
            'Positionner les agences de voyages comme acteurs centraux de la stratégie touristique nationale.',
            "Passer d'un tourisme de volume à un tourisme de valeur, d'expérience et de durabilité.",
            'Renforcer la résilience économique des agences.',
            "Favoriser l'investissement, l'innovation et l'emploi qualifié.",
            "Réduire l'informel par un cadre incitatif et moderne.",
        ],
        'proposals' => [
            [
                'title' => 'Réforme du cadre réglementaire (priorité FI2T)',
                'body' => "• Révision de la loi régissant les agences de voyages.\n• Reconnaissance officielle des nouvelles catégories d'opérateurs.\n• Simplification et digitalisation des procédures administratives.\n• Révision des garanties financières selon l'activité réelle et le risque.\n\nRôle FI2T : force de proposition et partenaire technique de l'État dans la réforme.",
            ],
            [
                'title' => 'Soutien à la diversification et à la montée en gamme',
                'body' => 'Accompagner le développement de produits différenciés et à forte valeur ajoutée, en lien avec les autres groupements de la Fédération.',
            ],
            [
                'title' => 'Accélération de la transformation digitale',
                'body' => "Favoriser l'adoption d'outils numériques, la distribution en ligne et la modernisation des systèmes de réservation.",
            ],
            [
                'title' => 'Formation et professionnalisation',
                'body' => 'Programmes de formation continue pour renforcer les compétences métier, commerciales et digitales des équipes.',
            ],
            [
                'title' => 'Gouvernance et dialogue public–privé',
                'body' => 'Structurer un dialogue permanent avec les institutions pour aligner réglementation, investissement et stratégie nationale.',
            ],
        ],
    ]);
}

/** @return array<string, string> */
function stubGroupementDefaults(string $label): array
{
    $label = trim($label);

    return buildGroupementDefaults([
        'title' => $label,
        'intro' => "La Fédération Interprofessionnelle du Tourisme Tunisien (FI2T) représente les acteurs du segment « {$label} » engagés dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÀ travers ce groupement, la Fi2T œuvre pour :",
        'challenges' => [
            [
                'number' => '01',
                'title' => 'Cadre réglementaire à moderniser',
                'body' => "Adapter la réglementation aux réalités actuelles du métier et reconnaître les nouvelles formes d'activité.",
                'constat' => "Constat FI2T : un cadre plus clair favorise l'investissement et limite l'informel.",
            ],
            [
                'number' => '02',
                'title' => 'Structuration professionnelle',
                'body' => 'Renforcer la structuration du groupement, la qualité de service et la représentation collective.',
            ],
            [
                'number' => '03',
                'title' => 'Visibilité et valorisation',
                'body' => "Améliorer la visibilité nationale et internationale de l'offre liée à ce groupement.",
            ],
            [
                'number' => '04',
                'title' => 'Transformation digitale',
                'body' => 'Accélérer la digitalisation des outils, de la distribution et de la relation client.',
            ],
            [
                'number' => '05',
                'title' => 'Compétences et formation',
                'body' => 'Développer des parcours de formation adaptés aux métiers spécifiques du groupement.',
            ],
        ],
        'enjeuxItems' => [
            "Positionner « {$label} » comme un levier stratégique du tourisme tunisien.",
            "Passer d'un tourisme de volume à un tourisme de valeur et d'expérience.",
            'Renforcer la résilience économique des opérateurs du groupement.',
            "Favoriser l'investissement, l'innovation et l'emploi qualifié.",
            "Réduire l'informel par un cadre incitatif et moderne.",
        ],
        'proposals' => [
            [
                'title' => 'Réforme et accompagnement réglementaire',
                'body' => 'Proposer des évolutions réglementaires adaptées et accompagner les opérateurs dans leur mise en conformité.',
            ],
            [
                'title' => 'Diversification et montée en gamme',
                'body' => 'Soutenir le développement de produits différenciés et de qualité.',
            ],
            [
                'title' => 'Transformation digitale',
                'body' => "Accélérer l'adoption d'outils numériques et de nouveaux canaux de distribution.",
            ],
            [
                'title' => 'Formation et professionnalisation',
                'body' => 'Mettre en place des programmes de formation continue pour les équipes.',
            ],
            [
                'title' => 'Dialogue public–privé',
                'body' => 'Structurer un dialogue permanent avec les institutions et les partenaires du secteur.',
            ],
        ],
    ]);
}

/** @return array<string, array<string, string>> */
return [
    'agences-de-voyages' => agencesDeVoyagesDefaults(),
    'hebergements-alternatifs' => stubGroupementDefaults('Hébergements Alternatifs touristiques'),
    'tourisme-culturel' => stubGroupementDefaults('Tourisme culturel'),
    'thalassotherapie' => stubGroupementDefaults('Thalassothérapie'),
    'tourisme-senior' => stubGroupementDefaults('Tourisme des Sénior'),
    'tourisme-thermal' => stubGroupementDefaults('Tourisme thermal'),
    'tourisme-medical' => stubGroupementDefaults('Tourisme medical'),
    'tourisme-aventure' => stubGroupementDefaults("Tourisme d'aventure / Tourisme Alternatif"),
    'tourisme-affaire' => stubGroupementDefaults("Tourisme d'affaire"),
    'tourisme-golfique' => stubGroupementDefaults('Tourisme golfique'),
    'tourisme-plaisance' => stubGroupementDefaults('Tourisme la plaisance'),
    'tourisme-automobile' => stubGroupementDefaults('Tourisme automobile'),
];
