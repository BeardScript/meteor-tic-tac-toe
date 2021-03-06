import { Meteor } from 'meteor/meteor';
import { Template } from 'meteor/templating'
import { Session } from 'meteor/session'

Template.board.events({
	"click .selectableField": function(event)
	{
		event.preventDefault();
		Meteor.call("games.makeMove", event.target.id);
	}
});

Template.board.helpers({
	sideLength:function()
	{
		let side = new Array(3);
		side.fill(0);

		return side;
	},
	isMarked:function(x, y)
	{
		if(Session.get("inGame"))
		{
			let myGame = Games.findOne();

			if(myGame !== undefined && myGame.status !== "waiting")
			{
				for(let i = 0; i < myGame.moves.length; i++)
				{
					if(myGame.moves[i].move === x + '' + y)
					{
						if(myGame.moves[i].playerID === Meteor.userId())
							return "<p class='mark'>X</p>";
						else
							return "<p class='mark'>O</p>";
					}
				}
				if(myGame.status === Meteor.userId())
					return "<div class='selectableField' id='"+x+y+"'></div>";
			}
		}

	}
});