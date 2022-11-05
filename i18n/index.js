import { formAllativeCase, formGenitiveCase } from "../utils/string";

const i18n = {
  ["add-gift"]: {
    en: "Add gift",
    fi: "Lisää lahjatoive",
  },
  ["add-a-gift-to-your-wishlist"]: {
    en: "Add a gift to your wishlist",
    fi: "Lisää lahja toivelistallesi",
  },
  ["change-a-gift-on-your-wishlist"]: {
    en: "Change a gift on your wishlist",
    fi: "Muuta lahjaa toivelistallasi",
  },
  ["what-do-you-want"]: {
    en: "What do you want?",
    fi: "Mitä haluat?",
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
    fi: "Sisällytä tiedot, kuten koko, väri tai jotain erityistä haluamastasi lahjasta",
  },
  ["no-gifts"]: {
    en: "No gifts!",
    fi: "Ei lahjoja!",
  },
  ["you-haven't-claimed-any-gifts-yet"]: {
    en: "You haven't claimed any gifts yet",
    fi: "Et ole vielä lunastanut lahjoja",
  },
  ["my-wishlist"]: {
    en: "My wishlist",
    fi: "Toivelistani",
  },
  ["gifts-i'm-buying"]: {
    en: "Gifts I'm buying",
    fi: "Lahjat, jotka ostan",
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
    en: "You are buying",
    fi: "Ostat",
  },
  ["user-is-buying"]: {
    en: ({ name }) => `${name} is buying`,
    fi: ({ name }) => `${name} ostaa`,
  },
  ["for"]: {
    en: "for",
    fi: null,
  },
  ["nevermind-im-not-buying-this"]: {
    en: "Nevermind, I'm not buying this",
    fi: "Ei hätää, en osta tätä",
  },
  ["i'll-buy-it"]: {
    en: "I'll buy it!",
    fi: "Ostan tämän!",
  },
  ["back"]: {
    en: "Back",
    fi: "Takaisin",
  },
  ["you-want"]: {
    en: "You want...",
    fi: "Haluat...",
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
    en: "Where can you buy it?",
    fi: "Mistä sen voi ostaa?",
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
