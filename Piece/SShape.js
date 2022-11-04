class SShape extends Shape{
    constructor(game){
        var shape = [
            [1,1,0],
            [0,1,1]
        ]
        var color = Color.BLUE
        super(game,shape,color)
    }
}