class Score{
    constructor(game){
        this.game = game
        this.score = 0
        this.tetris = false
    }

    add(score){
        this.score += score
        /*Query.updateId("gamedata",this.game.id,"score",this.score)*/
    }

    clear_rows(count){
        var arrCount = count > 4 ? new Array(Math.floor(count / 4)).fill(4) : [count]
        if (count > 4)
            arrCount.push(count % 4)
        for (let i = 0;i < arrCount.length;i++){
            var rows = arrCount[i]
            var thisScore = 0
            for (let j = 0; j < rows;j++)
                thisScore = thisScore == 0 ? 100 : thisScore * 2;
            if (thisScore == 800)
            {
                if (this.tetris)
                    thisScore = 1200
                else
                    this.tetris = true
            }
            else{
                this.tetris = false
            }
            this.add(thisScore)
        }   
    }
}