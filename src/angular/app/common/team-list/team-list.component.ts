import {Component, OnInit, Input, SimpleChanges, OnChanges} from '@angular/core';
import {BaseComponent} from '../../common/base.component';
import {Router, ActivatedRoute} from '@angular/router';
import {GraphQLService} from '../../graphql.service';
import {Team} from '../../../graphql/schemas/Team';
import {ListComponent} from '../../common/list.component';

@Component({
    selector: 'team-list',
    templateUrl: 'team-list.component.html'
})
export class TeamListComponent extends BaseComponent {

    @Input() title: string;
    @Input() teams: Team[];
    @Input() leagueId: string;
    @Input() playerId: string;
    @Input() detailsPath: string[];

    constructor(route: ActivatedRoute, private router: Router, private service: GraphQLService) {
        super(route);
    }

    ngOnInit(): void {
        super.ngOnInit();

        if (this.teams == undefined) {
            this.loadTeams(this.leagueId);
        }
    }

    ngOnChanges(changes: SimpleChanges) {
        super.ngOnChanges(changes);

        let leagueIdChanges = changes['leagueId'];
        if (leagueIdChanges && leagueIdChanges.currentValue) {
            this.loadTeams(leagueIdChanges.currentValue)
        } else if (changes['teams']) {
            this.teams = changes['teams'].currentValue;
        }
    }

    onTeamClicked(team: Team) {
        this.service.team = team;
        this.router.navigate(['teams', team.name.toLowerCase()])
    }

    onDetailsClicked() {
        this.router.navigate(this.detailsPath);
    }

    private teamSorter(first: Team, second: Team): number {
        return second.name.localeCompare(first.name);
    }


    private loadTeams(leagueId: string) {
        this.service.post(this.getQuery(leagueId)).then((data: any) => {
            this.teams = data.teams.map(team => Team.fromJson(team)).sort(this.teamSorter.bind(this));
        })
    }

    private getQuery(leagueId: string): string {
        return `query{
                  teams{
                    id,
                    name, 
                    description,
                    players{
                      name
                    },
                    leagueTeams {
                        team {
                            name
                        },
                        league {
                            name
                        }
                    }
                  }
                }`
    }
}
