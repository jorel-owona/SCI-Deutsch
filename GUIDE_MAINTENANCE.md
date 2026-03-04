# GUIDE DE MAINTENANCE - SCI DEUTSCH

Ce guide explique comment ajouter de nouvelles voitures à vendre ou modifier les informations existantes dans la section "Vente de Voitures".

## 1. Où se trouvent les données ?

Toutes les informations sur les voitures à vendre sont stockées dans le fichier :
`[script3.js](file:///home/jorel/Bureau/SCI%20deutsch/script3.js)`

Recherchez la variable nommée `const carsVente`. Elle ressemble à une liste d'objets entre crochets `[...]`.

## 2. Comment modifier une voiture existante ?

Chaque voiture possède plusieurs propriétés que vous pouvez modifier directement entre les guillemets :

```javascript
{
    id: 'identifiant-unique',
    name: 'Nom de la Voiture',
    category: 'suv', // ou 'berline', 'economique', 'luxe'
    price: 12000000, // Prix en chiffres sans espaces
    carburant: 'Essance', // 'Essance' ou 'Diesel'
    transmission: 'Automatique', // 'Automatique' ou 'Manuelle'
    places: 7,
    images: [
        'image/nom-image.jpeg', // Chemin de l'image principale
        'image/video.mp4',      // On peut aussi mettre une vidéo
        // ... autres images
    ],
    features: [
        'Caractéristique 1',
        'Caractéristique 2'
        // ...
    ]
}
```

### Étapes pour modifier :
1. Ouvrez `script3.js`.
2. Trouvez la voiture à modifier.
3. Changez la valeur après les deux-points `:`.
4. Enregistrez le fichier.

## 3. Comment ajouter une nouvelle voiture ?

Pour ajouter une voiture, il suffit de copier un bloc existant et de le coller à la suite dans la liste `carsVente`, en les séparant par une virgule.

### Exemple pour ajouter une deuxième voiture :
```javascript
const carsVente = [
    {
        id: 'voiture-1',
        // ... données voiture 1
    }, // <-- N'oubliez pas la virgule ici
    {
        id: 'nouvelle-voiture',
        name: 'Toyota RAV4',
        category: 'suv',
        price: 15000000,
        carburant: 'Essance',
        transmission: 'Automatique',
        places: 5,
        images: [
            'image/rav4_1.jpeg',
            'image/rav4_2.jpeg'
        ],
        features: [
            'Climatisation d\'origine',
            'Toit ouvrant'
        ],
        badges: ['Nouveau'],
        avis: 0,
        rating: 5
    }
];
```

## 4. Gestion des images

- Placez vos nouvelles images dans le dossier `image/`.
- Assurez-vous que le nom du fichier dans le code correspond exactement au nom du fichier dans le dossier (majuscules comprises).
- Formats recommandés : `.jpg`, `.jpeg`, `.png`, `.webp`.

## 5. Précautions importantes

- **Syntaxe** : Chaque ligne de propriété doit se terminer par une virgule `,`.
- **Accolades** : Chaque bloc de voiture commence par `{` et se termine par `}`.
- **Prix** : Ne mettez pas d'espaces ou de points dans le prix (ex: `12000000` et non `12 000 000`). Le site s'occupe tout seul d'ajouter les espaces à l'affichage.
