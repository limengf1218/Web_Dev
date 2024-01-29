
import React from 'react';
import { useTranslation, Trans } from 'react-i18next';

const App = () => {
  const { t, i18n } = useTranslation(['translation']); /* The names of the translation files that will be used in the component. 
                                     You can include multiple or just leave it empty and look through all the translation files 
                                     but its better to just state only the ones you need. */

  const changeLanguage = code => {
    i18n.changeLanguage(code); /* Sends i81n the code of the language to change and the function in i18n.js takes this code and sets
                              it to the local storage variable. The language detector detects this and translates the text that
                              is either in a "t" function or inside a "Trans" component */
  };


  return (
    <div>
      <button type="button" onClick={() => {
        changeLanguage('sin');
      }}>
        {t('translation:sin', 'Sinhala')} //This basically tells the t function to look for the key 'sin' in the file 'translation'. The defult text is 'Sinhala'.
      </button>

      <button type="button" onClick={() => changeLanguage('en')}>
        {t('translation:en', 'English')} //The t function will trigger a "Suspense" if its not ready. This is why the Suspense is included in the index.js file
      </button>
      <p>
        <Trans i18nKey="translation:content.textTwo">
          Welcome at <strong>our place</strong>.
        </Trans>
      </p>
    </div>
  );
};

export default App;