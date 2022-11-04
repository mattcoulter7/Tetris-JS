var game

function loadgame(){
    var gameid = prompt("Please enter game id to spectate")
    var gamedata = Query.selectId("gamedata",gameid)
    if (gamedata) {
        game = Game.import(gamedata)
    } else{
        alert("Game: " + gameid + " does not exist. Please try again")
        return loadgame()
    }
}

function creategame(){
    game = new Game("game",10,15)
}

main = function(){
    new GAPI('1xOd5i8A-ASM_LATSwAzUCwqaB_MEhgzKkZv7LcnnsH0','AKfycbyZ-YqwCmphCZK4Sg32qUB3NqHs0h8xnXA5MByOy4t7vhKHoeHdO3JmXw') // data api
    if (confirm("Would you like to start a new game?")){
        creategame()
    } else {
        Query.refresh(loadgame)
    }
}

window.onload = function(){
    main()
}
