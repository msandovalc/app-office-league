import {Component, Input, SimpleChanges} from '@angular/core';
import {GraphQLService} from '../../graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {League} from '../../../graphql/schemas/League';
import {BaseComponent} from '../../common/base.component';
import {Player} from '../../../graphql/schemas/Player';
import {Team} from '../../../graphql/schemas/Team';

@Component({
    selector: 'league-profile',
    templateUrl: 'league-profile.component.html'
})
export class LeagueProfileComponent extends BaseComponent {

    private static readonly getLeagueQuery = `query ($name: String, $count:Int, $sort: String) {
        league(name: $name) {
            id
            name
            description
            leaguePlayers(count:$count, sort:$sort) {
                ranking
                player {
                    name
                }
                league {
                    name
                }
            }
            leagueTeams(count:$count, sort:$sort) {
                ranking
                team {
                    name
                    players {
                        name
                    }
                }
                league {
                    name
                }
            }
            games{
                id
                time
                finished
                points {
                    player {
                        name
                    }
                    time
                    against
                }
                comments {
                    author {
                        name
                    }
                    text
                }
                gamePlayers {
                    score
                    winner
                    side
                    ratingDelta
                    player {
                        name
                    }
                }
                gameTeams {
                    score
                    winner
                    side
                }
                league {
                    name
                }
            }
        }
    }`;

    @Input() league: League;
    leagueTeams: Team[];
    playerInLeague: boolean;

    constructor(route: ActivatedRoute, private graphQLService: GraphQLService, private router: Router) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        let name = this.route.snapshot.params['name'];

        if (!this.league && name) {
            this.graphQLService.post(LeagueProfileComponent.getLeagueQuery, {name: name, count:3, sort:'rating DESC, name ASC'}).then(data => {
                this.league = League.fromJson(data.league);
                this.playerInLeague = true; //TODO XPCONFIG.user.playerId
                this.calcStats(this.league);
            });
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueChange = changes['league'];
        if (leagueChange && leagueChange.currentValue) {
            this.calcStats(leagueChange.currentValue);
        }
    }

    onPlayClicked() {
        this.router.navigate(['games', this.league.id, 'new-game']);
    }

    private calcStats(league: League) { //TODO Remove
        this.leagueTeams = league.leagueTeams.map(lt => lt.team);
    }
}
