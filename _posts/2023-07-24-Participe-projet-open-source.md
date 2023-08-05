---
title: J'ai participé à un projet open source
date: 2023-07-24 13:00:00 +0200
categories: [Open source, Succès déverrouillé]
tags: [open source]     # TAG names should always be lowercase
img_path: /assets/img/posts/2023-07-24-Participe-projet-open-source/
---

> Dans cet article je raconte une histoire. Dans un soucis d'accessibilité au plus grand nombre les aspects techniques sont volontairement pas ou peu détaillées.

## Le contexte

Le code source de ce blog (images, article, éléments graphiques) est entreposé dans un repository (un dépôt) chez [GitHub](https://github.com/). Chaque fois que je corrige une faute ou que je publie un nouvel article, je pousse mes changements dessus. Seulement le problème, c'est que malgré les relectures il arrive parfois que des coquilles ou des fautes subsistent et viennent enlaidir l'article.  

Et les coquilles comme les fautes, c'est caca boudin j'en veux pas.

Quand j'ai monté ce blog, j'ai donc rapidement cherché à mettre en place une GitHub Action m'empêchant de publier un article contenant des fautes.

## Une GitHub Action, quoi qu'est-ce?

![Une GitHub Action, c'est très simple](cest-tres-simple.jpg){: w="500" h="280" }

C'est un fichier contenant des instructions suivies par GitHub.  
On peut faire un tas de chose avec une GitHub Action, par exemple lors de l'ajout d'une fonction à une application, l'Action va:

* Lancer des tests automatisés sur le code
* Envoyer par mail le rapport des tests
* Compiler le code source du projet
* Publier la résultante d'une compilation comme nouvelle version de l'application

En cherchant une GitHub Action répondant à ma problématique, j'ai découvert Spellcheck.

## Spellcheck, meilleurs ami du rédacteur

[Spellcheck](https://github.com/rojopolis/spellcheck-github-actions) est donc une GitHub Action développée par [Robert 'rojopolis' Jordan](https://github.com/rojopolis). Son but est de parcourir les fichiers contenant du texte, et de relever des fautes de langues (français, anglais, etc...) et de langage technique (Python, Markdown, etc...).  

J'ai besoin d'éliminer les fautes:

* En Markdown pour le langage technique (utilisé pour écrire les articles du blog)
* En français pour la langue

Spellcheck répond au besoin, alors allons-y, ouvrons la documentation et en avant Guingamp:

`.github/workflows`

```yaml
name: Spellcheck Action
on: push

jobs:
  build:
    name: Spellcheck
    runs-on: ubuntu-latest
    steps:
    # The checkout step
    - uses: actions/checkout@v3
    - uses: rojopolis/spellcheck-github-actions@v0
      name: Spellcheck
      with:
        config_path: .github/workflows/.spellcheck.yml
        output_file: spellcheck-output.txt
```

Très bien, tout est en place, il est temps de faire ronronner la bête.

## Et là, c'est le drâme

Aussitôt un problème se pose: ça marche.
![Une action qui marche quand ça de devrait pas](1-action-false-success.png)
_Même quand ça marche, un informaticien peut émettre le bruit de grognement de Tahiti Bob_

C'est agaçant et en même temps ça ne m'étonne pas, j'ai l'habitude d'essuyer des plâtres...

**Ça marche, c'est pas censé être une bonne nouvelle?**  
Pas ici, parce que quand on regarde les infos rapportées par l'Action, il y a bien des fautes:

```text
(...)
Misspelled words:
<htmlcontent> _posts/2023-07-04-Bujur-le-monde.md: html>body>p
--------------------------------------------------------------------------------
LHOMME
Nicolas
height
width
--------------------------------------------------------------------------------


!!!Spelling check failed!!!
```

La configuration de l'Action semble cohérente et la documentation de rojopolis a été suivie, vérifiée et re-vérifiée. Il y a forcément quelque chose que j'ai râté.  
Après près de 45 minutes de modifications, de tests dans tous les sens et de recherches infructueuses des problèmes connus de Spellcheck, il faut se rendre à l'évidence: je suis dans une impasse et j'ai besoin d'aide.

Et comme Spellcheck est un projet libre, je peux soumettre directement aux développeurs mon problème en ouvrant [une issue](https://github.com/rojopolis/spellcheck-github-actions/issues/166).

Pour rester synthétique ici (l'issue est longue), voici comment elle se présente:

* Formules de politesse (nous sommes des gens civilisés)
* Détail complet de la configuration de mon Action
* Expression du résultat attendu (l'Action doit échouer)
* Détail du résultat constaté (l'Action se termine avec succès)
* Demande d'assistance pour trouver ce que j'ai râté

## Cause du problème

C'est [Jonas 'jonasbn' Brømsø](https://github.com/jonasbn), un des développeurs de Spellcheck, qui a pris en charge ma demande.
Je lui ai communiqué un accès au code source du blog (contenant le code utilisé pour invoquer l'Action) et il a été en mesure de trouver d'où venait le problème: spécifier un fichier de sortie (`output_file`) dans l'Action fausse son résultat.  
Le grain de sable est cette ligne:

```yaml
        output_file: spellcheck-output.txt
```

Le fichier de sortie est un fichier texte qui va tracer les tâches effectuées par l'Action ainsi que leurs résultats. Ce n'est ni plus ni moins qu'un rapport.  
Les fautes d'ortraphe sont ainsi repérées et inscrites dans le fichier de sortie.

Le problème est le suivant: repérer les fautes ET les inscrire au fichier de sortie sont considérées comme **une seule et même tâche**. Celle-ci s'est correctement déroulée, d'où le signal de succès.  
Sauf que le résultat attendu est que l'Action, parce qu'elle a repéré des a repéré des fautes, renvoie un signal d'échec.

Ce comportement n'est ni prévu par les développeurs ni désiré: c'est un bug.

## Traitement du problème

### Simple

Comme je ne me sers pas du fichier de sortie, inutile de le garder. Supprimer sa spécification a permis de résoudre le problème dans mon cas.

### Basique

Comme exprimé précédemment, jonasbn est un des développeurs de Spellcheck, il a donc pris en charge la correction du bug [(lien du correctif)](https://github.com/rojopolis/spellcheck-github-actions/pull/168/files):

![Le correctif, en couleurs](2-pr-fix.png)
_En rouge, le code enlevé, en vert le code ajouté_

Une fois le correctif versé au code source de Spellcheck, jonasbn a publié une nouvelle version de Spellcheck (la [0.33.1](https://github.com/rojopolis/spellcheck-github-actions/releases/tag/0.33.1)), contenant le correctif:

![Le correctif, en couleurs](3-release-notes.png)
_nlhomme, c'est moué, je suis crédité au générique! :)_

## Conclusion

Il y a une idée reçue selon laquelle il faut être développeur pour contribuer à un projet open source. C'est archi faux et mon expérience le prouve, je ne suis moi même pas développeur. L'une des façons les plus simples de partciciper à un projet open source est de contribuer à la traduction d'un logiciel, dans sa langue natale ou non, et ainsi rendre un logiciel ou un service accessible à plus de monde.  
C'est aussi trouver des problèmes que les développeurs n'ont pas vu ou anticipé. Leur rapporter avec suffisement de détails va leur permettre de les guider dans leurs investigations et corriger le problème le plus vite possible et éviter que d'avantage de monde ne soit impactés.

![Succès déverrouillé: participer à un projet open source](4-achievement.png)
_Sensation ressentie par l'auteur quand son nom est apparu au générique_

## Pour aller plus loin

Si j'étais développeur, ou tout du moins si j'avais les compétences adéquates, j'aurais pu également corriger moi-même le bug. En effet, Spellcheck est un projet "open source" (en français on dirait "libre): n'importe qui peut consulter son code source, en récupérer une copie ou encore le modifier.  
Ainsi, j'aurais pu récupérer une copie du code, corriger le bug et soumettre le correctif aux développeurs.

C'est exactement la démarche que j'ai suivi avec le projet [Homebrew Cask](https://github.com/Homebrew/homebrew-cask), un gestionnaire de paquet pour macOS. La mise à jour du logiciel "Sublime Text" n'était pas possible à cause d'une erreur de vérification de la mise à jour.  
J'ai analysé l'erreur, l'ai traité et [envoyé le correctif](https://github.com/Homebrew/homebrew-cask/pull/152315) aux développeurs.
