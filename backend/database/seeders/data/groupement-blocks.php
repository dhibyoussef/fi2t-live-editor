<?php

/** @return array<int, array{title: string, icon: string}> */
function groupementPillars(): array
{
    return [
        ['title' => 'Secteur structurÃ©', 'icon' => '/images/g-icon-structure.svg'],
        ['title' => 'IntÃ©rÃªts professionnels', 'icon' => '/images/g-icon-interets.svg'],
        ['title' => 'Valeur ajoutÃ©e', 'icon' => '/images/g-icon-valeur.svg'],
        ['title' => 'Cadre rÃ©glementaire', 'icon' => '/images/g-icon-cadre.svg'],
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
        'enjeux.title' => $opts['enjeuxTitle'] ?? 'Enjeux stratÃ©giques',
        'enjeux.image' => $opts['enjeuxImage'] ?? '/images/groupement-enjeux.jpg',
        'enjeux.items' => json_encode($opts['enjeuxItems'] ?? [], JSON_UNESCAPED_UNICODE),
        'proposals.title' => $opts['proposalsTitle'] ?? 'Propositions stratÃ©giques',
        'proposals.items' => json_encode($opts['proposals'] ?? [], JSON_UNESCAPED_UNICODE),
    ];
}

/** @return array<string, string> */
function agencesDeVoyagesDefaults(): array
{
    return buildGroupementDefaults([
        'title' => 'Agences de voyages',
        'intro' => "La FÃ©dÃ©ration Interprofessionnelle du Tourisme Tunisien (FI2T) reprÃ©sente un ensemble d'acteurs engagÃ©s dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÃ€ travers ses membres, notamment les agences de voyages, la Fi2T Å“uvre pour :",
        'challenges' => [
            [
                'title' => 'Cadre rÃ©glementaire obsolÃ¨te',
                'body' => "â€¢ LÃ©gislation obsolÃ¨te ne tenant pas compte de la diversification des mÃ©tiers du voyage.\nâ€¢ Absence de reconnaissance formelle des :\n  - DMC,\n  - agences spÃ©cialisÃ©es,\n  - opÃ©rateurs de tourisme alternatif, culturel, sportif ou durable\n  - catÃ©gorie Tour OpÃ©rateur (surtout pour les opÃ©rateurs outgoing et DMC)\nâ€¢ ProcÃ©dures administratives lourdes et garanties financiÃ¨res dissuasives.",
                'constat' => "Constat FI2T : le cadre actuel freine l'innovation, encourage l'informel et pÃ©nalise les initiatives structurÃ©es.",
            ],
            [
                'title' => 'FragilitÃ© Ã©conomique des agences de voyages',
                'body' => "â€¢ Marges commerciales en constante compression face Ã  la concurrence des plateformes et des TO internationaux.\nâ€¢ Forte dÃ©pendance aux tour-opÃ©rateurs Ã©trangers et aux commissions rÃ©duites.\nâ€¢ SaisonnalitÃ© marquÃ©e limitant la trÃ©sorerie et la capacitÃ© d'investissement.\nâ€¢ AccÃ¨s difficile au financement bancaire et aux dispositifs de soutien.",
                'constat' => 'Constat FI2T : sans renforcement Ã©conomique, les agences ne peuvent ni moderniser ni rÃ©sister aux chocs.',
            ],
            [
                'title' => 'Insuffisante diversification',
                'body' => "â€¢ Offre encore trop centrÃ©e sur le tourisme balnÃ©aire de masse.\nâ€¢ Sous-exploitation des niches Ã  forte valeur (culturel, durable, sportif, MICE, senior).\nâ€¢ Manque de packaging et de mise en marchÃ© des produits diffÃ©renciÃ©s.\nâ€¢ Coordination insuffisante avec les autres filiÃ¨res de la FÃ©dÃ©ration.",
                'constat' => "Constat FI2T : la diversification est la condition d'un tourisme de valeur et de rÃ©silience.",
            ],
            [
                'title' => 'Retard numÃ©rique',
                'body' => "â€¢ Digitalisation partielle des process internes (rÃ©servation, CRM, reporting).\nâ€¢ Faible prÃ©sence et visibilitÃ© sur les canaux digitaux.\nâ€¢ Outils de distribution peu adaptÃ©s aux comportements clients actuels.\nâ€¢ Retard structurel face aux OTA et aux plateformes internationales.",
                'constat' => 'Constat FI2T : sans accÃ©lÃ©ration digitale, les agences perdent parts de marchÃ© et clients.',
            ],
            [
                'title' => 'DÃ©ficit de compÃ©tences',
                'body' => "â€¢ Besoin de formation continue sur les mÃ©tiers Ã©mergents du voyage.\nâ€¢ Lacunes en relation client digitale et en e-commerce.\nâ€¢ Manque de compÃ©tences en conception de produits d'expÃ©rience.\nâ€¢ Faible culture de la data et du yield management.",
                'constat' => 'Constat FI2T : la montÃ©e en compÃ©tences est un levier prioritaire de compÃ©titivitÃ©.',
            ],
        ],
        'enjeuxItems' => [
            'Positionner les agences de voyages comme acteurs centraux de la stratÃ©gie touristique nationale.',
            "Passer d'un tourisme de volume Ã  un tourisme de valeur, d'expÃ©rience et de durabilitÃ©.",
            'Renforcer la rÃ©silience Ã©conomique des agences.',
            "Favoriser l'investissement, l'innovation et l'emploi qualifiÃ©.",
            "RÃ©duire l'informel par un cadre incitatif et moderne.",
        ],
        'proposals' => [
            [
                'title' => 'RÃ©forme du cadre rÃ©glementaire (prioritÃ© FI2T)',
                'body' => "â€¢ RÃ©vision de la loi rÃ©gissant les agences de voyages.\nâ€¢ Reconnaissance officielle des nouvelles catÃ©gories d'opÃ©rateurs.\nâ€¢ Simplification et digitalisation des procÃ©dures administratives.\nâ€¢ RÃ©vision des garanties financiÃ¨res selon l'activitÃ© rÃ©elle et le risque.\nRÃ´le FI2T : force de proposition et partenaire technique de l'Ã‰tat dans la rÃ©forme.",
            ],
            [
                'title' => 'Soutien Ã  la diversification et Ã  la montÃ©e en gamme',
                'body' => 'Accompagner le dÃ©veloppement de produits diffÃ©renciÃ©s et Ã  forte valeur ajoutÃ©e, en lien avec les autres groupements de la FÃ©dÃ©ration.',
            ],
            [
                'title' => 'AccÃ©lÃ©ration de la transformation digitale',
                'body' => "Favoriser l'adoption d'outils numÃ©riques, la distribution en ligne et la modernisation des systÃ¨mes de rÃ©servation.",
            ],
            [
                'title' => 'Formation et professionnalisation',
                'body' => 'Programmes de formation continue pour renforcer les compÃ©tences mÃ©tier, commerciales et digitales des Ã©quipes.',
            ],
            [
                'title' => 'Gouvernance et dialogue publicâ€“privÃ©',
                'body' => 'Structurer un dialogue permanent avec les institutions pour aligner rÃ©glementation, investissement et stratÃ©gie nationale.',
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
        'intro' => "La FÃ©dÃ©ration Interprofessionnelle du Tourisme Tunisien (FI2T) reprÃ©sente les acteurs du segment Â« {$label} Â» engagÃ©s dans la modernisation, la diversification et la professionnalisation du tourisme tunisien.\nÃ€ travers ce groupement, la Fi2T Å“uvre pour :",
        'challenges' => [
            [
                'title' => 'Cadre rÃ©glementaire Ã  moderniser',
                'body' => "Adapter la rÃ©glementation aux rÃ©alitÃ©s actuelles du mÃ©tier et reconnaÃ®tre les nouvelles formes d'activitÃ©.",
                'constat' => "Constat FI2T : un cadre plus clair favorise l'investissement et limite l'informel.",
            ],
            [
                'title' => 'Structuration professionnelle',
                'body' => 'Renforcer la structuration du groupement, la qualitÃ© de service et la reprÃ©sentation collective.',
            ],
            [
                'title' => 'VisibilitÃ© et valorisation',
                'body' => "AmÃ©liorer la visibilitÃ© nationale et internationale de l'offre liÃ©e Ã  ce groupement.",
            ],
            [
                'title' => 'Transformation digitale',
                'body' => 'AccÃ©lÃ©rer la digitalisation des outils, de la distribution et de la relation client.',
            ],
            [
                'title' => 'CompÃ©tences et formation',
                'body' => 'DÃ©velopper des parcours de formation adaptÃ©s aux mÃ©tiers spÃ©cifiques du groupement.',
            ],
        ],
        'enjeuxItems' => [
            "Positionner Â« {$label} Â» comme un levier stratÃ©gique du tourisme tunisien.",
            "Passer d'un tourisme de volume Ã  un tourisme de valeur et d'expÃ©rience.",
            'Renforcer la rÃ©silience Ã©conomique des opÃ©rateurs du groupement.',
            "Favoriser l'investissement, l'innovation et l'emploi qualifiÃ©.",
            "RÃ©duire l'informel par un cadre incitatif et moderne.",
        ],
        'proposals' => [
            [
                'title' => 'RÃ©forme et accompagnement rÃ©glementaire',
                'body' => 'Proposer des Ã©volutions rÃ©glementaires adaptÃ©es et accompagner les opÃ©rateurs dans leur mise en conformitÃ©.',
            ],
            [
                'title' => 'Diversification et montÃ©e en gamme',
                'body' => 'Soutenir le dÃ©veloppement de produits diffÃ©renciÃ©s et de qualitÃ©.',
            ],
            [
                'title' => 'Transformation digitale',
                'body' => "AccÃ©lÃ©rer l'adoption d'outils numÃ©riques et de nouveaux canaux de distribution.",
            ],
            [
                'title' => 'Formation et professionnalisation',
                'body' => 'Mettre en place des programmes de formation continue pour les Ã©quipes.',
            ],
            [
                'title' => 'Dialogue publicâ€“privÃ©',
                'body' => 'Structurer un dialogue permanent avec les institutions et les partenaires du secteur.',
            ],
        ],
    ]);
}

/** @return array<string, array<string, string>> */
return [
    'agences-de-voyages' => agencesDeVoyagesDefaults(),
    'hebergements-alternatifs' => stubGroupementDefaults('HÃ©bergement alternatif'),
    'tourisme-culturel' => stubGroupementDefaults('Tourisme culturel'),
    'tourisme-de-sante' => stubGroupementDefaults('Tourisme de santÃ©'),
    'tourisme-aventure' => stubGroupementDefaults("Tourisme d'aventure"),
    'tourisme-affaire' => stubGroupementDefaults("Tourisme d'affaires"),
    'tourisme-ecologique' => stubGroupementDefaults('Tourisme Ã©cologique'),
    'tourisme-aeronautique' => stubGroupementDefaults('Tourisme aÃ©ronautique'),
    'tourisme-automobile' => stubGroupementDefaults('Tourisme automobile'),
    'tourisme-sportif' => stubGroupementDefaults('Tourisme sportif'),
    'tourisme-nautique' => stubGroupementDefaults('Tourisme nautique'),
    'tourisme-subaquatique' => stubGroupementDefaults('Tourisme subaquatique'),
    /** Extra detail page (design-refs) â€” not on Accueil 12-card grid */
    'tourisme-senior' => stubGroupementDefaults('Tourisme des sÃ©niors'),
];
