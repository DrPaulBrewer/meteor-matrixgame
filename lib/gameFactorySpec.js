// Match object for gameFactory for use in check
// to see if all non-userId fields are present for starting game
gameFactorySpec = {
    visible: Boolean,
    timeBegins: Match.Integer,
    timeEnds: Match.Integer,
    rowMatrix: [[Number]],
    colMatrix: [[Number]],
    rownames: [Match.Any],
    colnames: [Match.Any],
    moves: [Match.Any],
    row: Match.Integer,
    col: Match.Integer
};

gameFileSpec = {
    rowMatrix: [[Number]],
    colMatrix: [[Number]],
    rownames: [Match.Any],
    colnames: [Match.Any],
    row: Match.Integer,
    col: Match.Integer
};

