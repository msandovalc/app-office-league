import {Component, OnInit, Input, Output, OnChanges, SimpleChanges, SimpleChange, EventEmitter} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Player} from '../../../graphql/schemas/Player';
import {XPCONFIG} from '../../app.config';

@Component({
    selector: 'new-game-player',
    templateUrl: 'new-game-player.component.html',
    styleUrls: ['new-game-player.component.less']
})
export class NewGamePlayerComponent implements OnInit, OnChanges {

    @Input() player: Player;
    @Input() leagueId: string;
    @Output() playerSelected: EventEmitter<Player> = new EventEmitter<Player>();
    private modalOpen: boolean;
    playerSelectEnabled: boolean;
    private modalTitle: string = 'Select a player';

    constructor() {
    }

    ngOnInit(): void {

    }

    ngOnChanges(changes: SimpleChanges): void {
        console.log('NewGamePlayerComponent.ngOnChanges()', changes);
    }

    onClicked() {
        this.showModal();
        setTimeout(() => this.hideModal(), 30000);
    }

    onSelected(p: Player) {
        this.player = p;
        this.hideModal();
        this.playerSelected.emit(this.player);
    }

    public showModal(): void {
        this.modalOpen = true;
        this.playerSelectEnabled = true;
    }

    public hideModal(): void {
        this.playerSelectEnabled = false;
        this.modalOpen = false;
    }

    questionMarkImg(): string {
        return `${XPCONFIG.assetsUrl}/img/questionmark.svg`;
    }
}