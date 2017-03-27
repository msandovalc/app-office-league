import {Component, OnInit, ViewChildren, QueryList} from '@angular/core';
import {GraphQLService} from '../../services/graphql.service';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';
import {League} from '../../../graphql/schemas/League';
import {GameParameters} from '../GameParameters';
import {GamePlayComponent} from '../game-play/game-play.component';
import {PageTitleService} from '../../services/page-title.service';
import {NewGamePlayerComponent} from '../new-game-player/new-game-player.component';

@Component({
    selector: 'new-game',
    templateUrl: 'new-game.component.html',
    styleUrls: ['new-game.component.less']
})
export class NewGameComponent implements OnInit {

    leagueId: string;

    bluePlayer1: Player;
    bluePlayer2: Player;
    redPlayer1: Player;
    redPlayer2: Player;
    possiblePlayerIds: string[] = [];

    @ViewChildren(NewGamePlayerComponent)
    playerCmps: QueryList<NewGamePlayerComponent>;

    league: League;
    title: string;
    playerSelectionReady: boolean;
    shuffleDisabled: boolean;

    constructor(private graphQLService: GraphQLService, private route: ActivatedRoute,
                private pageTitleService: PageTitleService, private router: Router) {
    }

    ngOnInit(): void {
        this.leagueId = this.route.snapshot.params['leagueId'];

        if (!this.leagueId) {
            return;
        }

        let playerId = XPCONFIG.user && XPCONFIG.user.playerId;
        if (playerId) {
            this.graphQLService.post(NewGameComponent.getPlayerLeagueQuery, {playerId: playerId, leagueId: this.leagueId}).then(data => {
                this.bluePlayer1 = Player.fromJson(data.player);
                this.league = League.fromJson(data.league);
                this.title = this.league.name;

                this.pageTitleService.setTitle(this.league.name);

                this.updatePlayerSelectionState();
            });
        }
    }

    onPlayClicked() {
        let gameParams: GameParameters = {
            bluePlayer1: this.bluePlayer1 && this.bluePlayer1.id,
            bluePlayer2: this.bluePlayer2 && this.bluePlayer2.id,
            redPlayer1: this.redPlayer1 && this.redPlayer1.id,
            redPlayer2: this.redPlayer2 && this.redPlayer2.id
        };

        this.createGame().then((gameId) => {
            console.log('Initial game created: ' + gameId);
            gameParams.gameId = gameId;
            this.router.navigate(['games', this.leagueId, 'game-play'], {queryParams: gameParams});
        }).catch((ex) => {
            console.log('Could not create game');
            this.router.navigate(['games', this.leagueId, 'game-play'], {queryParams: gameParams});
        });
    }

    private shuffleActions: {from: NewGamePlayerComponent, to: NewGamePlayerComponent, player: Player, side: string}[];

    onShuffleClicked() {
        this.shuffleDisabled = true;
        let playerCmps: NewGamePlayerComponent[] = this.playerCmps.toArray();
        let cmpTo;

        this.shuffleActions = [];
        // first calculate positions without updating them to not interfere the calculations
        this.playerCmps.forEach((cmpFrom, i) => {
            cmpTo = this.randomPlayerCmp(playerCmps);
            if (cmpTo != cmpFrom) {
                this.shuffleActions[i] = {
                    from: cmpFrom,
                    to: cmpTo,
                    player: cmpFrom.player,
                    side: cmpTo.sideClass
                };
            }
        });
        // then apply calculated positions
        this.playerCmps.forEach((cmp, i) => {
            // there may be players that were not moved
            let action = this.shuffleActions[i];
            if (action) {
                cmp.setPosition(action.to.getPosition());
                cmp.sideClass = action.side;
            }
        });
        this.updatePlayerSelectionState();
    }

    private randomPlayerCmp(playerCmps: NewGamePlayerComponent[]): NewGamePlayerComponent {
        return playerCmps.splice(Math.floor(Math.random() * playerCmps.length), 1)[0];
    }

    onPlayerSelected(position: 'blue1' | 'blue2' | 'red1' | 'red2', p: Player) {
        if (p) {
            switch (position) {
            case 'blue1':
                this.bluePlayer1 = p;
                break;
            case 'blue2':
                this.bluePlayer2 = p;
                break;
            case 'red1':
                this.redPlayer1 = p;
                break;
            case 'red2':
                this.redPlayer2 = p;
                break;
            }
            this.updatePlayerSelectionState();
        }
    }

    onPlayerAnimationFinished(fromCmp: NewGamePlayerComponent) {
        let playerCmps: NewGamePlayerComponent[] = this.playerCmps.toArray();

        let i = playerCmps.indexOf(fromCmp),
            action = this.shuffleActions[i];

        if (action) {
            let toCmp = action.to;
            toCmp.setPlayer(action.player);
            toCmp.sideClass = action.side;
            fromCmp.resetPosition(false);

            this.shuffleActions = this.shuffleActions.filter(act => act !== action);

            if (this.shuffleActions.length == 0) {
                this.shuffleDisabled = false;
            }
        }
    }

    private createGame(): Promise<string> {
        let players = [this.bluePlayer1, this.redPlayer1, this.bluePlayer2, this.redPlayer2].filter((p) => !!p).map((p) => {
            return {"playerId": p.id, "side": ( p === this.bluePlayer1 || p === this.bluePlayer2 ? 'blue' : 'red')};
        });
        let createGameParams = {
            points: [],
            players: players,
            leagueId: this.leagueId
        };
        createGameParams['leagueId'] = this.league.id;
        return this.graphQLService.post(GamePlayComponent.createGameMutation, createGameParams).then(
            data => {
                console.log('Game created', data);
                return data.createGame.id;
            });
    }

    private updatePlayerSelectionState() {
        let singlesGameReady = !!(this.bluePlayer1 && this.redPlayer1 && !this.bluePlayer2 && !this.redPlayer2);
        let doublesGameReady = !!(this.bluePlayer1 && this.redPlayer1 && this.bluePlayer2 && this.redPlayer2);
        this.playerSelectionReady = singlesGameReady || doublesGameReady;

        let possiblePlayerIds = [];
        let alreadyAssignePlayerIds = [this.bluePlayer1, this.bluePlayer2, this.redPlayer1, this.redPlayer2].filter((p) => !!p).map(
            (player) => player.id);
        this.league.leaguePlayers.forEach((leaguePlayer) => {
            if (alreadyAssignePlayerIds.indexOf(leaguePlayer.player.id) == -1) {
                possiblePlayerIds.push(leaguePlayer.player.id);
            }
        });
        this.possiblePlayerIds = possiblePlayerIds;
    }

    private static readonly getPlayerLeagueQuery = `query ($playerId: ID!, $leagueId: ID!) {
        player(id: $playerId) {
            id
            name
            imageUrl
            nickname
            nationality
            handedness
            description
        }
        
        league(id: $leagueId) {
            id
            name
            imageUrl
            description
            leaguePlayers(first:-1) {
                player {
                    id
                    imageUrl
                }
            }
        }
    }`;

}
