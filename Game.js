class Game{
    constructor(elementid,width,height,shapes,id,spectate = false){
        this.spectating = spectate

        this.elementid = elementid
        var element = document.getElementById(elementid)
        $(document).data("game",this)
        this.id = id || ID()
        this.c = element
        this.ctx = element.getContext('2d')

        this.grid = new Grid(width,height,this)
        this.piece_types = [LineShape,LShape,MirroredLShape,SShape,TShape,ZShape]
        this.speed = 1 //1 tile per second

        this.shapes = shapes || []
        this.active = null
        this.held = null

        this.score = new Score(this)

        this.tile_size = Math.min(this.canvas_width / this.grid.width,this.canvas_height / this.grid.height)
        this.timer = null

        this.controls = new Controls(this)

        if (spectate)
            Game.spectate(this)
        else
            Game.init(this)

    }

    get canvas_width(){
        return $(this.c).outerWidth()
    }

    get canvas_height(){
        return $(this.c).outerHeight()
    }

    get_shape(id){
        return this.shapes.filter(sh => sh.id == id)[0]
    }

    remove_shape(shape){
        this.shapes = this.shapes.filter(sh => sh != shape)
    }

    new_shape(){
        var shapeType = this.piece_types[rand_num(0,this.piece_types.length - 1)]
        return new shapeType(this)
    }

    add_shape(shape){
        shape = shape || this.new_shape()
        this.shapes.push(shape)
        return shape
    }

    spawn_shape(){
        var shape = this.add_shape()
        this.active = shape
    }

    timer_handler(){
        var game = $(document).data("game")
        game.down()
    }

    start_timer(){
        this.timer = setTimeout(this.timer_handler,this.speed * 1000)
    }

    stop_timer(){
        clearTimeout(this.timer)
    }

    start(){
        this.start_timer()
    }

    draw(){
        this.ctx.fillStyle=Color.WHITE
        this.ctx.fillRect(0,0,this.canvas_width,this.canvas_height)
        var grid = this.grid.onezero
        grid.loop(true,this.draw_tile,this.tile_size,this.ctx)
    }

    draw_tile(x,y,shape,tile_size,ctx){
        ctx.beginPath();
        if (shape)
        {
            ctx.fillStyle = shape instanceof Shape ? shape.color : shape
            ctx.fillRect(x * tile_size, y*tile_size, tile_size, tile_size); //pieces
        }
        ctx.rect(x * tile_size, y*tile_size, tile_size, tile_size); // grid
        ctx.stroke();
    }

    clear_rows(){
        var grid = this.grid.onezero
        var full_rows = grid.grid.map(function(row,i){
            return (row.filter(a => a !== 0).length == row.length) ? i : -1
        }).filter(i => i != -1)
        if (full_rows.length > 0){
            this.shapes.forEach(sh => sh.remove_rows(full_rows))
            this.score.clear_rows(full_rows.length)
        }
    }

    can_move(h = 0,v = 0){
        var grid = this.grid.onezero
        var tiles = this.active.tiles
        tiles = tiles.filter(ti => grid.in_range(ti[0],"width") && grid.in_range(ti[1],"height"))
        var down = tiles.map(ti => grid.get(ti[0] + h,ti[1] + v))
        down = down.filter(obj => obj !== 0 && obj != this.active)
        return (down.length == 0)
    }

    down(){
        //method gets called by timer, or by user. Hence timer is stop and restarted
        if (!this.active)
            this.spawn_shape()

        if (this.can_move(0,1)){
            this.active.move(0,1)
        }
        else{
            this.spawn_shape()
            this.clear_rows()
        }
        this.draw()

        this.stop_timer()
        this.start_timer()
    }

    drop(){
        this.active.drop()
    }

    move(h,v){
        if (this.can_move(h,v)){
            this.active.move(h,v)
        }
        this.draw()
    }

    rotate(){
        this.active.rotate()
        this.draw()
    }

    update(shapes){
        for (let i = 0; i < shapes.length;i++)
        {
            var shape = shapes[i]
            var existing = this.get_shape(shape.id)
            if (existing){
                existing.update(shape)
            } else{
                this.add_shape(Shape.import(this,shape))
            }
        }
        this.draw()
    }

    static init(game){
        var columnsString = ascendingArray(0,game.grid.width - 1).join(";")
        game.spawn_shape() // start the game
        var table = game.id
        Query.run("Query.createTable",[table,columnsString,],function(game,start){
            Query.run("Query.insert",['gamedata',game.export],function(game,start){ // game data
                var data = game.grid.export
                Query.run("Query.insertMulti",[table,data],function(game,start){ // grid data
                    Query.refresh(function(game,start){ // fetch all up to date data into cache
                        console.log(new Date().getTime() - start)
                        alert("Share " + game.id + " with your friends")
                        game.draw()
                        Game.sync(game)
                    },[game,start])
                },[game,start])
            },[game,start])
        },[game,new Date().getTime()])
    }

    get export(){
        return {
            id : this.id,
            width:this.grid.width,
            height:this.grid.height
        }
    }
    
    static sync(game){
        Query.reload(game.id,function(game){
            var cacheData = game.grid.export
            var serverData = Query.select(game.id)
            var toPush = cacheData.filter(comparer(serverData));
            Query.run("Query.updateMulti",[game.id,toPush],Game.sync,[game])
        },[game])
    }
    
    static import(data) {
        return new Game(
            "game",
            parseInt(data.width),
            parseInt(data.height),
            null,
            data.id,
            true
        )
    }

    static spectate(game,start){
        var data = Query.select(game.id)
        game.grid.import(data)
        game.draw()
        var end = new Date().getTime()
        console.log(end - start + "ms") // time taken for each refresh, should be under game refresh time
        Query.reload(game.id,Game.spectate,[game,end])
    }
}

function rand_num(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function comparer(otherArray){
    return function(current){
      return otherArray.filter(function(other){
        return JSON.stringify(other) === JSON.stringify(current)
      }).length == 0;
    }
  }