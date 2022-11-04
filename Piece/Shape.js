class Shape{
    constructor(game,shape,color,pos,id){
        this.id = id || ID()
        this.game = game
        this.shape = shape
        this.color = color || Color.BLACK
        this.pos = pos || [rand_num(0,this.game.grid.width - this.width),0]
    }

    get height(){
        return this.shape.length
    }

    get width(){
        return (this.shape[0] || []).length
    }

    get tiles(){
        var tiles = []
        var pos = this.pos
        this.shape.forEach((row,y) => row.forEach((val,x) => val ? tiles.push([pos[0] + x,pos[1] + y - this.height + 1]) : null))
        return tiles
    }

    get rows(){
        var rows = this.tiles.map(ti => ti[1])
        .filter((v, i, a) => a.indexOf(v) === i)
        //rows.unshift(...new Array(this.height - rows.length).fill(-1));
        return rows.sort((a,b) => a-b)
    }

    get cols(){

    }

    get exists(){
        return this.shape.length > 0
    }

    get active(){
        return this.game.active == this
    }

    get gameid(){
        return this.game.id
    }

    move_to(x,y){
        this.pos = [x,y]
    }

    move(h,v){
        var pos = this.pos
        this.move_to(pos[0] + h,pos[1] + v)
    }

    remove_row(row){
        var rows = this.rows
        var index = rows.indexOf(row)
        if (index !== -1)
            this.shape.splice(index,1)
        else // still need to move down if below
        {
            if (row > Math.max(...rows))
                this.move(0,1)
        }
        if (!this.exists)
            this.game.remove_shape(this)
    }

    remove_rows(rows){
        for (let i = 0; i < rows.length; i++)
            this.remove_row(rows[i])
    }

    rotate(){
        var shape = []
        for (let i = 0; i < this.width; i++)
        {
            var row = []
            for (let j = this.height - 1; j >= 0; j--)
            {
                row.push(this.shape[j][i])
            }
            shape.push(row)
        }
        this.shape = shape
    }

    set(x,y){
        var pos = this.pos
        if (pos[0] !== x && pos[1] !== y)
        {
            this.game.grid.set(pos[0],pos[1],0)
            this.game.grid.set(x,y,this)
        }
    }

    get(x,y){
        return this.shape[y][x]
    }

    drop(){
        var row_count = 0
        while (this.game.can_move(0,row_count + 1)) {
            row_count += 1
        }
        this.move(0,row_count)
    }


    // exports object data
    get export(){
        return {
            id: this.id,
            shape:JSON.stringify(this.shape),
            pos:JSON.stringify(this.pos),
            color:this.color,
            active:this.active,
            gameid:this.gameid
        }
    }

    // imports object data
    update(data){
        if (data.shape)
            this.shape = JSON.parse(data.shape || '[]') || []
        if (data.pos)
            this.pos = JSON.parse(data.pos || '[]') || []
    }

    static import(game,data) {
        return new Shape(
            game,
            JSON.parse(data.shape || '[]') || [],
            data.color,
            JSON.parse(data.pos || '[]') || [],
            data.id
        )
    }
}