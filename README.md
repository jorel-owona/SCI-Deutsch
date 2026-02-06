# SCI Deutsch

Site vitrine pour la gestion et valorisation de patrimoine immobilier.

## Description
Ce projet est un site web statique pour une Société Civile Immobilière (SCI), présentant ses services, ses biens et un formulaire de contact.

## Configuration requise

Ce projet utilise des services tiers qui nécessitent une configuration.

### EmailJS (Formulaire de contact)
Pour que le formulaire de contact fonctionne, vous devez créer un compte sur [EmailJS](https://www.emailjs.com/) et remplacer les valeurs suivantes dans le fichier `script.js` (lignes ~209-211) :

```javascript
const EMAILJS_PUBLIC_KEY = 'VOTRE_PUBLIC_KEY_EMAILJS';
const EMAILJS_SERVICE_ID = 'VOTRE_SERVICE_ID';
const EMAILJS_TEMPLATE_ID = 'VOTRE_TEMPLATE_ID';
```

### Supabase (Base de données)
Le projet est pré-configuré avec une instance Supabase. Si vous souhaitez utiliser votre propre instance, mettez à jour les constantes `SUPABASE_URL` et `SUPABASE_KEY` dans `script.js`.

## Utilisation locale
Ouvrez simplement le fichier `index.html` dans votre navigateur web préféré.
