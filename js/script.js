const API_BASE_URL = 'https://api.openai.com/v1';
const API_KEY = ''; // Inserisci qui il valore della API_KEY
const GPT_MODEL = 'gpt-3.5-turbo';

// ricaviamo gli elementi dalla pagina

const loader = document.querySelector('.carico');
const genreButtons = document.querySelectorAll('.genere');
const placeholder = document.querySelector('#segnaparte');
const stageTemplate = document.querySelector('#segna-quadro');
const gameoverTemplate = document.querySelector('#segna-fine');