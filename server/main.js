import { Meteor } from 'meteor/meteor';
import { UserStatus } from 'meteor/mizzao:user-status';
import { gameLogic } from '../lib/gameLogic.js';

Meteor.startup(() => {
	// Uncomment the next line to wipe database.
	// Games.remove({});
});

UserStatus.events.on("connectionLogout", function(fields)
{
	const game = Games.findOne(
	{$or:[
		{player1: fields.userId},
		{player2: fields.userId}]
	});

	if(game != undefined)
	{
		if(game.status !== "waiting" && game.status !== "end")
		{
			if(game.player1 === fields.userId)
			{
				gameLogic.setGameResult(game._id, game.player2);
			}
			else if(game.player2 === fields.userId)
			{
				gameLogic.setGameResult(game._id, game.player1);
			}
		}
		else
		{
			if(game.player1 === "" || game.player2 === "")
			{
				gameLogic.removeGame(game._id);
			}
			else
			{
				if(game.player1 === fields.userId)
					gameLogic.removePlayer(game._id, "player1");
				else if(game.player2 === fields.userId)
					gameLogic.removePlayer(game._id, "player2");
			}
		}	
	}
});

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