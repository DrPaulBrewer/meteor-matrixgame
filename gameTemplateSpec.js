// Match object for gameFactory for use in check
// to see if all non-userId fields are present for starting game
gameFactorySpec = {visible: Boolean,
		    timeBegins: Number,
		    timeEnds: Number,
		    rowMatrix: [Match.Any],
		    colMatrix: [Match.Any],
		    rownames: [Match.Any],
		    colnames: [Match.Any],
		    moves: [Match.Any]
		   };

