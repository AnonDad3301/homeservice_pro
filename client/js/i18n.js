class I18n {
  constructor() {
    this.locale = 'ru';
    this.translations = {};
    this.loadTranslations();
  }

  async loadTranslations() {
    try {
      const response = await fetch(`/assets/translations/${this.locale}.json`);
      this.translations = await response.json();
      this.applyTranslations();
    } catch (error) {
      console.error('Ошибка загрузки переводов:', error);
    }
  }

  applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
      const key = element.getAttribute('data-i18n');
      if (this.translations[key]) {
        element.textContent = this.translations[key];
      }
    });
  }

  changeLanguage(lang) {
    this.locale = lang;
    document.cookie = `lang=${lang};path=/;max-age=31536000`;
    this.loadTranslations();
  }
}

const i18n = new I18n();

// Смена языка
document.querySelectorAll('.lang-switcher').forEach(button => {
  button.addEventListener('click', () => {
    i18n.changeLanguage(button.dataset.lang);
  });
});