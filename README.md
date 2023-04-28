# projetVueGlobeAerial

Ce projet permet d'afficher en temps réel les aviosn actuellements envol ou au sol qui sont disponibles depuis L'api Open Ske API. Le but est de suivre les avions sur une planète en 3D.

L'API est disponible ici : https://openskynetwork.github.io/opensky-api/index.html

## Installation

```sh
    Cloner le projet
```

## Project Setup
```sh
    npm install
```

## Lancer le projet
```sh
    npm run dev
```

## Fonctionnement de l'API

L'api est gratuite d'utilisation.

Mais elle utilise un système de crédit pour pouvoir l'utiliser. 
Si vous utiliser l'api sans compte (vous pouvez créer une compte depuis https://opensky-network.org/index.php?option=com_users&view=registration), vous aurez que 400 crédits par jour pour utiliser l'api.
Si vous avez un comtpe, vous pouvez le renseigner dans l'application et vous aurez 8000 crédits par jour.

## Fonctionnement du projet

De base, le projet défini des options par defaut :
    -Nombre d'avions affichés : 200 (Modifiable)
    -Interval de temps : 5000 ms (NON Modifiable)
    -Identifiant API (Modifiable)

J'ai limité certains options pour une question de performance sur le projet. Après ceci est totalement modifiable et c'est à votre risque si la performance se dégrade.

## Fonctionnement du projet

Sur l'application, l'utilisateur peut voir en 3D les avions sur le globe.

En haut à droite il peut ouvrir le menu Option pour pouvoir changer les options de l'application.

A Gauche, il peut retrouver les listes des avions et des aéroports. il a possibilité de rechercher depuis la barre de recherche.

Si il clique sur un avion ou aéroport depuis le menu, cela ouvre un menu et affiche les détails de l'objet sélectionnés. Met à jour l'affichage sur le planète (Changement de couleur, changement de caméra ( zoom ), track de l'avion)

Si il clique depuis un objet sur la planètre, cela ouvre un menu et affiche les détails de l'objet sélectionnés. Met à jour l'affichage sur le planète (Changement de couleur, changement de caméra ( zoom ), track de l'avion)

Il peut déselectionner l'objet soit en cliquand sur la croix dans le menu détails soit en double cliquant sur la planète.

## Contact
Armand HOUPIN : armand.houpin@ynov.com