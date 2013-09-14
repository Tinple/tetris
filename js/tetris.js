var grid;
var preview;
var activePiece;
var score;
var level;
var timeout;
var linecount;
var running = false;
var instance_1;
var instance_2;
var next = new Object();
var ctype;
var cstate;    //方块形态代表
var ios = new Object();
var wloaded = false;
var time;
var timeList = [0,0,0];
$(function(){
//缓存图片
	var images = ['background', 'red', 'green', 'yellow', 'purple', 'darkblue', 'orange', 'blue'];
	for(var i=0; i < 8; i++){
		var t = new Image();
		t.src = './images/'+images[i]+'.jpg';
		ios[images[i]] = t;
	}
//填充grid
	for(var i=0;i<273;i++){
		$('#tetris_grid').append('<li class="block" id="'+i+'"></li>')
	}
	for(var i=0;i<25;i++){
		$('#tetris_preview').append('<li class="block" id="pre_'+i+'"></li>')
	}
//初始化游戏，异步加载
	$(window).load(function(){
		init();
		document.onkeydown = keyListener;
		wloaded = true;
	});
});
//初始化游戏
function init(){
	$('#gameOver').hide();
	score = 0;
	level = 1;
	linecount = 0;
	timeout = 1000;
	setGrid(); //初始化grid 标号
	setPreview(); //初始化预览grid 标号
	setPiece();	      //获取第一个方块信息
	getNext();  	//在grid中获取第一个方块
	setPiece();    //获取预览方块及第二个方块信息
	renderGrid(); //涂色grid
	time = '00:00:00';
	$('#score').html(score);
	$('#line').html(linecount);
	$('#level').html(level);
	$('#time').html(time);
}
//游戏循环下降
function loopGame(){
	if(activePiece != 'game over'){
		shiftDown();
		//takeTime();
		if(typeof activePiece == 'boolean'){
			getNext();
			setPiece();
			instance_1 = setTimeout(loopGame, timeout);
		}
		else{
			instance_1 = setTimeout(loopGame, timeout);
		}
		
	}
}
//每个block对象对应一个grid
function block(x, y){
	this.x = x;
	this.y = y;
	this.bcolor = 'background'; 
	this.active = false;    //grid的活动性
	this.available = true; //grid的可用性
	block.prototype.render = function(){    //涂主grid颜色
		$('#'+getB(this.x, this.y)).css({background: 'url('+ios[this.bcolor].src+')'});
	}
	block.prototype.prev = function(){     //涂预览grid颜色
		$('#pre_'+getP(this.x, this.y)).css({background: 'url('+ios[this.bcolor].src+')'});
	}
}
//A
function shiftLeft(){
	var good = true;
	for(i in activePiece){
		if(grid[activePiece[i]].x > 0 && grid[activePiece[i] - 1].available){
		continue;
		}else{
			good = false;
			break;
		}
	}
	if(good){
		var newPiece = [activePiece[0]-1, activePiece[1]-1, activePiece[2]-1, activePiece[3]-1];
		for(j in activePiece){
			set(grid[activePiece[j] - 1], grid[activePiece[j]].bcolor, true, true);
			grid[activePiece[j] - 1].render();
		}//移动后的处理
		for(k in activePiece){if(in_array(activePiece[k] , newPiece)){
			//if(in_array(activePiece[k] + 1, activePiece)){
				set(grid[activePiece[k]], grid[activePiece[k]].bcolor, true, true);
			}else{
				set(grid[activePiece[k]], 'background', false, true);
			}
			grid[activePiece[k]].render();
		}
		activePiece = newPiece; //重新赋值给活动的方块
	}
}
//D
function shiftRight(){
	var good = true;
	for(i in activePiece){
		if(grid[activePiece[i]].x < 12 && grid[activePiece[i] + 1].available){
		continue;
		}else{
			good = false;
			break;
		}
	}
	if(good){
		var newPiece = [activePiece[0]+1, activePiece[1]+1, activePiece[2]+1, activePiece[3]+1];
		for(j in activePiece){
			set(grid[activePiece[j] + 1], grid[activePiece[j]].bcolor, true, true);
			grid[activePiece[j] + 1].render();
		}
		for(k in activePiece){if(in_array(activePiece[k] , newPiece)){
			//if(in_array(activePiece[k] - 1, activePiece)){
				set(grid[activePiece[k]], grid[activePiece[k]].bcolor, true, true);
			}else{
				set(grid[activePiece[k]], 'background', false, true);
			}
			grid[activePiece[k]].render();
		}
		activePiece = newPiece;
	}
}
//下落
function shiftDown(){
	var good = true;
	for(i in activePiece){
		if(grid[activePiece[i]].y < 20 && grid[activePiece[i] + 13].available){
		continue;
		}else{
			good = false;
			break;
		}
	}
	if(good){
		var newPiece = [activePiece[0]+13, activePiece[1]+13, activePiece[2]+13, activePiece[3]+13];
		for(j in activePiece){
			set(grid[activePiece[j] + 13], grid[activePiece[j]].bcolor, true, true);
			grid[activePiece[j] + 13].render();
		}
		for(k in activePiece){
			if(in_array(activePiece[k], newPiece)){
				set(grid[activePiece[k]],grid[activePiece[k]].bcolor,true,true);
			}else{
				set(grid[activePiece[k]], 'background', false, true);
			}			
			grid[activePiece[k]].render();	
		}
		activePiece = newPiece;
	}else{
		for(x in activePiece){
			if(grid[activePiece[x]].y == 0){
				for(j in activePiece){
					grid[activePiece[j]].render();
				}
				running = false;
				endGame();
				return;
			}
		}
		for(i in activePiece){
			set(grid[activePiece[i]], grid[activePiece[i]].bcolor, false, false);
			//grid[activePiece[i]].render();
		}
		var line;
		var filledLines = [];
		
		for(j in activePiece){ //检查是否有满行
			line = grid[activePiece[j]].y;
			filled = true;
			for(var i=0; i<13; i++){	
				if(grid[line*13 + i].available){
				filled = false;
				break;
				}
			}
			if(filled && !in_array(line, filledLines)){
				filledLines.push(line);
			}         //将满行的y加到数组中
		}
		
		if(filledLines.length > 0){ 
			filledLines = filledLines.sort(function(a, b){return b - a;});//从大到小 
			for(x in filledLines){
				clearLine(filledLines[x] + (+x)); //convert x as it's a string for some reason...
			}
			if(filledLines.length == 1){
				score += 40;
			}else if(filledLines.length == 2){
				score += 100;
			}else if(filledLines.length == 3){
				score += 300;
			}else{
				score += 600;
			}
			$('#score').html(score);
			$('#line').html(linecount);
		}
		activePiece = false;
	}
}
//S
function dropPiece(){
	shiftDown();
	if(activePiece == false){
		getNext();
		setPiece();
	}
}

function setGrid(){
	grid = [];
	for(var i=0; i < 21; i++){
		for(var j=0; j<13; j++){
			grid.push(new block(j, i));
		}
	}
}

function setPreview(){
	preview = [];
	for(var i=0; i < 5; i++){
		for(var j=0; j<5; j++){
			preview.push(new block(j, i));
		}
	}
}
//设置block对象属性
function set(block, bcolor, active, available){
	block.bcolor = bcolor;
	block.active = active;
	block.available = available;
}
//消行
function clearLine(line){  //消行后对其他行擦屁股
	for(var i=((13*line) + 12); i>0; i--){
		if(grid[i].y != 0){
			set(grid[i], grid[i-13].bcolor, grid[i-13].active, grid[i-13].available);
			grid[i].render();
		}
	}
	if(++linecount % 13 == 0){
		$('#level').html(++level);
		timeout -= 25;
	}
}
//涂grid
function renderGrid(){
	for(var x=0; x<273; x++){
		grid[x].render();
	}
}
//涂预览grid
function renderPreview(){
	for(var x=0; x<25;x++){
		set(preview[x], 'background', false, true);
	}
	switch(next.btype){
		case 'sq':
			set(preview[getP(1,1)], next.bcolor, true, true);
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(1,2)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			break;
		case 'rs':
			set(preview[getP(3,1)], next.bcolor, true, true);
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(1,2)], next.bcolor, true, true);
			break;
		case 'ls':
			set(preview[getP(1,1)], next.bcolor, true, true);
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(3,2)], next.bcolor, true, true);
			break;
		case 'rl':
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(2,3)], next.bcolor, true, true);
			set(preview[getP(3,3)], next.bcolor, true, true);
			break;
		case 'll':
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(2,3)], next.bcolor, true, true);
			set(preview[getP(1,3)], next.bcolor, true, true);
			break;
		case 'tee':
			set(preview[getP(1,2)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(3,2)], next.bcolor, true, true);
			set(preview[getP(2,3)], next.bcolor, true, true);
			break;
		case 'ln':
			set(preview[getP(2,1)], next.bcolor, true, true);
			set(preview[getP(2,2)], next.bcolor, true, true);
			set(preview[getP(2,3)], next.bcolor, true, true);
			set(preview[getP(2,4)], next.bcolor, true, true);
			break;0
	}
	for(x=0; x<25; x++){
		preview[x].prev();
	}
}
//下一个方块在grid的信息
function getNext(){
	for(x in next.positions){
		set(grid[next.positions[x]], next.bcolor, true, true);
	}
	ctype = next.btype;
	cstate = 1;
	activePiece = next.positions;
}
//随机获取下一个方块，并预览，next.position保存在grid坐标上
function setPiece(){
	var pieces = ['ls', 'rs', 'sq', 'rl', 'll', 'ln', 'tee']
	switch(pieces[Math.floor(Math.random() * 7)]){
		case 'sq':
			next.positions = [getB(5, 0), getB(6, 0), getB(6, 1), getB(5, 1)];
			next.btype = 'sq';
			next.bcolor = 'yellow';
			renderPreview();
			break;
		case 'ls':
			next.positions = [getB(4, 0), getB(5, 0), getB(5, 1), getB(6, 1)];
			next.btype = 'ls';
			next.bcolor = 'purple';
			renderPreview();
			break;
		case 'rs':
			next.positions = [getB(6, 0), getB(5, 0), getB(5, 1), getB(4, 1)];
			next.btype = 'rs';
			next.bcolor = 'green';
			renderPreview();
			break;
		case 'rl':
			next.positions = [getB(5, 0), getB(5, 1), getB(5, 2), getB(6, 2)];
			next.btype = 'rl';
			next.bcolor = 'orange';
			renderPreview();
			break;
		case 'll':
			next.positions = [getB(6, 0), getB(6, 1), getB(6, 2), getB(5, 2)];
			next.btype = 'll';
			next.bcolor = 'darkblue';
			renderPreview();
			break;
		case 'tee':
			next.positions = [getB(5, 0), getB(6, 0), getB(7, 0), getB(6, 1)];
			next.btype = 'tee';
			next.bcolor = 'red';
			renderPreview();
			break;
		case 'ln':
			next.positions = [getB(6, 0), getB(6, 1), getB(6, 2), getB(6, 3)];
			next.btype = 'ln';
			next.bcolor = 'blue';
			renderPreview();
		break;
	}
}
//W
function shiftState(){
	var newPiece = [];
	switch(ctype){
		case 'rs':
			if(cstate == 1){
				newPiece.push(getB(grid[activePiece[0]].x-2, grid[activePiece[0]].y), getB(grid[activePiece[1]].x-1, grid[activePiece[1]].y+1), activePiece[2], getB(grid[activePiece[3]].x+1, grid[activePiece[3]].y+1));
				if(free(newPiece)){
					shiftRSnake(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else{
				if(grid[activePiece[2]].x == 12){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x+2, grid[activePiece[0]].y), getB(grid[activePiece[1]].x+1, grid[activePiece[1]].y-1), activePiece[2], getB(grid[activePiece[3]].x-1, grid[activePiece[3]].y-1));
				if(free(newPiece)){
					shiftLSnake(newPiece);
					cstate = 1;
				}else{
					newPiece = activePiece;
				}
			}
			break;
		case 'ls':
			if(cstate == 1){
				newPiece.push(getB(grid[activePiece[0]].x+2, grid[activePiece[0]].y), getB(grid[activePiece[1]].x+1, grid[activePiece[1]].y+1), activePiece[2], getB(grid[activePiece[3]].x-1, grid[activePiece[3]].y+1));
				if(free(newPiece)){
					shiftRSnake(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else{
				if(grid[activePiece[2]].x == 0){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x-2, grid[activePiece[0]].y), getB(grid[activePiece[1]].x-1, grid[activePiece[1]].y+-1), activePiece[2], getB(grid[activePiece[3]].x+1, grid[activePiece[3]].y-1));
				if(free(newPiece)){
					shiftLSnake(newPiece);
					cstate = 1;
				}else{
					newPiece = activePiece;
				}
			}
			break;
		case 'rl':
			if(cstate == 1){
				if(grid[activePiece[1]].x == 0){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x, grid[activePiece[3]].y-2));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 2){
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x-2, grid[activePiece[3]].y));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 3;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 3){
				if(grid[activePiece[1]].x == 12){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x, grid[activePiece[3]].y+2));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 4;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 4){
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x+2, grid[activePiece[3]].y));
					if(free(newPiece)){
						shiftRL(newPiece);
						cstate = 1;
					}else{
						newPiece = activePiece;
					}
			}
			break;
		case 'll':
			if(cstate == 1){
				if(grid[activePiece[1]].x == 12){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x, grid[activePiece[3]].y-2));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 2){
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x+2, grid[activePiece[3]].y));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 3;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 3){
				if(grid[activePiece[1]].x == 0){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x, grid[activePiece[3]].y+2));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 4;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 4){
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x-2, grid[activePiece[3]].y));
				if(free(newPiece)){
					shiftRL(newPiece);
					cstate = 1;
				}else{
					newPiece = activePiece;
				}
			}
			break;
		case 'ln':
			if(cstate == 1){
				if(grid[activePiece[2]].x > 10 || grid[activePiece[2]].x == 0){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x+2, grid[activePiece[0]].y+2), getB(grid[activePiece[1]].x+1, grid[activePiece[1]].y+1), activePiece[2], getB(grid[activePiece[3]].x-1, grid[activePiece[3]].y-1));
				if(free(newPiece)){
					shiftLine(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else{
				newPiece.push(getB(grid[activePiece[0]].x-2, grid[activePiece[0]].y-2), getB(grid[activePiece[1]].x-1, grid[activePiece[1]].y-1), activePiece[2], getB(grid[activePiece[3]].x+1, grid[activePiece[3]].y+1));
				if(free(newPiece)){
					shiftLine(newPiece);
					cstate = 1;
				}else{
					newPiece = activePiece;
				}
			}
			break;
		case 'tee':
			if(cstate == 1){
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x+1, grid[activePiece[3]].y-1));
				if(free(newPiece)){
					shiftTee(newPiece);
					cstate = 2;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 2){
				if(grid[activePiece[1]].x == 0){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x+1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x-1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x-1, grid[activePiece[3]].y-1));
				if(free(newPiece)){
					shiftTee(newPiece);
					cstate = 3;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 3){
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y-1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y+1), getB(grid[activePiece[3]].x-1, grid[activePiece[3]].y+1));
				if(free(newPiece)){
					shiftTee(newPiece);
					cstate = 4;
				}else{
					newPiece = activePiece;
				}
			}else if(cstate == 4){
				if(grid[activePiece[1]].x == 12){
					newPiece = activePiece; 
					break;
				}
				newPiece.push(getB(grid[activePiece[0]].x-1, grid[activePiece[0]].y+1), activePiece[1], getB(grid[activePiece[2]].x+1, grid[activePiece[2]].y-1), getB(grid[activePiece[3]].x+1, grid[activePiece[3]].y+1));
				if(free(newPiece)){
					shiftTee(newPiece);
					cstate = 1;
				}else{
					newPiece = activePiece;
				}
			}
			break;
		default :
			newPiece = activePiece;
			break;
	}
	activePiece = newPiece;
}
function shiftRL(newPiece){
	set(grid[newPiece[0]], grid[activePiece[0]].bcolor, true, true);
	grid[newPiece[0]].render();
	set(grid[activePiece[0]], 'background', false, true);
	grid[activePiece[0]].render();
	set(grid[newPiece[2]], grid[activePiece[2]].bcolor, true, true);
	grid[newPiece[2]].render();
	set(grid[activePiece[2]], 'background', false, true);
	grid[activePiece[2]].render();
	set(grid[newPiece[3]], grid[activePiece[3]].bcolor, true, true);
	grid[newPiece[3]].render();
	set(grid[activePiece[3]], 'background', false, true);
	grid[activePiece[3]].render();
}
function shiftLine(newPiece){
	set(grid[newPiece[0]], grid[activePiece[0]].bcolor, true, true);
	grid[newPiece[0]].render();
	set(grid[activePiece[0]], 'background', false, true);
	grid[activePiece[0]].render();
	set(grid[newPiece[1]], grid[activePiece[1]].bcolor, true, true);
	grid[newPiece[1]].render();
	set(grid[activePiece[1]], 'background', false, true);
	grid[activePiece[1]].render();
	set(grid[newPiece[3]], grid[activePiece[3]].bcolor, true, true);
	grid[newPiece[3]].render();
	set(grid[activePiece[3]], 'background', false, true);
	grid[activePiece[3]].render();
}
function shiftTee(newPiece){
	set(grid[newPiece[0]], grid[activePiece[0]].bcolor, true, true);
	grid[newPiece[0]].render();
	set(grid[activePiece[0]], 'background', false, true);
	grid[activePiece[0]].render();
	set(grid[newPiece[2]], grid[activePiece[2]].bcolor, true, true);
	grid[newPiece[2]].render();
	set(grid[newPiece[3]], grid[activePiece[3]].bcolor, true, true);
	grid[newPiece[3]].render();
}
function shiftRSnake(newPiece){
	set(grid[newPiece[0]], grid[activePiece[0]].bcolor, true, true);
	grid[newPiece[0]].render();
	set(grid[activePiece[0]], 'background', false, true);
	grid[activePiece[0]].render();
	set(grid[newPiece[1]], grid[activePiece[1]].bcolor, true, true);
	grid[newPiece[1]].render();
	set(grid[activePiece[1]], 'background', false, true);
	grid[activePiece[1]].render();
	set(grid[newPiece[3]], grid[activePiece[3]].bcolor, true, true);
	grid[newPiece[3]].render();
}
function shiftLSnake(newPiece){
	set(grid[newPiece[0]], grid[activePiece[0]].bcolor, true, true);
	grid[newPiece[0]].render();
	set(grid[activePiece[0]], 'background', false, true);
	grid[activePiece[0]].render();
	set(grid[newPiece[1]], grid[activePiece[1]].bcolor, true, true);
	grid[newPiece[1]].render();
	set(grid[activePiece[1]], 'background', false, true);
	grid[activePiece[1]].render();
	set(grid[newPiece[3]], grid[activePiece[3]].bcolor, true, true);
	grid[newPiece[3]].render();
	set(grid[activePiece[3]], 'background', false, true);
	grid[activePiece[3]].render();
}
//onkeydown事件
function keyListener(e){   //FF的event只能在事件发生时使用，传入参数
	if(running && activePiece != 'game_over'){
		var evt=(e)?e:(window.event)?window.event:null; //IE-window.event
		var keyCode = evt.which ? evt.which : evt.keyCode;//兼容IE、FF、OP
		if(keyCode==65){
			shiftLeft();
		}else if(keyCode==68){
			shiftRight();
		}else if(keyCode==83){
			dropPiece();
		}else if(keyCode==87){
			shiftState();
		}
	}
}
//button值的改变
function toggleTetris(){
	if(wloaded){
		if(running){  //暂停
			clearTimeout(instance_1);
			clearTimeout(instance_2);
			running = false;
			$(':button').val('开始');
		}else if(activePiece == 'game over'){
			$('#level').html('1'); $('#score').text('0');

			running = true;
			$(':button').val('暂停');
						init();
			loopGame();
			takeTime();
		}else{
			
			running = true;
			$(':button').val('暂停');
			loopGame();
			takeTime();
		}
	}
}
//获取grid中每个grid代表的坐标
function getB(x, y){
	return (y == 0) ? x : (13*y) + x;
}
//获得预览grid中每个grid代表的坐标
function getP(x, y){
	return (y == 0) ? x : (5*y) + x;
}
function in_array(obj, array) {
	for ( var x = 0 ; x <= array.length ; x++ ) {
		if ( array[x] == obj ) return true;
	}
	return false;
}
function endGame(){
	clearTimeout(instance);
	activePiece = 'game over';
	$('#gameOver').show();
	$(':button').val('开始');
}
function takeTime(){
 	timeList[0]++;
	var times = [];
	for(var j = 0;j < 2;j++){
		if(timeList[j] > 59){
			timeList[j] = 0;
			timeList[j + 1]++;
		}
	}
	for(var i = 0; i < 3;i++){
		timeList[i] < 10 ? times[i] = '0' + timeList[i] : times[i] = timeList[i];
	}
	var time = times[2] + ':' + times[1] + ':' + times[0];
	$('#time').html(time);
	instance_2 = setTimeout(takeTime,1000);
	
	return time;
	
}
function free(piece){
	if(Math.max.apply( Math, piece ) < 272 && Math.min.apply( Math, piece ) > 0){
		for(i in piece){
			if(!grid[piece[i]].available){
				return false;
			}
		}
		return true;
	}else{
		return false;
	}
}