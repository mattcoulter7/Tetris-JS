class ZShape extends Shape{
    constructor(game){
        var shape = [
            [0,1,1],
            [1,1,0],
        ]
        var color = Color.GREEN
        super(game,shape,color)
    }
}