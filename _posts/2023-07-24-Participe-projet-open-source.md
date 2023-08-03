---
title: J'ai partcipé à un projet open source
date: 2023-07-24 13:00:00 +0200
categories: [Open source, Succès déverrouillé]
tags: [open source]     # TAG names should always be lowercase
img_path: /assets/img/posts/2023-07-24-Participe-projet-open-source/
---

> ℹ️ Dans cet article je raconte une histoire, aussi dans un soucis d'accessibilité au plus grand nombre les aspects techniques sont volontairement pas ou peu détaillées.

Avant de commencer mon histoire, il y a deux 3 choses que vous devez savoir:

Le code source de ce blog (images, article, éléments graphiques) est entreposé dans un repository (un dépôt) chez [GitHub](https://github.com/). Chaque fois que je corrige une faute ou que je publie un nouvel article, je viens pousser mes changements dessus. Seulement le problème, c'est que malgré les relectures il arrive parfois que des coquilles ou des fautes passent entre les mailles du filet et viennent enlaidir l'article. Et les coquilles comme les fautes, c'est caca boudin j'en veux pas.

Lorsque j'ai monté ce blog, j'ai rapidement cherché à mettre en place une GitHub Action m'empêchant de publier un article contenant des fautes.

## Une GitHub Action, mais quoi qu'est-ce?

C'est très simple.
C'est un fichier contenant des instructions suivies par GitHub selon certaines conditions. C'est aussi simple que cela.

On peut faire un tas de chose avec une GitHub Action. Si par exemple lors de l'ajout d'une fonction à une application, une GitHub Action peut:

* Lancer des tests automatisés
* Envoyer par mail le rapport des tests
* Compiler le code source d'un projet
* Publier la résultante d'une compilation comme nouvelle version de l'application

Et en cherchant une GitHub Action répondant à ma problématique, j'ai découvert

## Spellcheck, meilleurs ami du rédacteur

[Spellcheck](https://github.com/rojopolis/spellcheck-github-actions) est donc une GitHub Action développée par Robert 'rojopolis' Jordan. Son but est de parcourir les fichiers contenant du texte, et de relever des fautes de langues (français, anglais, etc...) et de language technique (Python, Markdown, etc...). Il est dit "open source" (en français on dirait "libre) car n'importe qui peut consulter son code source, en récupérer une copie ou encore le modifier.

J'ai besoin d'éliminer les fautes:

* En markdown pour le language technique (utilisé pour écrire les articles du blog)
* En français pour la langue

Spellcheck répond au besoin, alors allons-y, créons notre GitHub Action:

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

## Et là, c'est le drâme

Aussitôt un problème se pose: ça marche.
![Une action qui marche quand ça de devrait pas](1-action-false-success.png)
_Même quand ça marche, un informaticien peut émettre le bruit de grognement de Tahiti Bob_

C'est agaçant et en même temps ça ne m'étonne pas, j'ai l'habitude d'essuyer des plâtres...

**Ça marche, c'est pas censé être une bonne nouvelle?**  
Pas ici, parce que quand on regarde le détail du job, il y a des fautes:

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

La configuration de l'Action semble cohérente et la documentation de rojopolis a été suivie et revérifiée. Il y a forcément quelque chose que j'ai râté.  
Après près de 45 minutes de modifications, de tests dans tous les sens et de recherches infructueuses des problèmes connus chez Spellcheck, il faut se rendre à l'évidence: je suis dans une impasse et j'ai besoin d'aide.

Et comme Spellcheck est un projet libre, je peux soumettre directement aux développeurs mon problème en ouvrant ce que l'on appelle [une issue](https://github.com/rojopolis/spellcheck-github-actions/issues/166).

Pour rester synthétique ici (l'issue est longue), voici comment elle se présente:

* Formules de politesse (nous sommes des gens civilisés)
* Détail complet de la configuration de mon Action
* Expression du résultat attendu (l'Action doit échouer)
* Détail du résultat constaté (l'Action se termine avec succès)
* Demande d'assistance pour trouver ce que j'ai râté

## Cause du problème

C'est Jonas 'jonasbn' Brømsø, un des développeurs de Spellcheck, qui a pris en charge ma demande.
Je lui ai communiqué un accès au code source du blog (et par extension le code utilisé pour invoquer l'Action), et a été en mesure de trouver d'où venait le problème: spécifier un fichier de sortie (`output_file`) dans l'Action fausse son résultat. C'est cette ligne:

```yaml
        output_file: spellcheck-output.txt
```

Le fichier de sortie est un fichier texte qui va contenir les traces des tâches effectuées par l'Action ainsi que leurs résultats. Ce n'est ni plus ni moins qu'un rapport.  
Les fautes d'ortpraphe sont bien remontées, mais uniquement dans le fichier de sortie. Le remplissage de ce fichier se fait correctement. Ainsi GitHub considère que l'Action s'est correctement déroulée.

Ce comportement est considéré comme problématique car il n'est ni prévu par les développeurs ni désiré: c'est un bug.

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

Il y a une idée répandue selon laquelle il n'y a pas besoin d'être développeur pour contribuer à un projet open source. C'est vrai et mon expérience le prouve, je ne suis moi même pas développeur. L'une des façons les plus simples de partciciper à un projet open source est de contribuer à la traduction d'un logiciel, dans sa langue natale ou non, et ainsi rendre un logiciel ou un service accessible à plus de monde.  
C'est aussi trouver des problèmes que les développeurs n'ont pas vu ou anticipé. Leur rapporter avec suffisement de détails va leur permettre de les guider dans leurs investigations et corriger le problème le plus vite possible et éviter que d'avantage de monde ne soit impactés.

![Succès déverrouillé: participer à un projet open source](4-achievement.png)
_Sensation ressentie par l'auteur quand son nom est apparu au générique_
