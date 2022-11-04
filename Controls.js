class Controls{
    constructor(game){
        this.game = game
        $(document).data("controls",this) //store the game through jquery, as this references element on events
        $(document).data("focus",game.c) //focus defaults to game
        this.keyMap = {
            65:"_left",
            83:"_down",
            68:"_right",
            87:"_up",
            32:"_space",
            37:"_left",
            38:"_up",
            39:"_right",
            40:"_down"
        }
        $(document).click(this.onclick)
        $(document).keydown(this.onkeydown)
    }

    handle(key){
        var func = this.keyMap[key]
        if (func) 
            eval("this." + func + "()")
    }

    onkeydown(event){
        var focus = $(document).data("focus")
        if (!focus || focus.id == "game")
        {
            var controls = $(document).data("controls")
            controls.handle(event.keyCode)
        }
    }

    onclick(event){
        $(document).data("focus",event.target)
        var focus = $(document).data("focus")
        if (!focus || focus.id == "game")
        {
        }
    }

    _left(){
        this.game.move(-1,0)
    }
    _up(){
        this.game.rotate()
    }
    _right(){
        this.game.move(1,0)
    }
    _down(){
        this.game.down()
    }
    _space(){
        this.game.drop()
    }
}