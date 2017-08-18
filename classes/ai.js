var enemyAI = function (unit){
    //class for controlling enemy ai
    var MoveActions = new Array ();
    var AttackActions = new Array ();
    //points decide whether this action is actually good
    var points = 0;

    this.count;
    this.tempgrid = new Array (10);
    for (var i =0; i< 10;i++){
        this.tempgrid[i] = new Array (16);
    }

    this.action = function (){

    };

    this.aiMovement = function (count){
        this.count = count;
        //a dummy movepathfinder to check each move (don't draw the panels)
        this.movePathFind(unit.x,unit.y,unit.movement, 'x',  new Array(), 0);

        this.enemyAction();
    };

    this.movePathFind = function (x,y,tempmv,dir,moveArray, temppoints){
        console.log (tempmv);
        if (tempmv > 0){
            //check that this grid is not itself
            if (unit.x == x && unit.y == y){
                //check up,left,right,down = skip pushing to the movearray here
                this.movePathFind(x+50,y,tempmv,'e',moveArray, temppoints);
                this.movePathFind(x-50,y,tempmv,'w',moveArray, temppoints);
                this.movePathFind(x,y-50,tempmv,'s',moveArray, temppoints);
                this.movePathFind(x,y+50,tempmv,'n',moveArray, temppoints);

            }
            else if ((checkGrid(x/50,y/50))){
                //this panel is empty, add move panel here
                //check if we already have a movepanel here though
                var moveArrayCopy = new Array ();
                for (var i =0; i< moveArray.length; i++){
                    moveArrayCopy.push(moveArray[i]);
                }
                moveArrayCopy.push(dir);
                if (this.tempgrid[x/50][y/50] == undefined){
                    this.tempgrid[x/50][y/50] = moveArrayCopy;
                    this.attackAction(x,y,temppoints);
                }else{
                    if (moveArrayCopy.length < this.tempgrid[x/50][y/50].length){
                        this.tempgrid[x/50][y/50] = moveArrayCopy;
                        this.attackAction(x,y,temppoints);
                    }
                }

                tempmv -=1;
                if (tempmv > 0){
                    //check up,left,right,down
                    this.movePathFind(x+50,y,tempmv,'e',moveArrayCopy, temppoints);
                    this.movePathFind(x-50,y,tempmv,'w',moveArrayCopy, temppoints);
                    this.movePathFind(x,y-50,tempmv,'s',moveArrayCopy, temppoints);
                    this.movePathFind(x,y+50,tempmv,'n',moveArrayCopy, temppoints);

                }
            }
            else{
            }
        }

    };

    this.attackAction = function (x,y, temppoints){
        //try attacking in all directions at this x and y
        console.log ('calculating value for:' + this.tempgrid[x/50][y/50]);
        temppoints += calculateNearestAlly(x,y); // add the movement points
        var attackdir;
        console.log (x/50 + " " + y/50)
        if (checkGridExists(x/50 +1,y/50) && grid[x/50+1][y/50].isAlly){
            attackdir = 'e';
        }else if (checkGridExists(x/50-1,y/50) && grid[x/50-1][y/50].isAlly){
           attackdir = 'w';
        }else if (checkGridExists(x/50,y/50 + 1) && grid[x/50][y/50+1].isAlly){
            attackdir = 'n';
        }else if (checkGridExists(x/50,y/50 - 1) && grid[x/50][y/50 -1].isAlly){
            attackdir = 's';
        }else{
            attackdir = 'x';
        }


        if (temppoints >= points){
            points = temppoints ;
            MoveActions = this.tempgrid [x/50][y/50];
            AttackActions = attackdir;
            console.log ('points: ' + temppoints);
            console.log ('move: ' + MoveActions);
        }

    };

    this.enemyAction = function (){
        //executes the actions in movearray
        lock = true;

        console.log ("Executing:" + MoveActions);
        this.moveTween(MoveActions);

    };


    this.moveTween = function (moveArray){

        console.log ("doing: " + moveArray + " with points: " + points);
        var units = 0;
        var initialDir = moveArray[0];
        var tweenChain = new Array ();
        var originalx = unit.x;
        var originaly = unit.y;

        for (i =0; i< moveArray.length; i++){
            if (moveArray[i] != initialDir){
                //do the move, set the initialdir to new
                if (initialDir == 'e'){
                    movetween = game.add.tween(unit.spriteframe).to({x:originalx + 50*units,y:originaly},units*150);
                    originalx += 50*units;
                }else if (initialDir == 'w'){
                    movetween = game.add.tween(unit.spriteframe).to({x:originalx - 50*units,y:originaly},units*150);
                    originalx -= 50*units;
                }else if (initialDir == 'n'){
                    movetween = game.add.tween(unit.spriteframe).to({x:originalx,y:(originaly + 50*units)},units*150);
                    originaly += 50*units;
                }else if (initialDir == 's'){
                    movetween = game.add.tween(unit.spriteframe).to({x:originalx,y:originaly - 50*units},units*150);
                    originaly -= 50*units;
                }
                tweenChain.push (movetween);

                units = 0;
                initialDir = moveArray[i];
                units +=1;
            }else{
                units +=1;
            }
        }
        if (initialDir == 'e'){
            movetween = game.add.tween(unit.spriteframe).to({x:originalx + 50*units,y:originaly},units*150);
        }else if (initialDir == 'w'){
            movetween = game.add.tween(unit.spriteframe).to({x:originalx - 50*units,y:originaly},units*150);
        }else if (initialDir == 'n'){
            movetween = game.add.tween(unit.spriteframe).to({x:originalx,y:(originaly + 50*units)},units*150);
        }else if (initialDir == 's'){
            movetween = game.add.tween(unit.spriteframe).to({x:originalx,y:originaly - 50*units},units*150);
        }

        tweenChain.push(movetween);


        for (i = 0;i<tweenChain.length;i++) {

            if (i < tweenChain.length -1){
                tweenChain[i].chain(tweenChain[i+1]);
            }
        }
        tweenChain.slice(-1)[0].onComplete.add(function (){
            console.log ("x");
            //update the global grid to reflect our move
            delete grid[unit.x/50][unit.y/50];

            unit.x =  unit.spriteframe.x;
            unit.y =  unit.spriteframe.y;

            grid[unit.x/50][unit.y/50] = unit;

            if (AttackActions == 'e'){
                battle.normalAttack(unit,grid[unit.x/50 + 1][unit.y/50], this.count);
            }else if (AttackActions == 'w'){
                battle.normalAttack(unit,grid[unit.x/50 - 1][unit.y/50], this.count);
            }else if (AttackActions == 'n'){
                battle.normalAttack(unit,grid[unit.x/50][unit.y/50 + 1], this.count);
            }else if (AttackActions == 's'){
                battle.normalAttack(unit,grid[unit.x/50][unit.y/50 - 1], this.count);
            }else{
                enemyTriggerAi(this.count +=1);
            }

            unit.setTurnOver();
            lock = false;
        },this);
        //trigger next ai
        tweenChain[0].start();
    };


    calculateNearestAlly = function (x,y){
        var nearest = 9999;
        for (var i = 0;i < 10; i++){
            for (var j = 0; j < 16; j++){
                if (grid[i][j] !== undefined && grid[i][j].isAlly){
                    var distance = Math.sqrt (Math.pow((x/50 - i),2) + Math.pow((y/50 - j),2));
                    if (distance <= nearest){
                        nearest = distance;
                    }
                }
            }
        }
        console.log ("distance calculate: " + nearest + " points: " + 100/nearest);
        return 100/nearest;
    }

};