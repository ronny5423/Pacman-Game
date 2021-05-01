//usersDict : [userName] = [password, fullName, email, birthDate]
let usersDict={"k":["k", "", "", ""]};
let currentDisplayedDiv="#welcomeContainer";
let keys={"Up":"","Down":"","Left":"","Right":""};
let validSettingsData=true;
let ballsNumber=0;
let timeOfGame=0;
let monstersNumber=0;
let ballsColors={};
let board=new Array(15);
let intervalTimer;
let score = 0;
let angle = 0;
let swicthAngle = -1;
let pacDirection = "right";
let pacSpeed = 10;
let pacX = 0;
let pacY = 0;
let pacRadius = 15;
let ctx;
let loggedUser;
let gameIntervals=[];
let cherryX = 0;
let cherryY = 0;
let cherrySpeedX = 5;
let cherrySpeedY = 5;
let sizeX = 900 / board.length;
let sizeY;
let ghostsPositions=[];
let ghostsArr;
let ghostWidth = 50;
let ghostHeigh = 40;
let ghostSpeed;
let ghostTarget = []
let ghostGoToCorner = [];
let countCandy = 0;
let radiusCandys = {5:12, 15:8, 25:4};
let backgroundSong=new Audio("Official-Anthem.wav");
let lives=5;
let medicationX;
let medicationY;
let strawberryX;
let strawberryY;
let medicationPosition = [];
let strawberryPosition = [];
let slowMotionTime = -500;
let bonusTime;
let bonusTimeTolive = 100*5;
let gameStopped=false;
let musicStopped=false;

// add method that checks if the password contains 1 digit and 1 letter to validator
$(function(){
	$.validator.addMethod("checkPassword",function(value,element){
		let containsLetters=false;
	let containDigits=false;
	for(let i=0;i<value.length;i++){//loop over password and check if contains letters or digits
		let asciiValue=value.charAt(i).charCodeAt(0);
		if(!containDigits){//check if contain digits
			if(asciiValue>=48 && asciiValue<=57){
				containDigits=true;
				continue;
			}
		}
		if(!containsLetters){//check if contain letters
			if(asciiValue>=65 && asciiValue<=122){
				containsLetters=true;
				continue;
			}
		}
	}
	if(!containDigits || !containsLetters){
		//showErrorMessage("#passwordRegError","Password must contain digits and letters");
		return false;
	}
	return true;
	});
})

// add method that checks if user name is free to validator
$(function(){
	$.validator.addMethod("freeUserName",function(value,element){
		return !(value in usersDict);
	});
})

//add method that checks if full name contains only letters
$(function(){
	$.validator.addMethod("checkName",function(value,element){
		for(let i=0;i<value.length;i++){
			let asciiValue=value.charAt(i).charCodeAt(0);
			if(!((asciiValue<123 && asciiValue>96) || (asciiValue>=65 && asciiValue<=90)) && asciiValue!=32){
				return false;
			}
		}
		return true;
	})
})

$(document).ready(function(){
	ctx=document.getElementById("myCanvas").getContext("2d");
	let slider=document.getElementById("ballsSlider");
	let ballsValue=document.getElementById("ballsValue");
	slider.oninput=function(){
		ballsValue.innerHTML=this.value;//change html label value when user using the slider
	}
	let monstersSlider=document.getElementById("monstersSlider");
	let monstersValue=document.getElementById("monstersNumber");
	monstersSlider.oninput=function(){
		monstersValue.innerHTML=this.value;
	}
	window.addEventListener("keydown",function(event){
		if(["Space","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Tab","Enter"].indexOf(event.code)>-1){
			event.preventDefault();
		}
	},false);
	$("#fullName").keyup(function(event){
		if(event.keyCode == 32){
			$("#fullName").val($("#fullName").val()+' ');
		}
	}); 
	$("#registerForm").validate({//validate registration using jquery validator
		rules:{
			userName:{
				required:true,
				freeUserName:true
			},
			password:{
				required:true,
				checkPassword:true,
				minlength:6
			},
			fullName:{
				required:true,
				checkName:true
			},
			email:{
				required:true,
				email:true
			},
			birthDate:"required"
		},
		messages:{
			userName:{
				required:"Please enter user name",
				freeUserName:"Username isn't free"
			},
			password:{
				required:"Please enter password",
				checkPassword:"Password must contain at least 1 letter and 1 digit",
				minlength:"Password must be at least 6 chars"
			},
		fullName:{
			required:"Please enter full name",
			checkName:"Full name must contain only letters"
		},
		email:{
			required:"Please enter email",
			email:"email isn't valid"
		},
		birthDate:"Please enter birth date"},
		submitHandler:function(form,event){
			let userName=$("#userName").val();
			let password=$("#password").val();
			let fullName=$("#fullName").val();
			let email=$("#email").val();
			let birthDate=$("#birthDate").val();
			usersDict[userName]=[password, fullName, email, birthDate];
			form.reset();
			showWelcomeScreen();
		}
	})

	});

/**
 * This function validates the entered data after log in
 */
function validateDetailsAfterLogIn(){
	let validLogIn=true;
	$(".errorFormRow").css("display","none");
	let userName=$('#LIuserName').val();
	if(userName==""){//if user name empty
		showErrorMessage("#errorLogInUsername","Empty user name");
		validLogIn=false;
	}
	
	let password=$("#LIpassword").val();
	if(password==""){//if password empty
		showErrorMessage("#errorPasswordLogIn","Empty password");
		validLogIn=false;
	}

	if (!(userName in usersDict)){//if user name exist
		showErrorMessage("#errorLogInUsername","User name doesn't exist");
		validLogIn=false;
	}

	if (validLogIn && password == usersDict[userName][0]){//if password match to username
		loggedUser=userName;
		showSettings();
	}
	else{
		showErrorMessage("#errorPasswordLogIn","Password incorrect");
	}
}
/**
 * This function shows relevant error message
 * @param {*} rowId jquery selector of the error row element
 * @param {*} message  message to show
 */
function showErrorMessage(rowId,message){
	$(rowId).html(message);
	$(rowId).css("display","block");
}

//this function shows register screen
function register(){
	$(".errorFormRow").css("display","none");
	document.getElementById("registerForm").reset();//reset register form
	switchDivs("#outerRegisterDiv","flex");	
}

//this function shows log in screen
function logIn(){
	$(".errorFormRow").css("display","none");
	document.getElementById("logInForm").reset();//reset log in form
	switchDivs("#outerLogInDiv","flex");
}

//this function shows welcome screen
function showWelcomeScreen(){
	switchDivs("#welcomeContainer","flex");
}

//this function shows choose settings screen
function showSettings(){
	document.getElementById("settingsForm").reset();
	changeSettingsReadOnlyPrperty(false);
	switchDivs("#gameAndSettingsDiv","flex");
	$("#settingsDiv").css("display","block");
	$("#gameDiv").css("display","none");
	$("#settingsButton").css("display","block");
	$("#randomButton").css("display","block");
	$("#monstersNumber").html("2");
	$("#ballsValue").html("60");
	document.getElementById("keyUp").placeholder="Press any key";
	document.getElementById("keyDown").placeholder="Press any key";
	document.getElementById("keyLeft").placeholder="Press any key";
	document.getElementById("keyRight").placeholder="Press any key";
	document.getElementById("gameTimeInput").placeholder="Min. 60 seconds";
	$(".explanationRow").css("display","none");
	}

/**
 * This method switch between the current screen and new screen
 * @param {*div} newDivToSwitchTo the new div to show 
 * @param {string} display  a string value of how display the div(flex,inline etc...)
 */
function switchDivs(newDivToSwitchTo,display){
	if(currentDisplayedDiv=="#gameAndSettingsDiv"){
		stopGamesIntervals();
		backgroundSong.pause();
		backgroundSong.currentTime=0;
	}
	$(currentDisplayedDiv).css("display","none");
	currentDisplayedDiv=newDivToSwitchTo;
	$(newDivToSwitchTo).css("display",display);
}

/**
 * This function stop the game intervals when game is finished
 */
function stopGamesIntervals(){
	gameIntervals.forEach(function(item){
		clearInterval(item);
	});
	gameIntervals=[];
	backgroundSong.pause();//stop background song
	
}

/**
 * This function gets the keys the user press for movment and show them to the user
 */
$(document).ready(function(){
	setKeyPressed("#keyUp");
	setKeyPressed("#keyDown");
	setKeyPressed("#keyLeft");
	setKeyPressed("#keyRight");
});

/**
 * This function sets a listener for each user input key to show the user the key he pressed
 * @param {*} keyIdToSet key input id to set the listener to
 */
function setKeyPressed(keyIdToSet){
	$(keyIdToSet).keydown(function(event){
		$(keyIdToSet).attr("placeholder",event.key);
		$(keyIdToSet).val(event.key);
	});
}

/**
 * This function validates the settings the user choose
 */
function validateSettings(){
	$(".errorRow").css("display","none");
	validSettingsData=true;
	let keyup=$("#keyUp").val();
	let keyDown=$("#keyDown").val();
	let keyLeft=$("#keyLeft").val();
	let keyRight=$("#keyRight").val();
	let numberOfBalls=$("#ballsSlider").val();
	let fivePointsBallColor=$("#fivePointsColorPicker").val();
	let fifteenPointsColorPicker=$("#fifteenPointsColorPicker").val();
	let twentyFivePointsColorPicker=$("#twentyFivePointsColorPicker").val();
	let gameTime=$("#gameTimeInput").val();
	let numberOfMonsters=$("#monstersSlider").val();
	checkKeysSettings(keyup,keyDown,keyLeft,keyRight);//check keys
	if(checkSingleNumericValue(gameTime,60,0,"#gameTimeError","","Game time must be at least 60 seconds!")){//check the time
		timeOfGame=parseInt(gameTime);
	}
	if(validSettingsData){//if all settings input are valid
		ballsColors["5"]=fivePointsBallColor;
		ballsColors["15"]=fifteenPointsColorPicker;
		ballsColors["25"]=twentyFivePointsColorPicker;
		ballsNumber=parseInt(numberOfBalls);
		monstersNumber=parseInt(numberOfMonsters);
		changeSettingsReadOnlyPrperty(true);
		$("#stopGameButton").css("display","inline");
		$("#resumeGameButton").css("display","inline");
		$("#stopMusicButton").css("display","inline");
		$("#resumeMusicButton").css("display","inline");
		$(".explanationRow").css("display","block");
		startGame();
		$("#gameDiv").css("display","flex");
	}
}

/**
 * This function checks the time entered by the user
 * @param {} numericValue time to check
 * @param {*} min min value of time
 * @param {*} max max value of time(0 if not upper bounded)
 * @param {*} rowId jquery row selector of the error row
 * @param {*} message1 
 * @param {*} message2 error message
 * @returns 
 */
function checkSingleNumericValue(numericValue,min,max,rowId,message1,message2){
	if(numericValue==""){//if empty
		$(rowId+" td").html("Please enter value");
		$(rowId).css("display","block");
		validSettingsData=false;
		return false;
	}
	if(isNaN(numericValue)){//if not a number
		$(rowId+" td").html(message1);
		$(rowId).css("display","block");
		validSettingsData=false;
		return false;
	}
	let intNumericValue=parseInt(numericValue);
	if(max==0){
		if(intNumericValue<min){//if less than 60 seconds
			$(rowId+" td").html(message2);
			$(rowId).css("display","block");
			validSettingsData=false;
			return false;
		}
		return true;
	}
	if(intNumericValue<min || intNumericValue>max){//if not in range
		$(rowId+" td").html(message2);
		$(rowId).css("display","block");
		validSettingsData=false;
		return false;
	}
	return true;
}

/**
 * This function check the keys entered by the user
 * @param {} keyUp string value of key up
 * @param {*} keyDown string value of key down
 * @param {*} keyLeft string value of key left
 * @param {*} keyRight string value of key right
 */
function checkKeysSettings(keyUp,keyDown,keyLeft,keyRight){
	showKeyErrorMessage(keyUp,"#errorKeyUp","Up");
	showKeyErrorMessage(keyDown,"#errorKeyDown","Down");
	showKeyErrorMessage(keyLeft,"#errorLeftKey","Left");
	showKeyErrorMessage(keyRight,"#rightKeyError","Right");
	if(validSettingsData){// if all keys were inserted
		let showed=false;
		$.each(keys,function(index,value){//check if there is no 2 same keys
			$.each(keys,function(index1,value1){
				if(index!=index1){
					if(value==value1 && !showed){
						validSettingsData=false;
						alert("2 keys are the same");
						showed=true;
					}
				}
			});
		});
	}
}

/**
 * This function checks if the key is empty and if yes shows error message
 * @param {*} keyToCheck the key to check
 * @param {*} rowId jquery selector of error row to show
 * @param {*} direction direction of the key(up,down,left,right)
 */
function showKeyErrorMessage(keyToCheck,rowId,direction){
	if(keyToCheck==""){//check if key is empty
		$(rowId).css("display","block");
		validSettingsData=false;
		}
	
	else{
		keys[direction]=keyToCheck;
	}
}

/**
 * This function generate random settings
 */
function generateRandomSettings(){
	keys["Up"]="ArrowUp";
	keys["Down"]="ArrowDown";
	keys["Left"]="ArrowLeft";
	keys["Right"]="ArrowRight";
	timeOfGame=Math.floor(Math.random()*120)+60;
	monstersNumber=Math.floor(Math.random()*4)+1;
	ballsNumber=Math.floor(Math.random()*40)+50;
	ballsColors["5"]=getRandomColor();
	ballsColors["15"]=getRandomColor();
	ballsColors["25"]=getRandomColor();
	updateSettingsValues();
	}

	/**
	 * This function generates random color
	 * @returns str random color
	 */
function getRandomColor() {
	let letters = '0123456789ABCDEF';
	let color = '#';
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

/**
 * This function updates the settings values in html
 */
function updateSettingsValues(){
	$("#keyUp").val("ArrowUp");
	$("#keyDown").val("ArrowDown");
	$("#keyLeft").val("ArrowLeft");
	$("#keyRight").val("ArrowRight");
	$("#ballsSlider").val(ballsNumber.toString());
	$("#fivePointsColorPicker").val(ballsColors["5"]);
	$("#fifteenPointsColorPicker").val(ballsColors["15"]);
	$("#twentyFivePointsColorPicker").val(ballsColors["25"]);
	$("#gameTimeInput").val(timeOfGame.toString());
	$("#monstersSlider").val(monstersNumber.toString());
	document.getElementById("ballsValue").innerHTML=ballsNumber;
	document.getElementById("monstersNumber").innerHTML=monstersNumber;
}

/**
 * This function creates the game board
 */
function generateBoard(){
	// init board
	for(let i=0;i<board.length;i++){
		board[i]=new Array(10);
		for(let j=0;j<board[i].length;j++){
			board[i][j]=0;
		}
	}
	sizeY=450 / board[0].length;
	setWallsOnBoard();//set walls in board
	setBallsOnBoard();//set balls in board
	$("#settingsButton").css("display","none");
	$("#randomButton").css("display","none");
	
}
/**
 * This function sets the walls of the board
 */
function setWallsOnBoard(){
	board[1][0]=1;
	board[2][0]=1;
	board[3][0]=1;
	board[2][1]=1;
	board[3][1]=1;
	board[5][1]=1;
	board[1][8]=1;
	board[1][9]=1;
	board[3][7]=1;
	board[3][8]=1;
	board[4][7]=1;
	board[4][8]=1;
	board[5][7]=1;
	board[5][8]=1;
	board[7][0]=1;
	board[7][1]=1;
	board[8][0]=1;
	board[7][4]=1;
	board[7][5]=1;
	board[8][3]=1;
	board[8][4]=1;
	board[8][5]=1;
	board[8][6]=1;
	board[11][1]=1;
	board[12][1]=1;
	board[11][7]=1;
	board[11][8]=1;
	board[12][7]=1;
	board[12][8]=1;
}

/**
 * This function generates balls on board
 */
function setBallsOnBoard(){
	let numberOfFiveBalls = parseInt(ballsNumber * 0.6);
	let numberOfFifteen = parseInt(ballsNumber * 0.3);
	let numberOfTwentyFive = ballsNumber - numberOfFiveBalls - numberOfFifteen;
	let arrayOfCounters = [numberOfFiveBalls, numberOfFifteen, numberOfTwentyFive];
	let counter = ballsNumber;
	let numToPrice = {0:5, 1:15, 2:25};
	(function() {
		while(counter > 0)
		{
			//generate random position to set the ball
			let i = Math.floor(Math.random()*board.length);
			let j = Math.floor(Math.random()*board[0].length);
			if(board[i][j]==0){//if free cell
				let ball = Math.floor(Math.random()*3);
				while(arrayOfCounters[ball]==0){//if no free balls of the type choosen are left
					ball=Math.floor(Math.random()*3);
				}
				board[i][j] = numToPrice[ball];
				arrayOfCounters[ball]--;
				counter--;
			}
		}
	})();
}

/**
 * This function shuffels the directions to go
 * @returns shuffled directions array
 */
function createDirections(){
	let directions=[1,2,3,4];
	for (let i = directions.length - 1; i > 0; i--) {//shuffle directions
        const j = Math.floor(Math.random() * (i + 1));
        [directions[i], directions[j]] = [directions[j], directions[i]];
    }
	return directions;
}

/**
 * function before start game
 */
function startGame(){
	$("#userNameToShow").html(loggedUser);
	initParams();
	$("#scoreLabel").html("0");
	backgroundSong.loop=true;
	backgroundSong.play();
	generateBoard();
	initPacmanPosition();
	initCherry();
	initGhostPositions();
	initGhostsArr();
	setGameIntervals();
	drawLives();
	initBonusPosition("medication");
	initGhostCorners();
}

/**
 * This function initializes the parameters needed for the game before the game starts
 */
function initParams(){
	countCandy=0;
	score=0;
	lives = 5;
	pacSpeed = 4;
	gameStopped=false;
	ghostSpeed = 1.5;
	backgroundSong.volume = 0.5;
	musicStopped=false;
}

/**
 * This function sets the game intervals(clock and canvas)
 */
function setGameIntervals(){
	intervalTimer = setInterval(main, 25); // Execute as fast as possible
	gameIntervals.push(intervalTimer);
	setGameTimer();
	drawLives();
}

/**
 * interval function
 */
function main(){
	drawMap();
	drawBonuses();
	handleCherry();	

	drawGhosts();
	drawPacman();
	movePacman();
	changeGhostsLocations();
}

/**
 * This function updates the time label with current time in format MM:SS
 */
function setGameTimeLabel(){
	let minutes=0;
	let time=timeOfGame;
	while(time>=60){
		minutes++;
		time-=60;
	}
	if(time<10){
		$("#timeLabel").html("0"+minutes+":0"+time.toString());
	}
	else{
		$("#timeLabel").html("0"+minutes+":"+time.toString());
	}
	
}

/**
 * function for game finish.
 */
function finishGame(){
	drawMap();
	drawBonuses();
	handleCherry();	

	drawGhosts();
	drawPacman();
	stopGamesIntervals();

	if(score<100){
		alert("You are better than "+score.toString()+" points!");
	}
	else{
		alert("Winner!!!");
	}
	$("#stopGameButton").css("display","none");
	$("#resumeGameButton").css("display","none");
	$("#stopMusicButton").css("display","none");
	$("#resumeMusicButton").css("display","none");
	backgroundSong.currentTime=0;
	gameStopped=true;
}

/**
 * This function handle the cherry movement, direction, draw and check if touch pacman.
 */
function handleCherry(){
	if (pacmanContact(cherryX+10, cherryY+5, 26, 22)){//if pacman touch cherry
		initCherry();
		changeScore(50);
	}

	cherryX += cherrySpeedX;
	cherryY += cherrySpeedY;

	//check if not going out of canvas width
	if (cherryX+50 >= 900 || cherryX <= 0)
		cherrySpeedX *= -1;
	
		//check if not going out of canvas height
	if (cherryY+40 >= 450 || cherryY <= 0)
		cherrySpeedY *= -1;

	let img = new Image();
	img.src = "Img/cherry.png";
	ctx.drawImage(img, cherryX, cherryY, 50, 40);
}

/**
 * This function initializes the cherry at the start of the game
 */
function initCherry(){
	cherryX = 900/2;
	cherryY = 450/2;

	let cherrySpeed = 5;
	if (Math.random() > 0.5)
		cherrySpeedX = cherrySpeed;
	else
		cherrySpeedX = -1 * cherrySpeed;

	if (Math.random() > 0.5)
		cherrySpeedY = cherrySpeed;
	else
		cherrySpeedY = -1 * cherrySpeed;
	handleCherry();
}

/**
 * This function draws the board in each interval
 */
function drawMap(){
	ctx.clearRect(0, 0, 900, 450);
	for(let x=0; x<board.length; x+=1){
		for(let y=0; y<board[0].length; y+=1){
			if (board[x][y] == 1){//if wall
				ctx.fillStyle = "black";
				ctx.fillRect(x*sizeX, y*sizeY, sizeX, sizeY);
			}
			else{
				ctx.fillStyle = "white";
				ctx.fillRect(x*sizeX, y*sizeY, sizeX, sizeY);
				if (board[x][y] != 0){
					// draw candy
					ctx.beginPath();
					ctx.fillStyle = ballsColors[board[x][y]];
					ctx.arc(x*sizeX + sizeX/2, y*sizeY + sizeY/2, radiusCandys[board[x][y]], 0, Math.PI*2);
					ctx.fill();
										
				}
			}				
		}
	}
}

/**
 * This function draws the pacman in each interval
 */
function drawPacman(){
	
	//change size of the mouth.
	if (angle > 0.188 || angle < 0.0001)
		swicthAngle *= -1;
	angle = swicthAngle * 0.02 + angle;

	switch (pacDirection) {//draw pacman in direction(up/down/left/right)
		case "right":
			drawPacmanInDirection(0.2,1.8,pacX,pacY-10);
			break;
		
		case "left":
			drawPacmanInDirection(1.2,0.8,pacX,pacY-10);
			break;

		case "up":
			drawPacmanInDirection(1.7,1.3,pacX+10,pacY);
			break;
			
		case "down":
			drawPacmanInDirection(0.7,0.3,pacX-10,pacY);
			break;

		default:
			break;
	}
}

/**
 * This function draws the pacman in specific direction
 * @param {*} startAngle start angle of the pacman
 * @param {*} endAngle end angle of the pacman
 * @param {*} eyeX x cordinate of the eye
 * @param {*} eyeY y cordinate of the eye
 */
function drawPacmanInDirection(startAngle,endAngle,eyeX,eyeY){
	// An arc with an opening at the right for the mouth
	ctx.beginPath();
	ctx.arc(pacX, pacY, pacRadius, (startAngle-angle) * Math.PI, (endAngle+angle) * Math.PI, false);

	// The mouth
	// A line from the end of the arc to the centre
	ctx.lineTo(pacX, pacY);

	// A line from the centre of the arc to the start
	ctx.closePath();

	// Fill the pacman shape with yellow
	ctx.fillStyle = "yellow";
	ctx.fill();

	// Draw the black outline (optional)
	ctx.stroke();

	// Draw the eye
	ctx.beginPath();
	ctx.arc(eyeX, eyeY, 3, 0, 2 * Math.PI, false);
	ctx.fillStyle = "rgb(0, 0, 0)";
	ctx.fill();
}

//set listeners on pacman movment keys
document.addEventListener('keydown', function (event) {
	if (event.key === keys["Up"])
		pacDirection = "up";

	if (event.key === keys["Down"]) 
		pacDirection = "down";

	if (event.key === keys["Left"]) 
		pacDirection = "left";

	if (event.key === keys["Right"])
		pacDirection = "right";

	if(event.key=="Escape"){
		if(document.getElementById("modalDiv").style.display!="none"){//if about window is currently displaying
			closeAbout();
		}
	}
});

/**
 * This function updates the location of the pacman
 */
function movePacman(){
	let didMove = false;
	switch (pacDirection){
		case "up":
			if (!(checkWall(pacX-pacRadius, pacY-pacSpeed-pacRadius) || checkWall(pacX+pacRadius, pacY-pacSpeed-pacRadius))){
				pacY -= pacSpeed;
				didMove = true;
			}
			break;
		case "down":
			if (!(checkWall(pacX-pacRadius, pacY+pacSpeed+pacRadius) || checkWall(pacX+pacRadius, pacY+pacSpeed+pacRadius))){
				pacY += pacSpeed;
				didMove = true;
			}
			break;
		case "left":
			if (!(checkWall(pacX-pacSpeed-pacRadius, pacY-pacRadius) || checkWall(pacX-pacSpeed-pacRadius, pacY+pacRadius))){
				pacX -= pacSpeed;
				didMove = true;
			}
			break;
		case "right":
			if (!(checkWall(pacX+pacSpeed+pacRadius, pacY-pacRadius) || checkWall(pacX+pacSpeed+pacRadius, pacY+pacRadius))){
				pacX += pacSpeed;
				didMove = true;
			}
			break;
	}
	if (didMove)
		touchCandy();
}

window.addEventListener("keydown", function(event){
	if (["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Enter"].indexOf(event.code)>-1){
		event.preventDefault();
	}
});

function checkWall(x, y){
	if (x >= 900 || x < 0)
		return true;
	if (y >= 450 || y < 0)
		return true;
	let i = Math.floor(x / 60);
	let j = Math.floor(y / 45);
	if (board[i][j] == 1)
		return true;
	return false;
}

/**
 * This function checks if pacman touches any candy
 * @returns 
 */
function touchCandy(){
	let i = Math.floor(pacX / sizeX);
	let j = Math.floor(pacY / sizeY);
	if (board[i][j] == 0 || board[i][j] == 1)//if pacman touch wall or free space without candy
		return;
	
	let thisRadiusCandys = radiusCandys[board[i][j]];
	if (pacmanContact(i*sizeX + sizeX/2 - thisRadiusCandys, j*sizeY + sizeY/2 - thisRadiusCandys, thisRadiusCandys*2, thisRadiusCandys*2)){//if pacman touch candy
		changeScore(board[i][j]);
		board[i][j] = 0;
		countCandy++;
		if(countCandy==ballsNumber)
			finishGame();
	}
}

function pacmanContact(x, y, width, heigh){
	// up - left
	if (pacX - pacRadius <= x && x <= pacX + pacRadius)
		if (pacY - pacRadius <= y && y <= pacY + pacRadius)
			return true;
	
	// up - right
	if (pacX - pacRadius <= x + width && x + width <= pacX + pacRadius)
		if (pacY - pacRadius <= y && y <= pacY + pacRadius)
			return true;
	
	// down - left
	if (pacX - pacRadius <= x && x <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh && y + heigh <= pacY + pacRadius)
			return true;
	
	// down - right
	if (pacX - pacRadius <= x + width && x + width <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh && y + heigh <= pacY + pacRadius)
			return true;
	
	// center - left
	if (pacX - pacRadius <= x && x <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh/2 && y + heigh/2 <= pacY + pacRadius)
			return true;
	
	// center - right
	if (pacX - pacRadius <= x + width && x + width <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh/2 && y + heigh/2 <= pacY + pacRadius)
			return true;
	
	// center - down
	if (pacX - pacRadius <= x + width/2 && x + width/2 <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh && y + heigh <= pacY + pacRadius)
			return true;
	
	// center - up
	if (pacX - pacRadius <= x + width/2 && x + width/2 <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh && y + heigh <= pacY + pacRadius)
			return true;
	
	// center
	if (pacX - pacRadius <= x + width/2 && x + width/2 <= pacX + pacRadius)
		if (pacY - pacRadius <= y + heigh/2 && y + heigh/2 <= pacY + pacRadius)
			return true;
		
	return false;
}

/**
 * This function inits the pacman position
 */
function initPacmanPosition(){
	//choose random empty point for pacman at start of game that not in the edges of the bord.
	let found = false;
	let i = -1;
	let j = -1;
	while (!found){
		i = Math.floor(Math.random() * board.length);
		j = Math.floor(Math.random() * board[0].length);
		//if generated indexes are not in corners and the cell is free
		if (board[i][j] != 1 && (i != 0 && j != 0) && (i != board.length-1 && j != 0) && (i != board.length-1 && j != board[0].length-1) && (i != 0 && j != board[0].length-1))
			found = true;
	}
	pacX = i * 60 + 30;
	pacY = j * 45 + 22;
}

/**
 * This function generates a position for medication or strwaberry to show
 * @param {*} what the object(medication or strwaberry)
 */
function initBonusPosition(what){
	//choose random empty point for the bonuses.
	let found = false;
	let i = -1;
	let j = -1;
	while (!found){
		i = Math.floor(Math.random() * board.length);
		j = Math.floor(Math.random() * board[0].length);
		if (board[i][j] != 1)
			found = true;
	}
	if (what == "medication"){
		medicationX = i * 60;
		medicationY = j * 45;
		bonusTime = bonusTimeTolive;
	}
	if (what == "strawberry"){
		strawberryX = i * 60;
		strawberryY = j * 45;
		bonusTime = bonusTimeTolive * 2;
	}
}

/**
 * This function draw the bonuses(medication or strwaberry)
 */
function drawBonuses(){
	if (bonusTime <= bonusTimeTolive){
		let img = new Image();
		img.src = "Img/drug.jpg";
		ctx.drawImage(img, medicationX, medicationY, 50, 40);
		
		if (pacmanContact(medicationX, medicationY, 50, 40)){//if pacman touched medication
			changeLives(1);
			initBonusPosition("strawberry");
			pacSpeed++;
		}
	}
	else{
		let img = new Image();
		img.src = "Img/strawberry.png";
		ctx.drawImage(img, strawberryX, strawberryY, 50, 40);
		
		if (pacmanContact(strawberryX, strawberryY, 50, 40)){
			initBonusPosition("medication");
			ghostSpeed = 1;
			slowMotionTime = 150;
		}
	}
	if (bonusTime <= 0){
		initBonusPosition("strawberry");
	}
	if (slowMotionTime > 0)
		slowMotionTime--;
	if (slowMotionTime == 0){
		slowMotionTime = -500;
		ghostSpeed = 1.5;
	}
	bonusTime--;
}

/**
 * This function initializes the positions of yhe ghosts at the start of the game
 */
function initGhostPositions(){
	let directions=createDirections();//get random directions
	for(let i=0;i<monstersNumber;i++){//set each monster in random corner
		switch (directions[i]) {
			case 1:
				ghostsPositions[i] = [0,0];//top left corner
				break;
			case 2:
				ghostsPositions[i] = [0,sizeY*(board[0].length-1)];//bottom left corener
				break;
			case 3:
				ghostsPositions[i] = [sizeX*(board.length-1),0];//top right corner
				break;
			case 4:
				ghostsPositions[i] = [(board.length-1)*sizeX,(board[0].length-1)*sizeY];//bottom right corner
				break;		
			default:
				break;
		}
	}
}


function initGhostCorners(){
	let directions=createDirections();
	for(let i=0;i<monstersNumber;i++){
		switch (directions[i]) {
			case 1:
				ghostTarget.push([0, 0]);
				ghostGoToCorner.push(false);
				break;
			case 2:
				ghostTarget.push([0,sizeY*(board[0].length-1)]);
				ghostGoToCorner.push(false);
				break;
			case 3:
				ghostTarget.push([sizeX*(board.length-1),0]);
				ghostGoToCorner.push(false);
				break;
			case 4:
				ghostTarget.push([(board.length-1)*sizeX,(board[0].length-1)*sizeY]);
				ghostGoToCorner.push(false);
				break;		
			default:
				break;
		}
	}
}

/**
 * This function sets the timer for game
 */
function setGameTimer(){
	setGameTimeLabel();
	$("#timeLabel").css("color","black");
	let timer=setInterval(function(){
		timeOfGame--;
		setGameTimeLabel();
		if(timeOfGame>0 && timeOfGame<10){
			$("#timeLabel").css("color","red");
		}
		if(timeOfGame==0){
			setGameTimeLabel();			
			finishGame();
		}
	},1000);
	gameIntervals.push(timer);
}

/**
 * This function updates the time label
 */
function setGameTimeLabel(){
	let minutes=0;
	let time=timeOfGame;
	while(time>=60){
		minutes++;
		time-=60;
	}
	if(time<10){
		$("#timeLabel").html("0"+minutes+":0"+time.toString());
	}
	else{
		$("#timeLabel").html("0"+minutes+":"+time.toString());
	}
	
}

/**
 * This function intializes ghost pictures array
 */
function initGhostsArr(){
	ghostsArr = [];
	switch (monstersNumber) {
		case 1:
			ghostsArr.push("Img/ghost1.png");
			break;
			case 2:
				ghostsArr.push("Img/ghost1.png");
				ghostsArr.push("Img/ghost2.png");
				break;
			case 3:
				ghostsArr.push("Img/ghost1.png");
				ghostsArr.push("Img/ghost2.png");
				ghostsArr.push("Img/ghost3.png");
				break;
			case 4:
				ghostsArr.push("Img/ghost1.png");
				ghostsArr.push("Img/ghost2.png");
				ghostsArr.push("Img/ghost3.png");
				ghostsArr.push("Img/ghost4.png");
				break;		
		default:
			break;

	}
}

function drawGhosts(){
	for(let i=0;i<ghostsArr.length;i++){
		let image=new Image();
		image.src=ghostsArr[i];
		ctx.drawImage(image, ghostsPositions[i][0], ghostsPositions[i][1], ghostWidth, ghostHeigh);
	}
}

function goToCorner(x){
	if (ghostGoToCorner[x]){
		for (let j=0; j<ghostsArr.length; j++){
			if (j != x){
				let dist = Math.pow(Math.pow(ghostsPositions[j][0] - ghostsPositions[x][0], 2) + Math.pow(ghostsPositions[j][1] - ghostsPositions[x][1], 2), 0.5);
				if (dist < 150){
					return;
				}
			}
		}
		ghostGoToCorner[x] = false;
		return;
	}
	for (let j=0; j<ghostsArr.length; j++){
		if (j != x && !ghostGoToCorner[j]){
			let dist = Math.pow(Math.pow(ghostsPositions[j][0] - ghostsPositions[x][0], 2) + Math.pow(ghostsPositions[j][1] - ghostsPositions[x][1], 2), 0.5);
			if (dist < 45){
				ghostGoToCorner[x] = true;
				return;
			}
		}
	}
}

function changeGhostsLocations(){
	for(let j=0;j<ghostsArr.length;j++){
		let ghostX=ghostsPositions[j][0];
		let ghostY=ghostsPositions[j][1];
		let availableDirectionsX = [];
		let availableDirectionsY = [];
		let newDist = 1;
		let minX = ghostX;
		let minY = ghostY;
		let bestDistanceX = 99999999999;
		let bestDistanceY = 99999999999;

		goToCorner(j)
		let demoPacX;
		let demoPacY;
		if (ghostGoToCorner[j]){
			demoPacX = ghostTarget[j][0];
			demoPacY = ghostTarget[j][1];
		}
		else{
			demoPacX = pacX - pacRadius;
			demoPacY = pacY - pacRadius;			
		}

		//check available directions.
		if (!(checkWall(ghostX, ghostY-ghostSpeed) || checkWall(ghostX+ghostWidth, ghostY-ghostSpeed)))
			availableDirectionsY.push("up");
		if (!(checkWall(ghostX, ghostY+ghostSpeed+ghostHeigh) || checkWall(ghostX+ghostWidth, ghostY+ghostSpeed+ghostHeigh)))
			availableDirectionsY.push("down");
		if (!(checkWall(ghostX-ghostSpeed, ghostY) || checkWall(ghostX-ghostSpeed, ghostY+ghostHeigh)))
			availableDirectionsX.push("left");
		if (!(checkWall(ghostX+ghostSpeed+ghostWidth, ghostY) || checkWall(ghostX+ghostSpeed+ghostWidth, ghostY+ghostHeigh)))
			availableDirectionsX.push("right");

		for(let i=0;i<availableDirectionsY.length;i++){
			switch (availableDirectionsY[i]){
				case "up":
					newDist = Math.abs(ghostY-ghostSpeed-demoPacY);
					if (newDist < bestDistanceY){
						minY = ghostY - ghostSpeed;
						bestDistanceY = newDist;
					}
					break;
				case "down":
					newDist = Math.abs(ghostY+ghostSpeed-demoPacY);
					if (newDist < bestDistanceY){
						minY = ghostY + ghostSpeed;
						bestDistanceY = newDist;
					}
					break;
				default:
					break;
			}
		}

		for(let i=0;i<availableDirectionsX.length;i++){
			switch (availableDirectionsX[i]){
				case "left":
					newDist = Math.abs(ghostX-ghostSpeed-demoPacX);
					if (newDist < bestDistanceX){
						minX = ghostX - ghostSpeed;
						bestDistanceX = newDist;
					}
					break;
				case "right":
					newDist = Math.abs(ghostX+ghostSpeed-demoPacX);
					if (newDist < bestDistanceX){
						minX = ghostX + ghostSpeed;
						bestDistanceX = newDist;
					}
					break;
				default:
					break;
			}
		}
		ghostsPositions[j] = [minX, minY];
		if (pacmanContact(minX, minY, ghostWidth, ghostHeigh)){
			changeScore(-10);
			let gameFinished=changeLives(-1);
			if(!gameFinished){
				initPacmanPosition();
			initGhostPositions();
			initGhostsArr();
			if (bonusTime > bonusTimeTolive)
				initBonusPosition("strawberry");
			else
				initBonusPosition("medication");
		}
			}
			
	}
}

function changeScore(s){
	// change the score of the game by s
	score += s;
	document.getElementById("scoreLabel").innerHTML = score;
}

function changeLives(num){
	lives += num;
	drawLives();
	if(lives==0){
		stopGamesIntervals();
		$("#stopGameButton").css("display","none");
		$("#resumeGameButton").css("display","none");
		$("#stopMusicButton").css("display","none");
		$("#resumeMusicButton").css("display","none");
		gameStopped=true;
		backgroundSong.currentTime=0;
		alert("Loser!");
		return true;
	}
	return false;
}

function drawLives(){
	$("#livesDiv").html("");
	for(let i=0;i<lives;i++){
		let img=new Image(20,30);
		img.src="Img/live.png";
		img.className="liveImage";
		document.getElementById("livesDiv").appendChild(img);
	}
}

/**
 * This function shows about screen
 */
function aboutScreen(){
	if(currentDisplayedDiv=="#gameAndSettingsDiv"){
		if(document.getElementById("gameDiv").style.display!="none"){//if game div is displayed, pause the game
			stopGamesIntervals();
			backgroundSong.pause();
		}
	}
	$("#modalDiv").css("display","block");
}

function closeAbout(){
	if(currentDisplayedDiv=="#gameAndSettingsDiv"){
		if(document.getElementById("gameDiv").style.display!="none" && !gameStopped){//if game div was displayed, resume the game
			setGameIntervals();
			if(!musicStopped){
				backgroundSong.play();
			}
		}
	}
	$("#modalDiv").css("display","none");
}

window.onclick=function(event){
	if(event.target==document.getElementById("modalDiv")){
		closeAbout();
	}
}

function stopGame(){
	stopGamesIntervals();
	gameStopped=true;
}

function resumeGame(){
	if(gameStopped){
		setGameIntervals();
		gameStopped=false;
		if(!musicStopped){// if user didn't stop the music before
			backgroundSong.play();
		}
	}
}

/**
 * This function change read only attribute of settings form(read only when in game mode and off when need to choose settings)
 * @param {} addReadOnly 
 */
function changeSettingsReadOnlyPrperty(addReadOnly){
	if(addReadOnly){
		let gameAndSettingsDiv=document.getElementById("gameAndSettingsDiv");
		gameAndSettingsDiv.style.removeProperty("justify-content");
		gameAndSettingsDiv.style.removeProperty("align-items");
	}
	else{
		$("#gameAndSettingsDiv").css("justify-content","center");
		$("#gameAndSettingsDiv").css("align-items","center");
	}
	document.getElementById("keyUp").disabled=addReadOnly;
	document.getElementById("keyDown").disabled=addReadOnly;
	document.getElementById("keyLeft").disabled=addReadOnly;
	document.getElementById("keyRight").disabled=addReadOnly;
	document.getElementById("fivePointsColorPicker").disabled=addReadOnly;
	document.getElementById("fifteenPointsColorPicker").disabled=addReadOnly;
	document.getElementById("twentyFivePointsColorPicker").disabled=addReadOnly;
	document.getElementById("gameTimeInput").readOnly=addReadOnly;
	document.getElementById("ballsSlider").disabled=addReadOnly;
	document.getElementById("monstersSlider").disabled=addReadOnly;
}

function pauseMusic(){
	backgroundSong.pause();
	musicStopped=true;
}

function resumeMusic(){
	backgroundSong.play();
	musicStopped=false;
}