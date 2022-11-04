class Grid{
    constructor(width,height,game){
        this.game = game
        this.grid = this.blank(width,height)
    }

    get width(){
        return this.grid[0].length
    }

    get height(){
        return this.grid.length
    }

    get empty_row(){
        return new Array(this.width).fill(0)
    }

    get onezero(){
        if (this.game.spectating) return this
        var grid = new Grid(this.width,this.height,this.game)
        for (let i = 0; i < this.game.shapes.length; i++)
        {
            var shape = this.game.shapes[i]
            var pos = shape.pos
            this.apply_shape_to_grid(pos[0],pos[1],shape,grid)
        }
        return grid
    }

    blank(width,height){
        width = width || this.width
        height = height || this.height
        return new Array(height).fill(0).map(a => new Array(width).fill(0))
    }

    add_row(){
        this.grid.unshift(this.empty_row)
    }

    set(x,y,val){
        if (this.in_range(x,"width") && this.in_range(y,"height"))
            this.grid[y][x] = val
    }

    get(x,y){
        if (this.in_range(x,"width") && this.in_range(y,"height"))
            return this.onezero.grid[y][x]
    }

    in_range(val,axis){
        //axis => width or height
        var range = this[axis]
        if (!range) return false
        return val >= 0 && val < range
    }

    loop(all = false,callback){ // runs a particular function for all valid objects on board
        var params = Array.from(arguments).splice(2)
        for (let y = this.height - 1; y >= 0; y--) // backwards because of shape reducing remove the shape
        {
            for (let x = this.width - 1; x >= 0; x--)
            {
                var obj = this.get(x,y)
                if (all || obj)
                    callback(x,y,obj,...params)
            }
        }
    }
    
    apply_shape_to_grid(startX,startY,shape,grid){
        // x,y is starting pos
        for (let y = 0; y < shape.height; y++)
        {
            for (let x = 0; x < shape.width; x++)
            {
                var val = shape.get(x,y)
                if (!val) continue;
                var gridX = x + startX
                var gridY = y + startY - shape.height + 1 // relative position is bottom left
                grid.set(gridX,gridY,shape)
            }
        }
    }

    get export(){
        var data = []
        this.onezero.grid.forEach(function(line){
            data.push(line.reduce(function(prev,curr,index){
                var val = curr instanceof Shape ? curr.color : Color.WHITE
                prev[index] = val
                return prev
            },{'id':String(data.length)}))
        })
        return data
    }

    import(data){
        for (let i = 0; i < data.length;i++)
            this.grid[i] = Object.entries(data[i]).map(a => a[1] === "0" ? Color.WHITE : a[1])
    }
}