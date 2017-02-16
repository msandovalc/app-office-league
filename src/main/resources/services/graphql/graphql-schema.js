var graphQlLib = require('graphql');
var storeLib = require('office-league-store');

var identifiableType = graphQlLib.createInterfaceType({
    name: 'Identifiable',
    description: 'Contains a field ID with a unique value',
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        }
    }
});

var handednessEnumType = graphQlLib.createEnumType({
    name: 'Handedness',
    description: 'Enumeration of handedness',
    values: {
        right: 'right',
        left: 'left',
        ambidexterity: 'ambidexterity'
    }
});

var sideEnumType = graphQlLib.createEnumType({
    name: 'Side',
    description: 'Enumeration of sides',
    values: {
        blue: 'blue',
        red: 'red'
    }
});

var sportEnumType = graphQlLib.createEnumType({
    name: 'Sport',
    description: 'Enumeration of sports handled',
    values: {
        foos: 'foos'
    }
});

var playerType = graphQlLib.createObjectType({
    name: 'Player',
    description: 'Domain representation of a player. A player has a link to a user',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.name;
            }
        },
        nickname: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.nickname;
            }
        },
        nationality: {
            type: graphQlLib.GraphQLString, //TODO Change to enum
            data: function (env) {
                return env.source.nationality;
            }
        },
        handedness: {
            type: handednessEnumType,
            data: function (env) {
                return env.source.handedness;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.description;
            }
        },
        teams: {
            type: graphQlLib.list(graphQlLib.reference('Team')),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getTeamsByPlayerId(env.source._id, env.args.start, env.args.count).teams;
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(graphQlLib.reference('LeaguePlayer')),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByPlayerId(env.source._id, env.args.start, env.args.count).players;
            }
        }
    }
});

var teamType = graphQlLib.createObjectType({
    name: 'Team',
    description: 'Domain representation of a team. A team is composed of two player',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLString),
            data: function (env) {
                return env.source.name;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.nickname;
            }
        },
        players: {
            type: graphQlLib.list(playerType),
            data: function (env) {
                return toArray(env.source.playerIds).map(function (playerId) {
                    return storeLib.getPlayerById(playerId);
                });
            }
        },
        leagueTeams: {
            type: graphQlLib.list(graphQlLib.reference('LeagueTeam')),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByTeamId(env.source._id, env.args.start, env.args.count).teams;
            }
        }
    }
});

var gamePlayerType = graphQlLib.createObjectType({
    name: 'GamePlayer',
    description: 'Relation between a player and a game. ' +
                 'This relation means that a player is a part of a game. GamePlayer also contains statistics',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        score: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.score;
            }
        },
        side: {
            type: sideEnumType,
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.ratingDelta;
            }
        },
        player: {
            type: playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        }
    }
});

var gameTeamType = graphQlLib.createObjectType({
    name: 'GameTeam',
    description: 'Relation between a team and a game. ' +
                 'This relation means that a team is a part of a game. GameTeam also contains statistics',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        score: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.score;
            }
        },
        side: {
            type: sideEnumType,
            data: function (env) {
                return env.source.side;
            }
        },
        winner: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.winner;
            }
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.ratingDelta;
            }
        },
        team: {
            type: teamType,
            data: function (env) {
                return storeLib.getTeamById(env.source.teamId);
            }
        }
    }
});

var pointType = graphQlLib.createObjectType({
    name: 'Point',
    description: 'Domain representation of a goal/point.',
    fields: {
        time: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt),
            data: function (env) {
                return env.source.time;
            }
        },
        against: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean),
            data: function (env) {
                return env.source.against;
            }
        },
        player: {
            type: graphQlLib.nonNull(playerType),
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        }
    }
});

var commentType = graphQlLib.createObjectType({
    name: 'Comment',
    description: 'Domain representation of a user comment.',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        text: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.text;
            }
        },
        author: {
            type: playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.author);
            }
        },
        likes: {
            type: graphQlLib.list(playerType),
            data: function (env) {
                return toArray(env.source.likes).map(function (playerId) {
                    storeLib.getPlayerById(playerId)
                });
            }
        }
    }
});

var gameType = graphQlLib.createObjectType({
    name: 'Game',
    description: 'Domain representation of a game',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        time: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.time;
            }
        },
        finished: {
            type: graphQlLib.GraphQLBoolean,
            data: function (env) {
                return env.source.finished;
            }
        },
        points: {
            type: graphQlLib.list(pointType),
            data: function (env) {
                return toArray(env.source.points);
            }
        },
        comments: {
            type: graphQlLib.list(commentType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getCommentsByGameId(env.source._id, env.args.start, env.args.count).comments;
            }
        },
        gamePlayers: {
            type: graphQlLib.list(gamePlayerType),
            data: function (env) {
                return env.source.gamePlayers;
            }
        },
        gameTeams: {
            type: graphQlLib.list(gameTeamType),
            data: function (env) {
                return env.source.gameTeams;
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});

var leaguePlayerType = graphQlLib.createObjectType({
    name: 'LeaguePlayer',
    description: 'Relation between a player and a league. ' +
                 'This relation means that a player is a part of a league. LeaguePlayer also contains statistics',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        rating: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.rating;
            }
        },
        player: {
            type: playerType,
            data: function (env) {
                return storeLib.getPlayerById(env.source.playerId);
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});

var leagueTeamType = graphQlLib.createObjectType({
    name: 'LeagueTeam',
    description: 'Relation between a team and a league. ' +
                 'This relation means that a team is a part of a league. LeagueTeam also contains statistics',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        rating: {
            type: graphQlLib.GraphQLInt,
            data: function (env) {
                return env.source.rating;
            }
        },
        team: {
            type: teamType,
            data: function (env) {
                return storeLib.getTeamById(env.source.teamId);
            }
        },
        league: {
            type: graphQlLib.reference('League'),
            data: function (env) {
                return storeLib.getLeagueById(env.source.leagueId);
            }
        }
    }
});

var leagueType = graphQlLib.createObjectType({
    name: 'League',
    description: 'Domain representation of a league. A league contains games. Players can join 0..* leagues and indirectly their teams.',
    interfaces: [identifiableType],
    fields: {
        id: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID),
            data: function (env) {
                return env.source._id;
            }
        },
        name: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.name;
            }
        },
        sport: {
            type: sportEnumType,
            data: function (env) {
                return env.source.sport;
            }
        },
        description: {
            type: graphQlLib.GraphQLString,
            data: function (env) {
                return env.source.description;
            }
        },
        config: {
            type: graphQlLib.GraphQLString, //TODO Is it? Is there a unstructured type?
            data: function (env) {
                return JSON.stringify(env.source.config);
            }
        },
        leaguePlayers: {
            type: graphQlLib.list(leaguePlayerType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeaguePlayersByLeagueId(env.source._id, env.args.start, env.args.count).players;
            }
        },
        leagueTeams: {
            type: graphQlLib.list(leagueTeamType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getLeagueTeamsByLeagueId(env.source._id, env.args.start, env.args.count).teams;
            }
        },
        games: {
            type: graphQlLib.list(gameType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.getGamesByLeagueId(env.source._id, env.args.start, env.args.count).games;
            }
        }
    }
});

var rootQueryType = graphQlLib.createObjectType({
    name: 'RootQuery',
    fields: {
        player: {
            type: playerType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLID
            },
            data: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                if (id) {
                    return storeLib.getPlayerById(id);
                } else if (name) {
                    return storeLib.getPlayerByName(name);
                }
                return null;
            }
        },
        players: {
            type: graphQlLib.list(playerType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getPlayers(start, count).players;
            }
        },
        team: {
            type: teamType,
            args: {
                id: graphQlLib.GraphQLID,
                name: graphQlLib.GraphQLID
            },
            data: function (env) {
                var id = env.args.id;
                var name = env.args.name;
                if (id) {
                    return storeLib.getTeamById(id);
                } else if (name) {
                    return storeLib.getTeamByName(name);
                }
                return null;
            }
        },
        teams: {
            type: graphQlLib.list(teamType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getTeams(start, count).teams;
            }
        },
        games: {
            type: graphQlLib.list(gameType),
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var leagueId = env.args.leagueId;
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getGamesByLeagueId(leagueId, start, count).games;
            }
        },
        league: {
            type: leagueType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID)
            },
            data: function (env) {
                var id = env.args.id;
                return storeLib.getLeagueById(id);
            }
        },
        leagues: {
            type: graphQlLib.list(leagueType),
            args: {
                start: graphQlLib.GraphQLInt,
                count: graphQlLib.GraphQLInt
            },
            data: function (env) {
                var start = env.args.start;
                var count = env.args.count;
                return storeLib.getLeagues(start, count).leagues;
            }
        }
    }
});


var pointInputType = graphQlLib.createInputObjectType({
    name: 'PointCreation',
    description: 'Representation of a goal/point for game creation.',
    fields: {
        time: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLInt)
        },
        against: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLBoolean)
        },
        playerId: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        }
    }
});

var gamePlayerInputType = graphQlLib.createInputObjectType({
    name: 'GamePlayerCreation',
    fields: {
        side: {
            type: graphQlLib.nonNull(sideEnumType)
        },
        winner: {
            type: graphQlLib.GraphQLBoolean
        },
        score: {
            type: graphQlLib.GraphQLInt
        },
        scoreAgainst: {
            type: graphQlLib.GraphQLInt
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt
        },
        playerId: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        }
    }
});

var gameTeamInputType = graphQlLib.createInputObjectType({
    name: 'GameTeamCreation',
    fields: {
        side: {
            type: graphQlLib.nonNull(sideEnumType)
        },
        winner: {
            type: graphQlLib.GraphQLBoolean
        },
        score: {
            type: graphQlLib.GraphQLInt
        },
        scoreAgainst: {
            type: graphQlLib.GraphQLInt
        },
        ratingDelta: {
            type: graphQlLib.GraphQLInt
        },
        teamId: {
            type: graphQlLib.nonNull(graphQlLib.GraphQLID)
        }
    }
});

var rootMutationType = graphQlLib.createObjectType({
    name: 'RootMutation',
    fields: {
        createLeague: {
            type: leagueType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                sport: graphQlLib.nonNull(sportEnumType),
                description: graphQlLib.GraphQLString,
                config: graphQlLib.GraphQLString//TODO
            },
            data: function (env) {
                return storeLib.createLeague({
                    name: env.args.name,
                    sport: env.args.sport,
                    description: env.args.description,
                    config: env.args.config ? JSON.parse(env.args.config) : {} //TODO
                });
            }
        },
        createPlayer: {
            type: playerType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                nickname: graphQlLib.GraphQLString,
                nationality: graphQlLib.GraphQLString, //TODO
                handedness: handednessEnumType,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.createPlayer({
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description
                });
            }
        },
        updatePlayer: {
            type: playerType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID),
                name: graphQlLib.GraphQLString,
                nickname: graphQlLib.GraphQLString,
                nationality: graphQlLib.GraphQLString, //TODO
                handedness: handednessEnumType,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.updatePlayer({
                    playerId: env.args.id,
                    name: env.args.name,
                    nickname: env.args.nickname,
                    nationality: env.args.nationality,
                    handedness: env.args.handedness,
                    description: env.args.description
                });
            }
        },
        createTeam: {
            type: teamType,
            args: {
                name: graphQlLib.nonNull(graphQlLib.GraphQLString),
                description: graphQlLib.GraphQLString,
                playerIds: graphQlLib.nonNull(graphQlLib.list(graphQlLib.GraphQLID))
            },
            data: function (env) {
                return storeLib.createTeam({
                    name: env.args.name,
                    description: env.args.description,
                    playerIds: env.args.playerIds
                });
            }
        },
        updateTeam: {
            type: teamType,
            args: {
                id: graphQlLib.nonNull(graphQlLib.GraphQLID),
                name: graphQlLib.GraphQLString,
                description: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.updateTeam({
                    teamId: env.args.id,
                    name: env.args.name,
                    description: env.args.description
                });
            }
        },
        joinPlayerLeague: {
            type: leaguePlayerType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                rating: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.joinPlayerLeague(env.args.leagueId, env.args.playerId, env.args.rating);
            }
        },
        updatePlayerLeagueRating: {
            type: leaguePlayerType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                playerId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                ratingDelta: graphQlLib.nonNull(graphQlLib.GraphQLInt)
            },
            data: function (env) {
                return storeLib.updatePlayerLeagueRating(env.args.leagueId, env.args.playerId, env.args.ratingDelta);
            }
        },
        joinTeamLeague: {
            type: leagueTeamType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                teamId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                rating: graphQlLib.GraphQLInt
            },
            data: function (env) {
                return storeLib.joinTeamLeague(env.args.leagueId, env.args.teamId, env.args.rating);
            }
        },
        updateTeamLeagueRating: {
            type: leagueTeamType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                teamId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                ratingDelta: graphQlLib.nonNull(graphQlLib.GraphQLInt)
            },
            data: function (env) {
                return storeLib.updateTeamLeagueRating(env.args.leagueId, env.args.teamId, env.args.ratingDelta);
            }
        },
        createGame: {
            type: gameType,
            args: {
                leagueId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                time: graphQlLib.nonNull(graphQlLib.GraphQLString),
                finished: graphQlLib.GraphQLID,
                points: graphQlLib.list(pointInputType),
                gamePlayers: graphQlLib.nonNull(graphQlLib.list(gamePlayerInputType)),
                gameTeams: graphQlLib.nonNull(graphQlLib.list(gameTeamInputType))
            },
            data: function (env) {
                return storeLib.createGame({
                    leagueId: env.args.leagueId,
                    time: env.args.time,
                    points: env.args.points,
                    gamePlayers: env.args.gamePlayers,
                    gameTeams: env.args.gameTeams
                });
            }
        },
        createComment: {
            type: commentType,
            args: {
                gameId: graphQlLib.nonNull(graphQlLib.GraphQLID),
                author: graphQlLib.nonNull(graphQlLib.GraphQLID),
                text: graphQlLib.GraphQLString
            },
            data: function (env) {
                return storeLib.createComment({
                    gameId: env.args.gameId,
                    author: env.args.author,
                    text: env.args.text
                });
            }
        }
    }
});

exports.schema = graphQlLib.createSchema({
    query: rootQueryType,
    mutation: rootMutationType
});

function toArray(object) {
    if (!object) {
        return [];
    }
    if (object.constructor === Array) {
        return object;
    }
    return [object];
}
