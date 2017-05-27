import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';
import { gameLogic } from './gameLogic.js';

Games = new Mongo.Collection("games");

Meteor.methods({
	"games.play"()
	{
		const game = Games.findOne({status: "waiting"});

		if(game !== undefined && game.player1 !== this.userId && game.player2 === "")
		{
			gameLogic.joinGame(game);
		}
		else if(game === undefined)
		{
			gameLogic.newGame();
		}
	},
	"games.makeMove"(position)
	{
		check(position, String);

		gameLogic.validatePosition(position);

		let game = Games.findOne({status: this.userId});

		if(game !== undefined)
		{
			gameLogic.addNewMove(position);

			if(gameLogic.checkIfGameWasWon())
			{
				gameLogic.setGameResult(game._id, this.userId);
			}
			else
			{
				if(game.moves.length === 8)
				{
					gameLogic.setGameResult(game._id, "tie");
				}
				else
				{
					gameLogic.updateTurn(game);
				}
			}
		}
	}
});