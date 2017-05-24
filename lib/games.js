import { check } from 'meteor/check';

Games = new Mongo.Collection("games");

Meteor.methods({
	"games.play"()
	{
		var game = Games.findOne({status: "waiting"});

		if(game != undefined && game.player1 != this.userId && game.player2 == "")
		{
			Meteor.call("games.joinGame", game);
		}
		else if(game == undefined)
		{
			Meteor.call("games.newGame");
		}
	},
	"games.newGame"()
	{
		var game = Games.findOne({$or:[
			{player1: this.userId},
			{player2: this.userId}]
		});

		if(game == undefined)
		{
			Games.insert({
				player1: this.userId,
				player2: "",
				moves: [],
				status: "waiting",
				won: ""
			});
		}
	},
	"games.joinGame"(game)
	{
		if(game.player2 == "")
		{
			Games.update(
				{_id: game._id},
				{$set: {
					"player2": this.userId,
					"status": game.player1
					}
				}
			);			
		}
	},
	"games.makeMove"(position)
	{
		check(position, String);

		Meteor.call("games.validatePosition", position);

		var game = Games.findOne({$or:[
			{player1: this.userId},
			{player2: this.userId}]
		});

		if(game.status == this.userId)
		{
			Games.update(
				{status: this.userId},
				{
					$push: {
						moves: {playerID:this.userId, move: position}
					}
				}
			);

			if(Meteor.call("games.checkIfGameWasWon"))
			{
				Games.update(
					{status: this.userId},
					{
						$set: {
							"won": this.userId,
							"status": "end"
						}
					}
				);
			}
			else
			{
				var game = Games.findOne({status: this.userId});

				if(game.moves.length == 9)
				{
					Games.update(
						{status: this.userId},
						{
							$set: {
								"won": "tie",
								"status": "end"
							}
						}
					);
				}
				else
				{
					var nextPlayer = "";
					if(game.player1 == this.userId)
						nextPlayer = game.player2;
					else
						nextPlayer = game.player1;

					Games.update(
						{status: this.userId},
						{
							$set: {
								"status": nextPlayer
							}
						}
					);
				}
			}	
		}

	},
	"games.checkIfGameWasWon"()
	{
		var game = Games.findOne({$or:[
			{player1: this.userId},
			{player2: this.userId}]
		});

		var wins = [
		[00, 11, 22],
		[00, 01, 02],
		[10, 11, 12],
		[20, 21, 22],
		[00, 10, 20],
		[01, 11, 21],
		[02, 12, 22]
		];

		var winCounts = [0,0,0,0,0,0,0];

		for(var i = 0; i < game.moves.length; i++)
		{
			if(game.moves[i].playerID == this.userId)
			{
				var move = game.moves[i].move;

				for(var j = 0; j < wins.length; j++)
				{
					if(wins[j][0] == move || wins[j][1] == move || wins[j][2] == move)
					winCounts[j] ++;
				}
			}
		}

		for(var i = 0; i < winCounts.length; i++)
		{
			if(winCounts[i] == 3)
				return true;
		}

		return false;
	},
	"games.validatePosition"(position)
	{
		for(var x = 0; x < 3; x++)
		{
			for(var y = 0; y < 3; y++)
			{
				if(position == x + '' + y)
					return true;
			}
		}

		throw new Meteor.Error('invalid-position', "Selected position does not exist... please stop trying to hack the game!!");
	}
});