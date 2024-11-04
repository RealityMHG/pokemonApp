//Pokedex

//Wait for all html items to load first
window.addEventListener('DOMContentLoaded', () => {
    
    //All pokemon types with each color code
    const colours = {
        normal: '#A8A77A',
        fire: '#EE8130',
        water: '#6390F0',
        electric: '#F7D02C',
        grass: '#7AC74C',
        ice: '#96D9D6',
        fighting: '#C22E28',
        poison: '#A33EA1',
        ground: '#E2BF65',
        flying: '#A98FF3',
        psychic: '#F95587',
        bug: '#A6B91A',
        rock: '#B6A136',
        ghost: '#735797',
        dragon: '#6F35FC',
        dark: '#705746',
        steel: '#B7B7CE',
        fairy: '#D685AD',
    };

    //Number of pokemon available
    const numOfPokemon = 1025;
    const allPokemonNames = [];
    getAllPokemonNames();

    const error404 = document.querySelector('.not-found');
    let is404 = false;

    const music = document.querySelector('.fa-music');
    const sound  = document.querySelector('.fa-volume-high');

    const gameToggle = document.querySelector('.game-toggle');

    const genSelector = document.querySelector('.gen-selector');
    const genList = document.querySelector('.gen-list');

    let genSelectField = document.querySelector('.gen-selector .select-field');
    let genSelectText = document.querySelector('.gen-selector .select-text');
    let genArrowIcon = document.querySelector('.gen-selector .fa-caret-down');

    const body = document.querySelector('body');
    const container = document.querySelector('.container');
    const search = document.querySelector('.search-box button');
    const pokeBall = document.querySelector('.search-box img');
    const searchInput = document.querySelector('input');
    const pokemonIcon = document.querySelector('.pokemon-icon');

    const pokemonList = document.querySelector('.pokemon-list');

    const formSelector = document.querySelector('.form-selector');
    const formList = document.querySelector('.form-list');

    let formSelectField = document.querySelector('.form-selector .select-field');
    let formSelectText = document.querySelector('.form-selector .select-text');
    let formArrowIcon = document.querySelector('.form-selector .fa-caret-down');

    const pokemonBox = document.querySelector('.pokemon-box');
    const pokemonId = document.querySelector('.pokemon-id');
    const pokemonImage = document.querySelector('.pokemon-box img');
    const pokemonTurn = document.querySelector('.turn');
    const pokemonShiny = document.querySelector('.shiny');
    const pokemonType = document.querySelector('.pokemon-type');

    const prevPokemonEvo = document.querySelector('.prev-evo');
    const nextPokemonEvo = document.querySelector('.next-evo');

    const pokemonInfo = document.querySelector('.pokemon-info');
    const infoBox = document.querySelector('.info-box');
    const infoBoxWeight = document.querySelector('.info-box .weight');
    const infoBoxHeight = document.querySelector('.info-box .height');

    const toastBox = document.querySelector('.toast-box');
    
    const popUpEvoPath = document.querySelector('.evo-pop-up');
    const evoPathContainer = document.querySelector('.evo-path-container');

    const randomPokemon = document.querySelector('.random-pokemon i');

    let musicFile = new Audio('backgroundMusic.mp3');

    let currentPokemonSpecies = '';
    let currentPokemonID = 0;
    let currentevoIndex = 0;
    let currentPokemonCry = new Audio();
    currentPokemonCry.volume = 0.3;
    let pokemonEvolutionChain = [];
    let pokemonEvolutionChainbyID = [];
    
    let pokemonFormList = [];
    let currentPokemon = '';
    
    let pokemonGensList = [];
    let currentPokemonGen = 'normal';
    let pokemonArtImages = [];
    let pokemonDefaultImages = [];
    let pokemonShinyImages = [];
   
    let isMusicOn = 0;
    let isSoundOn = true;
    let isItAnEvo = false;
    let isItAForm = false;
    let isItForward = true;
    let isItShiny = false;
    let isItArt = true;
    
    body.addEventListener('click', () => {
        if(document.activeElement != search){
            pokemonList.style.visibility = 'hidden';
        }
        if(currentPokemon!=''){
            if(searchInput.value != currentPokemonSpecies){
                searchInput.value = currentPokemonSpecies;
            }
        }
    });

    //Pokeball logo on search bar, refreshes pages when clicked
    pokeBall.addEventListener('click', () => {
        location.reload();
    });

    //Search button, Sends pokemon typed to search
    search.addEventListener('click', () => {
        pokemonList.style.visibility = 'hidden';
        searchPokemon(searchInput.value.toLowerCase());
    });

    //Search button, Sends pokemon typed to search with the enter key
    searchInput.addEventListener('keyup', (event) => {
        let result = [];
        if(event.key == 'Enter'){
            pokemonList.style.visibility = 'hidden';
            searchPokemon(searchInput.value.toLowerCase());
        }else{
            if(searchInput.value.length){
                pokemonList.style.visibility = 'visible';
                result = allPokemonNames.filter((keyword) => {
                    return keyword.startsWith(searchInput.value.toLowerCase());
                });
                displaySuggested(result);
            }else{
                pokemonList.style.visibility = 'hidden';
            }
            if(!pokemonList.firstChild){
                pokemonList.style.visibility = 'hidden';
            }
        }

    });

    //Music and sound controls
    music.addEventListener('click', () => {
        musicToggle();
    });

    sound.addEventListener('click', () => {
        soundToggle();
    });

    //Toggles shiny
    pokemonShiny.addEventListener('click', () => {
        shinyToggle();
    });

    //Turns pokemon
    pokemonTurn.addEventListener('click', () => {
        turnPokemon();
    });

    pokemonInfo.addEventListener('mouseenter', () => {
        infoBox.style.visibility = 'visible';
    });

    pokemonInfo.addEventListener('mouseleave', () => {
        infoBox.style.visibility = 'hidden';
    });

    prevPokemonEvo.addEventListener('click', () => {
        getEvolution('prev');
    });

    nextPokemonEvo.addEventListener('click', () => {
        getEvolution('next');
    });

    randomPokemon.addEventListener('click', () => {
        searchPokemon(Math.floor(Math.random() * numOfPokemon));
    });

    gameToggle.addEventListener('click', () => {
        gameArtToggle();
    });

    class PokemonFromGen{
        constructor(gen, game, defaultSprite, shinySprite){
            this.gen = gen;
            this.game = game;
            this.defaultSprite = defaultSprite;
            this.shinySprite = shinySprite;
        }
    }

    function getAllPokemonNames(){
        fetch(`https://pokeapi.co/api/v2/pokemon?limit=${numOfPokemon}&offset=0`)
        .then(response => response.json())
        .then(json => {
           fillAllPokemonNames(json.results);
        });
    }

    function fillAllPokemonNames(results){
        for(let pokemon in results){
           allPokemonNames.push(results[pokemon].name);
        }
    }

    function displaySuggested(result){
        while(pokemonList.firstChild){
            pokemonList.removeChild(pokemonList.lastChild);
        }

        result.map((pokeName) => {
            let pokemonName = document.createElement('li');
            pokemonName.classList.add('pokemon-name');
            pokemonName.textContent = pokeName;
            pokemonList.appendChild(pokemonName);
            pokemonName.addEventListener('click', () => {
                pokemonList.style.visibility = 'hidden';
                searchPokemon(pokemonName.textContent);
            });
        });
    }

    function searchPokemon(pokemon){
        is404 = false;

        while(pokemonType.firstChild){
            pokemonType.removeChild(pokemonType.lastChild);
        }
    
        currentPokemon = pokemon;
        
        currentPokemonGen = 'Game Models';
        isItForward = true;
        
        if(isItShiny)
            shinyToggle();

        while(genList.firstChild){
            genList.removeChild(genList.lastChild);
        }

        while(formList.firstChild){
            formList.removeChild(formList.lastChild);
        }

        pokemonGensList = [];
        pokemonFormList = [];

        if(!isItAnEvo){
            currentevoIndex = 0;
            pokemonEvolutionChain = [];
            pokemonEvolutionChainbyID = [];
        }

        genSelectField.replaceWith(genSelectField.cloneNode(true));
        formSelectField.replaceWith(formSelectField.cloneNode(true));

        formSelector.style.visibility = 'hidden';

        if(currentPokemon == '')
            return;

        
        if(!isItAForm)
            checkIfSpeciesExist();
        
        container.style.height = '100px';

        setTimeout(() => {
            loadPokemon();
        },500);
        
    }

    function loadPokemon(){
        fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon}`)
            .then(response => response.json())
            .then(json => {
                if(!is404){
                    error404.style.display = 'none';
                    
                    formSelector.style.display = 'block';
    
                    pokemonBox.style.display = 'block';
    
                    gameToggle.style.display = 'block';
        
                    pokemonDefaultImages = [json.sprites.front_default, json.sprites.back_default];
                    pokemonShinyImages = [json.sprites.front_shiny, json.sprites.back_shiny];
                    pokemonArtImages = [json.sprites.other['official-artwork'].front_default, json.sprites.other['official-artwork'].front_shiny];

                    currentPokemonCry.src = json.cries.latest;

                    if(pokemonDefaultImages[0] == null){
                        pokemonDefaultImages[0] = '/No_image_available.png';
                    }

                    if(pokemonArtImages[0] == null){
                        pokemonArtImages[0] = '/No_image_available.png';
                    }
        
                    currentPokemon = json.name;
                    currentPokemonID = json.id;
                    pokemonId.innerHTML = '#' + json.id;
    
                    infoBoxHeight.innerHTML = json.height * 10 + " cm";
                    infoBoxWeight.innerHTML = json.weight / 10 + " kg";
    
                    if(isItArt){
                        if(pokemonArtImages[1] != null)
                            pokemonShiny.style.visibility = 'visible';
                        else
                            pokemonShiny.style.visibility = 'hidden';

                        pokemonImage.src = pokemonArtImages[0];
                        pokemonTurn.style.display = 'none';
                    }else{
                        if(pokemonShinyImages[0] != null)
                            pokemonShiny.style.visibility = 'visible';
                        else
                            pokemonShiny.style.visibility = 'hidden';

                        pokemonImage.src = pokemonDefaultImages[0];
                        if(pokemonDefaultImages[1] != null){
                            pokemonTurn.style.display = 'block';
                        }else{
                            pokemonTurn.style.display = 'none';
                        }
                    }
    
                    currentPokemonSpecies = json.species.name;
                    if(searchInput.value != currentPokemonSpecies){
                        searchInput.value = currentPokemonSpecies;
                    }
        
                    for(let i=0; i<json.types.length; i++){
                        addType(json.types[i].type.name);
                    }
    
                    container.style.height = "450px";
        
                    pokemonBox.style.display = "block";
                    body.style.backgroundColor = colours[json.types[0].type.name];
    
                    getEvolutionChain(isItAnEvo);
                    getAllGenSprites(json.sprites.versions);
                    isItAForm = false;
                    isItAnEvo = false;

                    if(isSoundOn)
                        currentPokemonCry.play();
                }
            });
    }

    function checkIfSpeciesExist(){
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPokemon}`)
        .then(response => {
            if(response.status == '404'){
                is404 = true;
                container.style.height = '350px';
                pokemonBox.style.display = 'none';
                genSelector.style.display = 'none';
                formSelector.style.display = 'none';
                error404.style.display = 'block';
                pokemonIcon.src = '';
                gameToggle.style.display = 'none';
                currentPokemon = '';
            }
            return response.json();   
        })
        .then(json => {
            currentPokemon = json.varieties[0].pokemon.name;
        });
    }

    function loadGenList(){
        let games = document.querySelectorAll('.game');
        genSelectField = document.querySelector('.gen-selector .select-field');
        genSelectText = document.querySelector('.gen-selector .select-text');
        genArrowIcon = document.querySelector('.gen-selector .fa-caret-down');

        genSelectText.innerHTML = currentPokemonGen;
        games.forEach((game) => {
            game.addEventListener('click', () => {
                genSelectText.innerHTML = game.textContent;
                currentPokemonGen = getTextBack(genSelectText.innerHTML);
                let getGenClass = pokemonGensList.find((gen) => gen.game == currentPokemonGen);
                pokemonDefaultImages[0] = getGenClass.defaultSprite[0];
                pokemonDefaultImages[1] = getGenClass.defaultSprite[1];
                pokemonShinyImages[0] = getGenClass.shinySprite[0];
                pokemonShinyImages[1] = getGenClass.shinySprite[1];
                isItForward = true;

                if(isItShiny)
                    shinyToggle();

                pokemonImage.src = pokemonDefaultImages[0];

                if(pokemonDefaultImages[1] == null)
                    pokemonTurn.style.display = 'none';
                else
                    pokemonTurn.style.display = 'block';

                if(pokemonShinyImages[0] != null)
                    pokemonShiny.style.visibility = 'visible';
                else
                    pokemonShiny.style.visibility = 'hidden';

                genList.classList.toggle('hide');
                genArrowIcon.classList.toggle('rotate');
            });
        });

        genSelectField.addEventListener('click', () => {
            genList.classList.toggle('hide');
            genArrowIcon.classList.toggle('rotate');
        });
    }

    function loadFormList(){
        if(pokemonFormList.length>1){
            formSelector.style.visibility = 'visible';
            let forms = document.querySelectorAll('.form');
            formSelectField = document.querySelector('.form-selector .select-field');
            formSelectText = document.querySelector('.form-selector .select-text');
            formArrowIcon = document.querySelector('.form-selector .fa-caret-down');
    
            formSelectText.innerHTML = getTextPrettier(currentPokemon);
    
            forms.forEach((form) => {
                form.addEventListener('click', () => {
                    formList.classList.toggle('hide');
                    formArrowIcon.classList.toggle('rotate');
                    let evoIndex = currentevoIndex;
                    isItAForm = true;
                    searchPokemon(getTextBack(form.textContent));
                    currentevoIndex = evoIndex;
                });
            });
    
            formSelectField.addEventListener('click', () => {
                formList.classList.toggle('hide');
                formArrowIcon.classList.toggle('rotate');
            });
        }
    }

    function addType(type){
        const newType = document.createElement('p');
        newType.classList.add('type');
        pokemonType.appendChild(newType);
        newType.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
        newType.style.backgroundColor = colours[type];
    }

    function musicToggle(){    
        switch(isMusicOn){
            case 0:
                music.classList.toggle('min');
                musicFile.play();
                musicFile.volume = 0.5;
                isMusicOn++;
                break;

            case 1:
                music.classList.toggle('min');
                music.classList.toggle('active');
                musicFile.volume = 1;
                isMusicOn++;
                break;
            
            case 2:
                music.classList.toggle('active');
                musicFile.pause();
                isMusicOn=0;
                break;
        }  
    }

    function soundToggle(){
        isSoundOn = !isSoundOn;
        sound.classList.toggle('fa-volume-high');
        sound.classList.toggle('fa-volume-xmark');
    }

    function turnPokemon(){
        let correctImages = [];
        if(isItShiny){
            correctImages = pokemonShinyImages;
        }else{
            correctImages = pokemonDefaultImages;
        }

        if(isItForward){
            pokemonImage.src = correctImages[1];
            isItForward = false;
        }else{
            pokemonImage.src = correctImages[0];
            isItForward = true;
        }
    }

    function shinyToggle(){
        pokemonShiny.classList.toggle('active');
        if(!isItShiny){
            isItShiny = true;
            if(isItArt){
                pokemonImage.src = pokemonArtImages[1];
            }else{
                pokemonImage.src = pokemonShinyImages[0];
            }
        }else{
            isItShiny = false;
            if(isItArt){
                pokemonImage.src = pokemonArtImages[0];
            }else{
                pokemonImage.src = pokemonDefaultImages[0];
            }
        }
    }

    function gameArtToggle(){
        gameToggle.classList.toggle('active');
        if(isItArt){
            if(pokemonDefaultImages[1] != null){
                pokemonTurn.style.display = 'block';
            }else{
                pokemonTurn.style.display = 'none';
            }

            if(pokemonGensList.length != 0){
                genSelector.style.display = 'block';
            }else{
                genSelector.style.display = 'none';
            }

            if(pokemonShinyImages[0] != null)
                pokemonShiny.style.visibility = 'visible';
            else
                pokemonShiny.style.visibility = 'hidden';

            if(isItShiny){
                pokemonImage.src = pokemonShinyImages[0];
            }else{
                pokemonImage.src = pokemonDefaultImages[0];
            }  
            isItArt = false;
        }else{
            pokemonTurn.style.display = 'none';
            genSelector.style.display = 'none';

            if(pokemonArtImages[1] != null)
                pokemonShiny.style.visibility = 'visible';
            else{
                pokemonShiny.style.visibility = 'hidden';
                if(isItShiny)
                    shinyToggle();
            }

            if(isItShiny){
                pokemonImage.src = pokemonArtImages[1];
            }else{
                pokemonImage.src = pokemonArtImages[0];
            }
            isItArt = true;
        }
    }

    function getEvolutionChain(isItAnEvo){
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPokemonSpecies}`)
        .then(response => response.json())
        .then(json => {
            if(!isItAnEvo)
                getPokemonEvolutions(json.evolution_chain.url);

            if(currentPokemonSpecies != 'koraidon')
                getFormsList(json.varieties);
        });
    }

    function getPokemonEvolutions(chainUrl){
        fetch(chainUrl)
        .then(response => response.json())
        .then(json => {
            pokemonEvolutionChainbyID.push([json.chain.species.url.split('/')[6]]);
            pokemonEvolutionChain.push([json.chain.species.name]);
            if(json.chain.evolves_to.length != 0){
                if(json.chain.evolves_to.length > 1){
                    let evoPaths = [];
                    let evoPathsbyID = [];
                    for(evo in json.chain.evolves_to){
                        if(currentPokemonID == json.chain.evolves_to[evo].species.url.split('/')[6]){
                            currentevoIndex = 1;
                        }
                        evoPathsbyID.push(json.chain.evolves_to[evo].species.url.split('/')[6]);
                        evoPaths.push(json.chain.evolves_to[evo].species.name);
                    }
                    pokemonEvolutionChainbyID.push(evoPathsbyID);
                    pokemonEvolutionChain.push(evoPaths);
                }else{
                    json = json.chain.evolves_to[0]
                    if(currentPokemonID == json.species.url.split('/')[6]){
                        currentevoIndex = 1;
                    }
                    pokemonEvolutionChainbyID.push([json.species.url.split('/')[6]]);
                    pokemonEvolutionChain.push([json.species.name]);
                    if(json.evolves_to.length > 1){
                        let evoPathsbyID = [];
                        let evoPaths = [];
                        for(evo in json.evolves_to){
                            if(currentPokemonID == json.evolves_to[evo].species.url.split('/')[6]){
                                currentevoIndex = 2;
                            }
                            evoPathsbyID.push(json.evolves_to[evo].species.url.split('/')[6]);
                            evoPaths.push(json.evolves_to[evo].species.name);
                        }
                        pokemonEvolutionChainbyID.push(evoPathsbyID);
                        pokemonEvolutionChain.push(evoPaths);
                    }else{
                        if(json.evolves_to.length != 0){
                            if(currentPokemonID == json.evolves_to[0].species.url.split('/')[6]){
                                currentevoIndex = 2;
                            }
                            pokemonEvolutionChainbyID.push([json.evolves_to[0].species.url.split('/')[6]]);
                            pokemonEvolutionChain.push([json.evolves_to[0].species.name]);
                        }
                    }
                }
            }
        });
    }

    function getEvolution(prevOrNext){    
        let stop = false;
        if(prevOrNext == 'prev'){
            if(currentevoIndex == 0){
                showToast('<i class="fa-solid fa-circle-exclamation"></i>First evolution from this pokemon!');
                stop = true;
            }else{
                currentevoIndex--;
            }
        }else if(prevOrNext == 'next'){
            if(currentevoIndex+1 >= pokemonEvolutionChain.length){
                showToast('<i class="fa-solid fa-circle-exclamation"></i>Last evolution from this pokemon!');
                stop = true;
            }else{
                currentevoIndex++;
            }
        }
        if(!stop){
            isItAnEvo = true;
            if(pokemonEvolutionChainbyID[currentevoIndex].length == 1){
                searchInput.value = pokemonEvolutionChainbyID[currentevoIndex];
                searchPokemon(searchInput.value);
            }else{
                multipleEvoPaths();
            }
        }
    }

    function multipleEvoPaths(){
        container.style.height = '0px';
        pokemonList.style.visibility = 'hidden';
        popUpEvoPath.classList.add('open-pop');
        for(evo in pokemonEvolutionChain[currentevoIndex]){
            let pokemonEvo = pokemonEvolutionChain[currentevoIndex][evo];
            let evoBtn = document.createElement('button');
            evoBtn.classList.add('evo-path-btn');
            evoBtn.textContent = pokemonEvo;
            evoPathContainer.appendChild(evoBtn);
            evoBtn.addEventListener('click', () => {
                searchInput.value = pokemonEvo;
                searchPokemon(searchInput.value);
                popUpEvoPath.classList.remove('open-pop');
                container.style.height = '450px';
                pokemonList.style.visibility = 'visible';
                while(evoPathContainer.firstChild){
                    evoPathContainer.removeChild(evoPathContainer.lastChild);
                }
            });
        }
    }

    function getAllGenSprites(jsonSprites){
        for(gen in jsonSprites){
            let genGames = jsonSprites[gen];
            for(game in genGames ){
                if(game != 'icons' && game!='x-y'){
                    if(genGames[game].front_default !== null){
                        let pokemonGen = new PokemonFromGen(gen, game, [genGames[game].front_default, genGames[game].back_default],
                             [genGames[game].front_shiny, genGames[game].back_shiny]);
                        pokemonGensList.push(pokemonGen);
                        let gameUnit = document.createElement('li');
                        gameUnit.textContent = getTextPrettier(game);
                        gameUnit.classList.add('game');
                        genList.appendChild(gameUnit);
                    }
                }
                if(game == 'icons'){
                    pokemonIcon.src = genGames[game].front_default;
                    if( genGames[game].front_default == null){
                        pokemonIcon.src = '';
                    }
                }
            }
        }
        if(pokemonGensList.length < 1){
            genSelector.style.display = 'none';
        }else{
            if(!isItArt)
                genSelector.style.display = 'block';
            
            loadGenList();
        }
    }

    function getFormsList(formsList){
        if(formsList.length>1){
            for(form in formsList){
                pokemonFormList.push(formsList[form].pokemon.name);
                let formUnit = document.createElement('li');
                formUnit.textContent = getTextPrettier(formsList[form].pokemon.name);
                formUnit.classList.add('form');
                formList.appendChild(formUnit);
            }   
            loadFormList();
        }
    }

    function getTextPrettier(text){
        let texts = text.split('-');
        let finalText = '';
        for(let i in texts){
            finalText += texts[i].charAt(0).toUpperCase() + texts[i].slice(1) + ' ';
        }
        return finalText.substring(0,finalText.length - 1);
    }

    function getTextBack(text){
        let texts = text.split(' ');
        let finalText = '';
        for(let i in texts){
            finalText += texts[i].charAt(0).toLowerCase() + texts[i].slice(1) + '-';
        }
        return finalText.substring(0,finalText.length - 1);
    }

    function showToast(msg){
        let toast = document.createElement('div');
        toast.classList.add('toast');
        toast.innerHTML = msg;
        toastBox.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        },3000);
    }

});