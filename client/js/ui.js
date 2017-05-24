Session.set("inGame", false);

Template.ui.onCreated(function()
{
	Meteor.subscribe('Games');
});

Template.ui.events({
	"click #play-btn": function()
	{
		Session.set("inGame", true);
		Meteor.subscribe('MyGame');
		Meteor.call("games.play");
	}
});

Template.ui.helpers({
	inGame: function()
	{
		return Session.get("inGame");
	},
	status: function()
	{
		var myGame = Games.findOne({$or:[{player1: Meteor.userId()},{player2: Meteor.userId()}]});
		
		if(myGame.status == "waiting")
			return "Looking for an opponent...";
		else if(myGame.status == Meteor.userId())
			return "Your turn";
		else if(myGame.status != Meteor.userId() && myGame.status != "end")
			return "opponent's turn";
		else if(myGame.won == Meteor.userId())
			return "You won!";
		else if(myGame.status == "end" && myGame.won != Meteor.userId() && myGame.won != "tie")
			return "You lost!";
		else if(myGame.won == "tie")
			return "It's a tie";
		else
			return "";
	}
});