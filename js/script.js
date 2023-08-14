const API_BASE_URL = 'https://api.openai.com/v1';
const API_KEY = ''; // Inserisci qui il valore della API_KEY
const GPT_MODEL = 'gpt-3.5-turbo';

// ricaviamo gli elementi dalla pagina

const loader = document.querySelector('.carico');
const genreButtons = document.querySelectorAll('.genere');
const placeholder = document.querySelector('#segnaparte');
const stageTemplate = document.querySelector('#segna-quadro');
const gameoverTemplate = document.querySelector('#segna-fine');

const chatIntera = [];

let genereScelto;

// DELINEAMO IL FUNZIONAMENTO DEL GIOCO

// Per ogni bottone dei generi
genreButtons.forEach(function(button){
    // quando viene cliccato
    button.addEventListener("click", function(){
        // 1. individuiamo il genere cliccato
        // button.dataset.genere
        // 2. lo facciamo diventare il genere scelto
        genereScelto = button.dataset.genere;
        // console.log(genereScelto);
        // 3. avviamo la partita
        inizioGioco();
    });
});

function inizioGioco(){
    // 1. fornisco la classe "gioco-avviato"
    document.body.classList.add("avvio-gioco");
    // 2. preparo le istruzioni iniziali per chat gpt
    chatIntera.push({
        role: `system`, // come deve comportarsi la IA
        content: `Voglio che ti comporti come se fossi un classico gioco di avventura testuale. Io sarò il protagonista e giocatore principale.
        Non fare riferimento a te stesso. L\'ambientazione di questo gioco sarà a tema ${genereScelto}. Ogni ambientazione ha una descrizione di 150 caratteri seguita da una array di 3 azioni possibili che il giocatore può compiere. 
        Una di queste azioni è mortale e termina il gioco. Non aggiungere mai altre spiegazioni. Non fare riferimento a te stesso.
        Le tue risposte sono solo in formato JSON come questo esempio:###{ "description":"descrizione ambientazione", "actions":["azione 1", "azione 2", "azione 3"]}###`
    });

    // 3. via al primo livello
    faiQuadro();
}

// funzione quadro-generatrice
async function faiQuadro(){
    // 0. sbacanto segna-parte
    placeholder.innerHTML = "";

    // 1. mostrare caricamento
    loader.classList.remove("invisibile");

    // 2. chiediamo a chat gpt di creare il quadro
    const rispostaGpt = await faiRichiesta("/chat/completions", {
        temperature: 0.7,
        model: GPT_MODEL,
        messages: chatIntera
    });

    
    // 3. nascondiamo caricam..
    loader.classList.add("invisibile");
    
    // 4. prendiamo la risposta di chat gpt e lo mettiamo in uno storico della conversazione
    const messaggio = rispostaGpt.choices[0].message;
    // console.log(messaggio);
    // 5. riprendiamo il contenuto del messaggio per estrapolare le azioni e la descrizione del livello
    chatIntera.push(messaggio);
    const contenuto = JSON.parse(messaggio.content);
    const azioni = contenuto.actions;
    const descrizione = contenuto.description;
    // console.log(azioni);
    // console.log(descrizione);
    console.log(contenuto);

    if(azioni.length === 0){
        setFine(descrizione);
    } else {
        // 6. facciamo vedere la descrizione del livello
        mostraQuadroDescrizione(descrizione);
        // 7. chiediamo a chat gpt di generare una immagine da mostrare nel livello
        await mostraImgQuadro(descrizione);
        // 8. mostriamo le azioni attuabili nel livello
        mostraAzioniQuadro(azioni);
    }
}

async function faiRichiesta(endpoint, payload){
    const url = API_BASE_URL + endpoint;

    const response = await fetch(url, {
        method: "POST",
        body: JSON.stringify(payload),
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + API_KEY
        }
    });

    const jsonRisposta = await response.json();
    return jsonRisposta;
}

// # funzione per mostrare la descrizione del quadro
function mostraQuadroDescrizione(descrizione) {
    // riprendere template del quadro
    const quadroElem = stageTemplate.content.cloneNode(true);
    // con la riga qua sopra stiamo dicendo di copiare tutto il contenuto dell'elemento stageTemplate
    // mettere la descrizione
    quadroElem.querySelector(".quadro-desc").innerText = descrizione;
    // mettiamo il template in pagina
    placeholder.appendChild(quadroElem);
}

// # funzione per mostrare l'immagine generata per il livello
async function mostraImgQuadro(descrizione) {
    // chiediamo prima di generare una img
    const imgGenerata = await faiRichiesta("/images/generations", {
        n: 1,
        size: "512x512",
        response_format: "url",
        prompt: `questa è una storia basata su ${genereScelto}. ${descrizione}`
    });
    const urlImg = imgGenerata.data[0].url;
    const immagine = `<img alt="${descrizione}" src="${urlImg}">`;
    document.querySelector(".quadro-img").innerHTML = immagine;
} 

// # funzione per mostrare le azioni attuabili nel gioco
function mostraAzioniQuadro(azioni) {
    let azioniHTML = "";
    azioni.forEach(function(azione){
        azioniHTML += `<button>${azione}</button>`
    });

    document.querySelector(".quadro-vie").innerHTML = azioniHTML;

    const bottoniAzioni = document.querySelectorAll(".quadro-vie button");


    bottoniAzioni.forEach(function(button){
        button.addEventListener("click", function(){
            // 1. recuperiamo l'azione cliccata
            const azioneScelta = button.innerText;
            // 2. prepariamo messaggio per chatGPT
            chatIntera.push({
                role: `user`,
                content: `${azioneScelta}. Se questa azione è mortale l'elenco delle azioni è vuoto. Non dare altro testo che non sia un oggetto JSON. Le tue risposte sono solo in formato JSON come questo esempio:\n\n###\n\n{"description": "sei morto per questa motivazione", "actions": []}###`
            });

            // 3. richiedere la generazione di un nuovo livello
            faiQuadro();
        })
    });
    // console.log(azioniHTML);
}

function setFine(descrizione){
   const fineElem = gameoverTemplate.content.cloneNode(true);

   fineElem.querySelector(".fine-messaggio").innerText = descrizione;

   placeholder.appendChild(fineElem);

   const tastoRigioca = document.querySelector(".fine-gioco button");

   tastoRigioca.addEventListener("click", function(){
    window.location.reload();
   })
}