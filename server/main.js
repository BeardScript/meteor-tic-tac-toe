import { Meteor } from 'meteor/meteor';

Meteor.startup(() => {
	// Uncomment the next line to wipe database.
	// Games.remove({});
});

UserStatus.events.on("connectionLogout", function(fields)
{
	var game = Games.findOne(
	{$or:[
		{player1: fields.userId},
		{player2: fields.userId}]
	});

	if(game != undefined)
	{
		if(game.status != "waiting" && game.status != "end")
		{
			if(game.player1 == fields.userId)
			{
				SetWinner(game._id, game.player2);
			}
			else if(game.player2 == fields.userId)
			{
				SetWinner(game._id, game.player1);
			}
		}
		else
		{
			if(game.player1 == "" || game.player2 == "")
			{
				Games.remove(
					{$and:[
					{$or:[
						{player1: fields.userId},
						{player2: fields.userId}]
					},
					{$or:[
						{status: "waiting"},
						{status: "end"}]
					}
				]});
			}
			else
			{
				if(game.player1 == fields.userId)
					Games.update({player1: fields.userId}, {$set:{player1: ""}});
				else if(game.player2 == fields.userId)
					Games.update({player2: fields.userId}, {$set:{player2: ""}});
			}
		}	
	}
});

function SetWinner(gameID, player)
{
	Games.update(
	{_id: gameID},
		{$set:{
			"won": player,
			"status": "end"
			}
		}
	);
}

Meteor.publish('Games', function gamesPublication()
{
	return Games.find({status: "waiting"}, {
		fields:{
			"status": 1,
			"player1": 1,
			"player2": 1
		}
	});
});

Meteor.publish('MyGame', function myGamePublication()
{
	return Games.find({$or:[
			{player1: this.userId},
			{player2: this.userId}]
		});
});