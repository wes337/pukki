import { formAllativeCase, formGenitiveCase } from "../utils/string";
import finnish from "./fi.mjs";

const i18n = {
  ...Object.fromEntries(Object.entries(finnish).map(([en, fi]) => [en, { en, fi }])),
  "invitation-signup": {
    en: ({ name }) => `${name} have invited you to join their family on Pukki. Sign in or create an account to share wishlists and choose gifts together.`,
    fi: ({ name }) => `Perhe ${name} kutsuu sinut mukaan Pukkiin. Kirjaudu sisään tai luo tili, niin voitte jakaa toivelistoja ja valita lahjoja yhdessä.`,
  },
  "about-name-origin": {
    en: <>Our name comes from <span lang="fi">Joulupukki</span>, the Finnish name for Santa Claus.
      It literally means &ldquo;Christmas goat&rdquo;, a nod to old Finnish Christmas traditions.</>,
    fi: <>Nimemme tulee Joulupukista. Sana pukki viittaa vanhoihin suomalaisiin jouluperinteisiin.</>,
  },
  "delete-account-instructions": {
    en: ({ email }) => <>Email {email} with your account email address to request account deletion. Do not include your password.</>,
    fi: ({ email }) => <>Pyydä tilisi poistamista lähettämällä viesti osoitteeseen {email}. Kerro tilisi sähköpostiosoite. Älä lähetä salasanaasi.</>,
  },
  "privacy-contact": {
    en: ({ email }) => <>Pukki is a family wishlist app by WesWare. For privacy questions or data requests, email {email}.</>,
    fi: ({ email }) => <>Pukki on WesWaren toivelistasovellus perheille. Tietosuojaa koskevat kysymykset ja tietopyynnöt voit lähettää osoitteeseen {email}.</>,
  },
  "privacy-data-requests": {
    en: ({ email }) => <>To request account deletion, a copy of your data, or a correction, email {email} with your account email address. We may need to verify that the account is yours. Do not send your password. Deleted data may remain in provider backups until those backups expire.</>,
    fi: ({ email }) => <>Voit pyytää tilisi poistamista, kopiota tiedoistasi tai tietojen korjaamista lähettämällä viestin osoitteeseen {email}. Kerro tilisi sähköpostiosoite. Saatamme joutua varmistamaan, että tili kuuluu sinulle. Älä lähetä salasanaasi. Poistetut tiedot voivat säilyä palveluntarjoajien varmuuskopioissa niiden säilytysajan loppuun asti.</>,
  },
  ["add-gift"]: {
    en: "Add gift",
    fi: "Lisää lahjatoive",
  },
  ["add-a-gift-to-your-wishlist"]: {
    en: "Add a gift to your wishlist",
    fi: "Lisää lahjatoive",
  },
  ["change-a-gift-on-your-wishlist"]: {
    en: "Change a gift on your wishlist",
    fi: "Muokkaa lahjatoivetta",
  },
  ["what-do-you-want"]: {
    en: "What do you want?",
    fi: "Mitä toivot?",
  },
  ["name-of-the-gift"]: {
    en: "Name of the gift",
    fi: "Lahjan nimi",
  },
  ["write-a-short-description"]: {
    en: "Write a short description",
    fi: "Kirjoita lyhyt kuvaus",
  },
  ["update-your-wishlist"]: {
    en: "Update your wishlist",
    fi: "Päivitä toivelistasi",
  },
  ["add-to-your-wishlist"]: {
    en: "Add to your wishlist",
    fi: "Lisää toivelistallesi",
  },
  ["include-details"]: {
    en: "Include details such as size, colour, or anything specific about the gift you want",
    fi: "Kerro esimerkiksi koko, väri tai muut lahjatoiveen tarkemmat tiedot",
  },
  ["no-gifts"]: {
    en: "No gifts!",
    fi: "Ei lahjoja!",
  },
  ["you-haven't-claimed-any-gifts-yet"]: {
    en: "You haven't chosen any gifts to give yet",
    fi: "Et ole vielä valinnut annettavia lahjoja",
  },
  ["my-wishlist"]: {
    en: "My wishlist",
    fi: "Toivelistani",
  },
  ["gifts-i'm-buying"]: {
    en: "Gifts I'm giving",
    fi: "Antamani lahjat",
  },
  ["sign-in-with"]: {
    en: "Sign in with",
    fi: "Kirjaudu sisään",
  },
  ["sign-out"]: {
    en: "Sign out",
    fi: "Kirjaudu ulos",
  },
  ["loading"]: {
    en: "Loading...",
    fi: "Ladataan...",
  },
  ["for-user"]: {
    en: ({ name }) => name,
    fi: ({ name }) => formAllativeCase(name, "fi"),
  },
  ["welcome"]: {
    en: ({ name }) => <>Welcome, {name}</>,
    fi: ({ name }) => <>Tervetuloa, {name}</>,
  },
  ["user's-wishlist"]: {
    en: ({ name }) => `${formGenitiveCase(name, "en")} wishlist`,
    fi: ({ name }) => `${formGenitiveCase(name, "fi")} toivelista`,
  },
  ["edit"]: {
    en: "Edit",
    fi: "Muokkaa",
  },
  ["delete"]: {
    en: "Delete",
    fi: "Poista",
  },
  ["you-are-buying"]: {
    en: "You're giving",
    fi: "Annat lahjaksi",
  },
  ["user-is-buying"]: {
    en: ({ name }) => `${name} is giving`,
    fi: ({ name }) => `${name} antaa lahjaksi`,
  },
  ["for"]: {
    en: "to",
    fi: null,
  },
  ["nevermind-im-not-buying-this"]: {
    en: "Never mind, I'm not giving this",
    fi: "En annakaan tätä lahjaksi",
  },
  ["i'll-buy-it"]: {
    en: "I'll give this",
    fi: "Annan tämän lahjaksi",
  },
  ["back"]: {
    en: "Back",
    fi: "Takaisin",
  },
  ["you-want"]: {
    en: "You want...",
    fi: "Toivot...",
  },
  ["link-to-gift-or-name-of-shop"]: {
    en: "Link to the gift online, or name of the shop",
    fi: "Linkki lahjaan verkossa tai liikkeen nimi",
  },
  ["user-wants"]: {
    en: ({ name }) => `${name} wants...`,
    fi: ({ name }) => `${name} toivoo...`,
  },
  ["where-can-you-buy-it"]: {
    en: "Where to find it",
    fi: "Mistä sen löytää?",
  },
  ["click-here"]: {
    en: "Click here!",
    fi: "Klikkaa tästä!",
  },
  ["gift-not-found"]: {
    en: "Gift not found",
    fi: "Lahjaa ei löytynyt",
  },
  ["user-hasn't-added-any-gifts-yet"]: {
    en: ({ name }) => `${name} hasn't added any gifts to their wishlist yet!`,
    fi: ({ name }) => `${name} ei ole vielä lisännyt lahjoja toivelistalleen!`,
  },
  ["you-haven't-added-any-gifts-yet"]: {
    en: "You haven't added any gifts to your wishlist yet. Click the add gift button below to get started!",
    fi: "Et ole vielä lisännyt lahjoja toivelistallesi. Aloita napsauttamalla alla olevaa Lisää lahja -painiketta!",
  },
  ["days-until-christmas"]: {
    en: ({ number }) => <>{number} days until Christmas</>,
    fi: ({ number }) => <>{number} päivää jouluun</>,
  },
};

export default i18n;
