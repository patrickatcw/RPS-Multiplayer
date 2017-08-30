var playerOne = null;
var playerTwo = null;


var playerOneName = "";
var playerTwoName = "";

var yourPlayerName = "";


var playerOneChoice = "";
var playerTwoChoice = "";


var turn = 1;


var config = {
      apiKey: "AIzaSyDd-Ir9SO1u-r7_iQZqlBhUtRTnUC9jRMo",
    authDomain: "first-project-e90bb.firebaseapp.com",
    databaseURL: "https://first-project-e90bb.firebaseio.com",
    projectId: "first-project-e90bb",
    storageBucket: "first-project-e90bb.appspot.com",
    messagingSenderId: "626451827587"
    };

    firebase.initializeApp(config);
    
    var database = firebase.database();



database.ref("/players/").on("value", function(snapshot) {

	if (snapshot.child("playerOne").exists()) {
		console.log("PlayerOne alive");

	
		playerOne = snapshot.val().playerOne;
		playerOneName = playerOne.Name;

		$("#playerOneName").text(playerOneName);
		$("#playerOneStats").html("Win: " + playerOne.win + ", Loss: " + playerOne.loss + ", Tie: " + playerOne.tie);
	} else {
		console.log("PlayerOne does NOT exist");

		playerOne = null;
		playerOneName = "";

		
		$("#playerOneName").text("Waiting for Player One...");
		$("#playerPanelOne").removeClass("playerPanelTurn");
		$("#playerPanelTwo").removeClass("playerPanelTurn");
		database.ref("/outcome/").remove();
		$("#roundOutcome").html("Rock-Paper-Scissors");
		$("#waitingNotice").html("");
		$("#playerOneStats").html("Win: 0, Loss: 0, Tie: 0");
	}


	if (snapshot.child("playerTwo").exists()) {
		console.log("Player Two is alive!!");			//repeats in consule log because tied to a function of existing

	
		playerTwo = snapshot.val().playerTwo;
		playerTwoName = playerTwo.Name;

		$("#playerTwoName").text(playerTwoName);
		$("#playerTwoStats").html("Win: " + playerTwo.win + ", Loss: " + playerTwo.loss + ", Tie: " + playerTwo.tie);
	} else {
		console.log("Player Two no exist");    

		playerTwo = null;
		playerTwoName = "";

	
		$("#playerTwoName").text("Waiting for Player Two...");
		$("#playerPanelOne").removeClass("playerPanelTurn");
		$("#playerPanelTwo").removeClass("playerPanelTurn");
		database.ref("/outcome/").remove();
		$("#roundOutcome").html("Rock-Paper-Scissors");
		$("#waitingNotice").html("");
		$("#playerTwoStats").html("Win: 0, Loss: 0, Tie: 0");
	}


	if (playerOne && playerTwo) {
	
		$("#playerPanelOne").addClass("playerPanelTurn");

		$("#waitingNotice").html("Waiting on " + playerOneName + " to choose...");
	}

	
	if (!playerOne && !playerTwo) {
		database.ref("/chat/").remove();
		database.ref("/turn/").remove();
		database.ref("/outcome/").remove();

		$("#chatDisplay").empty();
		$("#playerPanelOne").removeClass("playerPanelTurn");
		$("#playerPanelTwo").removeClass("playerPanelTurn");
		$("#roundOutcome").html("Rock-Paper-Scissors");
		$("#waitingNotice").html("");
	}
});


database.ref("/players/").on("child_removed", function(snapshot) {				//Viewer
	var msg = snapshot.val().name + " has disconnected!";

	
	var chatKey = database.ref().child("/chat/").set().key;			//push or set????

	
	database.ref("/chat/" + chatKey).set(msg);     //.set is saving chat message
});


database.ref("/chat/").on("child_added", function(snapshot) {   //viewer for new chats
	var chatMsg = snapshot.val();
	var chatEntry = $("<div>").html(chatMsg);



	$("#chatDisplay").append(chatEntry);
	$("#chatDisplay").scrollTop($("#chatDisplay")[0].scrollHeight);
});


database.ref("/turn/").on("value", function(snapshot) {        //snapshot as viewer
	
	if (snapshot.val() === 1) {
		console.log("Player one turn??");				//playerone turn to choose??
		turn = 1;

		
		if (playerOne && playerTwo) {
			$("#playerPanelOne").addClass("playerPanelTurn");
			$("#playerPanelTwo").removeClass("playerPanelTurn");
			$("#waitingNotice").html("Waiting on " + playerOneName + " to choose...");     //both in???
		}
	} else if (snapshot.val() === 2) {
		console.log("PlayerTwo turn to choose");			//Check to see if playertwo can choose
		turn = 2;

		
		if (playerOne && playerTwo) {
			
			$("#playerPanelOne").removeClass("playerPanelTurn");
			$("#playerPanelTwo").addClass("playerPanelTurn");
			$("#waitingNotice").html("Waiting on " + playerTwoName + " to choose..."); 
			console.log ("in??");  //only happens when both players in, but not appearing in console log, what up???? yes does appear
		}
	}
});


database.ref("/outcome/").on("value", function(snapshot) {      //viewer for results
	$("#roundOutcome").html(snapshot.val());
});


$("#add-name").on("click", function(event) {				//Onclick button function for submit
	event.preventDefault();
		console.log ("button works");				//my simple note to consollog for submit button

	
	if ( ($("#name-input").val().trim() !== "") && !(playerOne && playerTwo) ) {
		
		if (playerOne === null) {
			console.log("+ Player One");    //checking to see if playerOne is added

			yourPlayerName = $("#name-input").val().trim();
			playerOne = {
				name: yourPlayerName,
				win: 0,
				loss: 0,
				tie: 0,
				choice: ""
			};

			
			database.ref().child("/players/playerOne").push(playerOne);  


			
			database.ref().child("/turn").set(1);

			
			database.ref("/players/playerOne").onDisconnect().remove();			//same as playerTwo Leaves
		} else if( (playerOne !== null) && (playerTwo === null) ) {
			
			console.log("Check Player Two entered game");			//playertwo in game??

			yourPlayerName = $("#name-input").val().trim();
			playerTwo = {
				name: yourPlayerName,
				win: 0,
				loss: 0,
				tie: 0,
				choice: ""
			};

			
			database.ref().child("/players/playerTwo").push(playerTwo);

		
			database.ref("/players/playerTwo").onDisconnect().remove();				//player leaves, removed
		}

		
		var msg = yourPlayerName + " has joined!";				//message for either player joined
		console.log("player joined");

		
		var chatKey = database.ref().child("/chat/").push().key;

		
		database.ref("/chat/" + chatKey).set(msg);

		
		$("#name-input").val("");				//reset to the value of empty
	}
});


$("#chat-send").on("click", function(event) {
	event.preventDefault();

	
	if ( (yourPlayerName !== "") && ($("#chat-input").val().trim() !== "") ) {			//not equal to empty
		
		var msg = yourPlayerName + ": " + $("#chat-input").val().trim();
		$("#chat-input").val("");

		
		var chatKey = database.ref().child("/chat/").set().key;     //consol log error for line 238  

		
		database.ref("/chat/" + chatKey).set(msg);			//.set may save message entry??? did not try .push here
	}
});


$("#playerPanelOne").on("click", ".panelOption", function(event) {
	event.preventDefault();

	
	if (playerOne && playerTwo && (yourPlayerName === playerOne.name) && (turn === 1) ) {
		
		var choice = $(this).text().trim();

		
		playerOneChoice = choice;
		database.ref().child("/players/playerOne/choice").set(choice);

		
		turn = 2;									//Playertwo turn to choose
		database.ref().child("/turn").set(2);
	}
});


$("#playerPanelTwo").on("click", ".panelOption", function(event) {
	event.preventDefault();

	
	if (playerOne && playerTwo && (yourPlayerName === playerTwo.name) && (turn === 2) ) {
		
		var choice = $(this).text().trim();

		
		playerTwoChoice = choice;
		database.ref().child("/players/playerTwo/choice").set(choice);

		
		rpsCompare();
	}
});


		function rpsCompare() {
			if (playerOne.choice === "Rock") {
			if (playerTwo.choice === "Rock") {
			
			console.log("tie");   //both chose same

						database.ref().child("/outcome/").set("Tie game!");
						database.ref().child("/players/playerOne/tie").set(playerOne.tie + 1);
						database.ref().child("/players/playerTwo/tie").set(playerTwo.tie + 1);
		} else if (playerTwo.choice === "Paper") {
			// Player2 wins
			console.log("paper +");

						database.ref().child("/outcome/").set("Paper wins!");
						database.ref().child("/players/playerOne/loss").set(playerOne.loss + 1);
						database.ref().child("/players/playerTwo/win").set(playerTwo.win + 1);
		} else { 
			
			console.log("rock +");			//player two -

						database.ref().child("/outcome/").set("Rock wins!");
						database.ref().child("/players/playerOne/win").set(playerOne.win + 1);
						database.ref().child("/players/playerTwo/loss").set(playerTwo.loss + 1);
		}

	} else if (playerOne.choice === "Paper") {
		if (playerTwo.choice === "Rock") {
			
			console.log("paper +");				//playerone and paper +

						database.ref().child("/outcome/").set("Paper wins!");
						database.ref().child("/players/playerOne/win").set(playerOne.win + 1);
						database.ref().child("/players/playerTwo/loss").set(playerTwo.loss + 1);
		} else if (playerTwo.choice === "Paper") {
			
			console.log("tie");				//both chose same

						database.ref().child("/outcome/").set("Tie game!");
						database.ref().child("/players/playerOne/tie").set(playerOne.tie + 1);
						database.ref().child("/players/playerTwo/tie").set(playerTwo.tie + 1);
		} else { 
			console.log("scissors +");    //check sciz win

					database.ref().child("/outcome/").set("Scissors win!");
					database.ref().child("/players/playerOne/loss").set(playerOne.loss + 1);
					database.ref().child("/players/playerTwo/win").set(playerTwo.win + 1);
		}

				} else if (playerOne.choice === "Scissors") {
					if (playerTwo.choice === "Rock") {
			
			console.log("rock +");				//rock win

					database.ref().child("/outcome/").set("Rock wins!");
					database.ref().child("/players/playerOne/loss").set(playerOne.loss + 1);
					database.ref().child("/players/playerTwo/win").set(playerTwo.win + 1);
				} else if (playerTwo.choice === "Paper") {
			
			console.log("scissors +");			//sciz win

					database.ref().child("/outcome/").set("Scissors win!");
					database.ref().child("/players/playerOne/win").set(playerOne.win + 1);
					database.ref().child("/players/playerTwo/loss").set(playerTwo.loss + 1);
					} else {
			
			console.log("tie");				//both chose same

					database.ref().child("/outcome/").set("Tie game!");
					database.ref().child("/players/playerOne/tie").set(playerOne.tie + 1);
					database.ref().child("/players/playerTwo/tie").set(playerTwo.tie + 1);
		}

	}

	
	turn = 1;
	database.ref().child("/turn").set(1);    //player one turn
}