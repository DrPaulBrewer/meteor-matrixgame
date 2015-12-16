// Match object for gameFactory for use in check
// to see if all non-userId fields are present for starting game
gameFactorySpec = {
    visible: Boolean,
    timeBegins: Number,
    timeEnds: Number,
    rowMatrix: [[Number]],
    colMatrix: [[Number]],
    rownames: [Match.Any],
    colnames: [Match.Any],
    moves: [Match.Any],
    row: Match.Integer,
    col: Match.Integer,
    gameTemplate: String,
    cellTemplate: String
};

gameFileSpec = {
    rowMatrix: [[Number]],
    colMatrix: [[Number]],
    rownames: [Match.Any],
    colnames: [Match.Any],
    row: Match.Integer,
    col: Match.Integer,
    gameTemplate: String,
    cellTemplate: String
};

