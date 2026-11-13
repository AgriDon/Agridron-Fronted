import {createI18n} from "vue-i18n";
import en from "./locales/en.json";
import es from "./locales/es.json";

const savedLocale = typeof localStorage !== 'undefined' ? localStorage.getItem('agridron_locale') : null;

const i18n = createI18n({
    legacy: false,
    locale: savedLocale || 'es',
    fallbackLocale: 'en',
    messages: { en, es }

});


export default i18n;