---
title: J'ai fabriqué un plugin TRMNL pour les transports nantais
date: 2026-04-12 14:00:00 +0200
categories: [Projets, TRMNL]
tags: [trmnl, cloudflare, open data, Naolib, naolib]     # TAG names should always be lowercase
media_subpath: /assets/img/posts/2026-04-12-plugin-trmnl-naolib/
---

> Dans cet article je raconte comment j'ai bricolé un petit plugin pour mon TRMNL afin d'afficher les prochains passages de tramway et de bus à côté de chez moi. Les aspects techniques sont volontairement survolés pour que cela reste digeste.

## Le TRMNL, quoi qu'est-ce?

J'ai récemment acquis* un écran [TRMNL](https://trmnl.com) est un petit écran à jet d'encre (e-ink) posé sur un bureau ou accroché au mur. L'idée est simple : afficher au calme quelques informations utiles dans la journée, sans notification, sans lumière bleue, sans sollicitation permanente. Une sorte d'anti-smartphone, en somme.

L'appareil se rafraîchit à intervale régilier et on choisit ce qu'il affiche parmi une bibliothèque de "plugins" : la météo, un agenda, le cours d'une action, des citations, etc. Et quand un plugin n'existe pas, on peut en créer un.

*Cet article n'est pas sponsorisé par TRMNL, j'ai acheté l'appareil avec mes sous (non mais!).

## Le besoin

En parcourant le catalogue de plugins de la communauté TRMNL j'en ai vu un destiné [aux transports londoniens](https://github.com/stevekennedyuk/trmnl-tfl-status), réalisé par Steve Karmeinsky.

!["TFL Underground Status" affiche le status du métro de Londre sur un écran TRMNL](tfl-status.jpeg){: w="500" h="280" }
_TFL Underground Status" affiche le status du métro de Londres. J'aurais pu prendre une vraie photo..._

C'était super classe et ça m'a donnée envie d'en développer un pour ma ville bien aimée.

J'habite Nantes, et comme beaucoup de Nantais je prends régulièrement les transports en commun. Le réseau s'appelle ici [Naolib](https://www.naolib.fr). Avant de sortir, le rituel est toujours le même : sortir le téléphone, ouvrir l'app, attendre, regarder à quelle heure passe le prochain tram, ranger le téléphone.

Ce que j'aimerais, c'est lever les yeux vers mon TRMNL et voir les prochains départs. Sans déverrouiller quoi que ce soit, pour savoir si j'ai le temps de courrir après le bus.

## Le nerf de la guerre: les données

Immédiatement une question se pose: où récupérer les données?
Je n'ai ni le temps ni l'envie de créer une base de données, qui nécessite entretien et alimentation pour avoir les données les plus fraîches possibles.
Pour quelque chose d'aussi basique une solution doit déjà exister: pas question de réinventer la roue!

Bonne nouvelle : la communauté urbaine Nantes Métropole publie [les données Naolib via un portail d'open data](https://open.Naolib.fr/ewp/). Pas besoin de clé, pas de formulaire, pas d'inscription. On tape l'URL, on récupère les données (en JSON), on est content.
Une bonne surprise se présente aussitôt: les doonées présentes incluent les passages en temps réel. Certes l'écran du TRMNL se réactualise à intervalle régulier mais aps de dev supplémentaire pour gérer les interruptions de service (coupure de ligne, grêve, travaux, etc...)

Deux endpoints m'intéressent pour la suite :

* `arrets.json/{lat}/{lng}` : donne les arrêts à proximité d'un point
* `tempsattente.json/{codeLieu}` : donne les prochains départs d'un arrêt

## Un petit Cloudflare Worker au milieu

Le TRMNL sait interroger une URL et récupérer du JSON, mais il attend ce JSON dans un format bien précis, enveloppé dans `merge_variables`. Et surtout, il ne sait pas faire deux appels à la suite (d'abord l'arrêt, ensuite les départs).

Il me fallait donc un petit bout de code entre les l'écran TRMNL et l'API (la porte d'entrée de l'open data), un intermédiaire qui :

1. Reçoit une requête du TRMNL avec des coordonnées
2. Appelle l'API Naolib pour trouver l'arrêt le plus proche
3. Rappelle l'API Naolib pour récupérer les départs de cet arrêt
4. Met en forme le tout et le renvoie au TRMNL

J'ai choisi [Cloudflare Workers](https://workers.cloudflare.com) pour héberger ça : c'est gratuit, j'ai déjà un compte, ça se déploie en une commande, c'est l'outil parfait pour ce genre de petit bricolage.

Le code tient dans un seul fichier `worker.js` d'environ 70 de lignes, et il est versionné [sur GitHub](https://github.com/nlhomme/trmnl-naolib-status). Merci Claude pour le code du worker, sans toi j'aurais mis des semaines (je ne suis pas dev).

## Et là, c'est le drame (bis)

Premier déploiement, première surprise : le TRMNL n'affiche rien. Le Worker répond bien, les données sont là, mais le TRMNL fait la tête.

Je farfouille dans la documentation, je pose des questions, je teste des choses, et je finis par tomber sur plusieurs petits pièges qui, mis bout à bout, m'ont bien occupé :

* **Les données doivent être enveloppées.** Le JSON renvoyé par le Worker doit obligatoirement être dans `{ "merge_variables": { ... } }`. Sinon TRMNL ignore tout, sans prévenir.
* **Les erreurs HTTP sont traitresses.** Si le Worker renvoie un code 500 parce qu'il a planté, le TRMNL considère que toutes les données précédentes sont périmées et affiche du vide. Il vaut mieux toujours renvoyer un code 200, même en cas de pépin, et mettre l'erreur dans le corps de la réponse.

Mario, du support TRMNL, m'a aidé à débugger les vues, qui elless sont codées à la main.
Le framework est très complet et [très documenté](https://trmnl.com/framework/docs), mais je débute avec et je ne suis pas encore très à l'aise.

## Le résultat

Il existe quatre tailles d'affichage possibles sur le TRMNL (plein écran, demi horizontal, demi vertical, quart d'écran), et j'ai fait un template pour chacune. Au final, ça donne une liste propre des prochains départs, avec :

* Un badge carré arrondi pour les lignes de tramway
* Un badge en forme de pilule pour les bus
* Un point plein quand l'horaire est en temps réel
* Un point creux quand c'est un horaire théorique
* Le temps d'attente en minutes, ou "proche" quand c'est imminent

Et c'est tout. Pas de fioritures, pas d'animation, rien qui clignote. Juste les informations dont j'ai besoin avant de sortir de chez moi.

![L'écran TRMNL affiche les porochains tramways de l'arrêt Bretage](resultat.jpeg){: w="500" h="280" }
_Oh que c'est beau!_

## Pour aller plus loin

Le plugin est publié sur le [store communautaire TRMNL](https://trmnl.com/recipes/256931) depuis le 14 mars, il est donc utilisable par n'importe qui possédant l'appareil et habiNaolibt dans le périmètre de la Naolib. Le code du Worker et des templates sont [disponibles sur GitHub](https://github.com/nlhomme/trmnl-naolib-status) sous licence libre, et je serais très content que d'autres réseaux (Rennes ? Angers ? Brest ?) s'en inspirent pour faire leur propre version.

## Remerciements

* À Nantes Métropole pour l'ouverture des données de la Naolib, sans quoi ce projet n'existerait tout simplement pas.
* À Steve Karmeinsky pour le plugin londonien qui m'a servi de modèle.
* Aux équipes de TRMNL pour leur appareil étonnant et pour Mario qui m'a débloqué à la fin.
* À Anthropic pour Claude Code, qui m'a permis d'écrire le Worker en quelques minutes au lieu de quelques heures.
