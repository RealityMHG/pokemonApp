window.addEventListener('DOMContentLoaded', () => {

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

    const numOfPokemon = 1025;

    const error404 = document.querySelector('.not-found');
    let is404 = false;

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

    let currentPokemonSpecies = '';
    let currentPokemonID = 0;
    let currentevoIndex = 0;
    let pokemonEvolutionChain = [];
    let pokemonEvolutionChainbyID = [];
    
    let pokemonFormList = [];
    let currentPokemon = '';
    
    let pokemonGensList = [];
    let currentPokemonGen = 'normal';
    let pokemonDefaultImages = [];
    let pokemonShinyImages = [];
   
    let isItForward = true;
    let isItShiny = false;

    pokeBall.addEventListener('click', () => {
        location.reload();
    });

    search.addEventListener('click', () => {
        searchPokemon(searchInput.value.toLowerCase());
    });

    searchInput.addEventListener('keyup', (event) => {
        if(event.key == 'Enter'){
            searchPokemon(searchInput.value.toLowerCase());
        }
    });

    pokemonShiny.addEventListener('click', () => {
        shinyToggle();
    });

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

    class PokemonFromGen{
        constructor(gen, game, defaultSprite, shinySprite){
            this.gen = gen;
            this.game = game;
            this.defaultSprite = defaultSprite;
            this.shinySprite = shinySprite;
        }
    }

    //alternate between male and female

    function searchPokemon(pokemon){
        is404 = false;

        while(pokemonType.firstChild){
            pokemonType.removeChild(pokemonType.lastChild);
        }

        currentPokemon = pokemon;
        currentevoIndex = 0;
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
        pokemonEvolutionChain = [];
        pokemonEvolutionChainbyID = [];
        genSelectField.replaceWith(genSelectField.cloneNode(true));
        formSelectField.replaceWith(formSelectField.cloneNode(true));

        formSelector.style.visibility = 'hidden';

        if(currentPokemon == '')
            return;

        fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon}`)
        .then(response => {
            if(response.status == '404'){
                is404 = true;
                container.style.height = '350px';
                pokemonBox.style.display = 'none';
                genSelector.style.display = 'none';
                formSelector.style.display = 'none';
                error404.style.display = 'block';
                pokemonIcon.src = '';
            }
            return response.json()
        })
        .then(json => {
            if(!is404){
                container.style.height = '100px';
                error404.style.display = 'none';
                
                genSelector.style.display = 'block';
                formSelector.style.display = 'block';

                pokemonBox.style.display = 'block';
    
                pokemonDefaultImages = [json.sprites.front_default, json.sprites.back_default];
                pokemonShinyImages = [json.sprites.front_shiny, json.sprites.back_shiny];

                if(pokemonDefaultImages[1] != null)
                    pokemonTurn.style.visibility = 'visible';
                else
                    pokemonTurn.style.visibility = 'hidden';

                if(pokemonShinyImages[0] != null)
                    pokemonShiny.style.visibility = 'visible';
                else
                    pokemonShiny.style.visibility = 'hidden';
    
                currentPokemon = json.name;
                currentPokemonID = json.id;
                pokemonId.innerHTML = '#' + json.id;

                infoBoxHeight.innerHTML = json.height * 10 + " cm";
                infoBoxWeight.innerHTML = json.weight / 10 + " kg";

                pokemonImage.src = pokemonDefaultImages[0];

                currentPokemonSpecies = json.species.name;
                if(searchInput.value != currentPokemonSpecies){
                    searchInput.value = currentPokemonSpecies;
                }
    
                for(let i=0; i<json.types.length; i++){
                    addType(json.types[i].type.name);
                }

                setTimeout(() => {
                    container.style.height = "450px";
                },100);
    
                pokemonBox.style.display = "block";
                body.style.backgroundColor = colours[json.types[0].type.name];

                getEvolutionChain();
                getAllGenSprites(json.sprites.versions);
            }
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
                currentPokemonGen = genSelectText.innerHTML;
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
                    pokemonTurn.style.visibility = 'hidden';
                else
                    pokemonTurn.style.visibility = 'visible';

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
    
            formSelectText.innerHTML = currentPokemon;
    
            forms.forEach((form) => {
                form.addEventListener('click', () => {
                    formList.classList.toggle('hide');
                    formArrowIcon.classList.toggle('rotate');
                    let evoIndex = currentevoIndex;
                    searchPokemon(form.textContent);
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
        if(!isItShiny){
            pokemonShiny.style.backgroundColor = '#1d6d8a';
            isItShiny = true;
            pokemonImage.src = pokemonShinyImages[0];
        }else{
            pokemonShiny.style.backgroundColor = '#77d9fc'
            isItShiny = false;
            pokemonImage.src = pokemonDefaultImages[0];
        }
    }

    function getEvolutionChain(){
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPokemonSpecies}`)
        .then(response => response.json())
        .then(json => {
            getPokemonEvolutions(json.evolution_chain.url);
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
                        gameUnit.textContent = game;
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
            loadGenList();
        }
    }

    function getFormsList(formsList){
        if(formsList.length>1){
            for(form in formsList){
                if(!formsList[form].pokemon.name.includes('totem') && !formsList[form].pokemon.name.includes('starter')){
                    pokemonFormList.push(formsList[form].pokemon.name);
                    let formUnit = document.createElement('li');
                    formUnit.textContent = formsList[form].pokemon.name;
                    formUnit.classList.add('form');
                    formList.appendChild(formUnit);
                }
            }   
            loadFormList();
        }
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