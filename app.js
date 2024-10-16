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

    const error404 = document.querySelector('.not-found');
    let is404 = false;

    const genSelector = document.querySelector('.gen-selector');
    const genList = document.querySelector('.gen-list');

    let selectField = document.querySelector('.select-field');
    let selectText = document.querySelector('.select-text');
    let arrowIcon = document.querySelector('.fa-caret-down');

    const body = document.querySelector('body');
    const container = document.querySelector('.container');
    const search = document.querySelector('.search-box button');
    const pokeBall = document.querySelector('.search-box img');
    const searchInput = document.querySelector('input');

    const pokemonBox = document.querySelector('.pokemon-box');
    const pokemonId = document.querySelector('.pokemon-id');
    const pokemonImage = document.querySelector('.pokemon-box img');
    const pokemonTurn = document.querySelector('.pokemon-box button');
    const pokemonType = document.querySelector('.pokemon-type');

    const prevPokemonEvo = document.querySelector('.prev-evo');
    const nextPokemonEvo = document.querySelector('.next-evo');

    const toastBox = document.querySelector('.toast-box');
    
    const popUpEvoPath = document.querySelector('.evo-pop-up');
    const evoPathContainer = document.querySelector('.evo-path-container');

    let currentPokemon = '';
    let currentevoIndex = 0;
    let pokemonEvolutionChain = [];
    
    let pokemonGensList = [];
    
    let currentPokemonGen = 'normal';
    let pokemonFrontImage = '';
    let pokemonTurnedImage = '';
   
    let isItForward = true;

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

    pokemonTurn.addEventListener('click', () => {
        turnPokemon();
    });

    prevPokemonEvo.addEventListener('click', () => {
        getEvolution('prev');
    });

    nextPokemonEvo.addEventListener('click', () => {
        getEvolution('next');
    });

    class PokemonFromGen{
        constructor(gen, game, frontSprite, backSprite){
            this.gen = gen;
            this.game = game;
            this.frontSprite = frontSprite;
            this.backSprite = backSprite;
        }
    }

    function searchPokemon(pokemon){
        is404 = false;

        while(pokemonType.firstChild){
            pokemonType.removeChild(pokemonType.lastChild);
        }

        currentPokemon = pokemon;
        currentevoIndex = 0;
        currentPokemonGen = 'Select Generation';
        isItForward = true;

        while(genList.firstChild){
            genList.removeChild(genList.lastChild);
        }

        pokemonGensList = [];
        pokemonEvolutionChain = [];
        selectField.replaceWith(selectField.cloneNode(true));

        if(currentPokemon == '')
            return;

        fetch(`https://pokeapi.co/api/v2/pokemon/${currentPokemon}`)
        .then(response => {
            if(response.status == '404'){
                is404 = true;
                container.style.height = '350px';
                pokemonBox.style.display = 'none';
                genSelector.style.display = 'none';
                error404.style.display = 'block';
            }
            return response.json()
        })
        .then(json => {
            if(!is404){
                error404.style.display = 'none';
                
                genSelector.style.display = 'block';

                pokemonBox.style.display = 'block';
    
                pokemonFrontImage = json.sprites.front_default;
                pokemonTurnedImage = json.sprites.back_default;

                if(pokemonTurnedImage != null)
                    pokemonTurn.style.visibility = 'visible';
                else
                    pokemonTurn.style.visibility = 'hidden';
    
                pokemonId.innerHTML = '#' + json.id;
                pokemonImage.src = pokemonFrontImage;
    
                for(let i=0; i<json.types.length; i++){
                    addType(json.types[i].type.name);
                }
                container.style.height = "450px";
    
                pokemonBox.style.display = "block";
                body.style.backgroundColor = colours[json.types[0].type.name];

                getEvolutionChain();
                getAllGenSprites(json.sprites.versions);
            }
        });
    }

    function loadGenList(){
        let games = document.querySelectorAll('.game');
        selectField = document.querySelector('.select-field');
        selectText = document.querySelector('.select-text');
        arrowIcon = document.querySelector('.fa-caret-down');

        selectText.innerHTML = currentPokemonGen;
        games.forEach((game) => {
            game.addEventListener('click', () => {
                selectText.innerHTML = game.textContent;
                currentPokemonGen = selectText.innerHTML;
                let getGenClass = pokemonGensList.find((gen) => gen.game == currentPokemonGen);
                pokemonFrontImage = getGenClass.frontSprite;
                pokemonTurnedImage = getGenClass.backSprite;
                isItForward = true;
                pokemonImage.src = pokemonFrontImage;
                if(pokemonTurnedImage == null){
                    pokemonTurn.style.visibility = 'hidden';
                }else{
                    pokemonTurn.style.visibility = 'visible';
                }
                genList.classList.toggle('hide');
                arrowIcon.classList.toggle('rotate');
            });
        });

        selectField.addEventListener('click', () => {
            genList.classList.toggle('hide');
            arrowIcon.classList.toggle('rotate');
        });
    }

    function addType(type){
        const newType = document.createElement('p');
        newType.classList.add('type');
        pokemonType.appendChild(newType);
        newType.innerHTML = type;
        newType.style.backgroundColor = colours[type];
    }

    function turnPokemon(){
        if(isItForward){
            pokemonImage.src = pokemonTurnedImage;
            isItForward = false;
        }else{
            pokemonImage.src = pokemonFrontImage;
            isItForward = true;
        }
    }

    function getEvolutionChain(){
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${currentPokemon}`)
        .then(response => response.json())
        .then(json => {
            getPokemonEvolutions(json.evolution_chain.url);
        });
    }

    function getPokemonEvolutions(chainUrl){
        fetch(chainUrl)
        .then(response => response.json())
        .then(json => {
            pokemonEvolutionChain.push([json.chain.species.name]);
            if(json.chain.evolves_to.length != 0){
                if(json.chain.evolves_to.length > 1){
                    let evoPaths = [];
                    for(evo in json.chain.evolves_to){
                        if(currentPokemon == json.chain.evolves_to[evo].species.name){
                            currentevoIndex = 1;
                        }
                       evoPaths.push(json.chain.evolves_to[evo].species.name);
                    }
                    pokemonEvolutionChain.push(evoPaths);
                }else{
                    json = json.chain.evolves_to[0]
                    if(currentPokemon == json.species.name){
                        currentevoIndex = 1;
                    }
                    pokemonEvolutionChain.push([json.species.name]);
                    if(json.evolves_to.length > 1){
                        let evoPaths = [];
                        for(evo in json.evolves_to){
                            if(currentPokemon == json.evolves_to[evo].species.name){
                                currentevoIndex = 2;
                            }
                            evoPaths.push(json.evolves_to[evo].species.name);
                        }
                        pokemonEvolutionChain.push(evoPaths);
                    }else{
                        if(json.evolves_to.length != 0){
                            if(currentPokemon == json.evolves_to[0].species.name){
                                currentevoIndex = 2;
                            }
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
            if(currentevoIndex+1 == pokemonEvolutionChain.length){
                showToast('<i class="fa-solid fa-circle-exclamation"></i>Last evolution from this pokemon!');
                stop = true;
            }else{
                currentevoIndex++;
            }
        }
        if(!stop){
            if(pokemonEvolutionChain[currentevoIndex].length == 1){
                searchInput.value = pokemonEvolutionChain[currentevoIndex];
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
                if(game != 'icons'){
                    if(genGames[game].front_default !== null){
                        let pokemonGen = new PokemonFromGen(gen, game, genGames[game].front_default, genGames[game].back_default);
                        pokemonGensList.push(pokemonGen);
                        let gameUnit = document.createElement('li');
                        gameUnit.textContent = game;
                        gameUnit.classList.add('game');
                        genList.appendChild(gameUnit);
                    }
                }
            }
        }
        loadGenList();
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