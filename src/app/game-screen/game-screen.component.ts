import {combineLatest, Observable, pipe} from 'rxjs';
import {mergeMap, map, first, tap, delay} from 'rxjs/operators';
import {Component, OnInit, ViewChild} from "@angular/core";
import {Router} from "@angular/router";
import * as firebase from 'firebase/app';
import {AngularFireDatabase} from "@angular/fire/database";
import {AngularFireAuth} from "@angular/fire/auth";
import {User} from "../shared/data/user";

@Component({
    selector: 'app-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css']
})
export class GameScreenComponent implements OnInit {

    public isHost: Observable<boolean>;
    public userName: Observable<string>;
    public isCollapsed: boolean = true;
    public isInitialized: boolean = false;
    public audioPlaying: boolean = false;

    @ViewChild('audioPlayer', { static: false })
    public audioPlayer;

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth, private router: Router) {}

    ngOnInit(): void {
        let uid = this.auth.authState.pipe(map(state => state.uid));
        let hosts = this.db.object<boolean>('/hosts').valueChanges();

        this.isHost = combineLatest([uid, hosts], (uid, hosts) => {
            return hosts[uid] === true;
        });

        this.userName = this.auth.authState.pipe(
            map(state => state.uid),
            mergeMap(uid => this.db.object<User>(`/users/${uid}`).valueChanges()),
            map(user => user.name)
        );

        let initializationSub = combineLatest([this.isHost, this.userName]).pipe(
            first(),
        ).subscribe(arr => {
            this.isInitialized = true;
            initializationSub.unsubscribe();
        });

        this.auth.authState.subscribe(state => {
            this.db.object(`/users/${state.uid}`).update({name: state.displayName});

            if (this.router.url !== '/game/scoreboard') {
                this.db.object(`/hosts`).valueChanges().subscribe(hosts => {
                    if (hosts[`${state.uid}`] === true) {
                        this.router.navigate(['/game/host']);
                    }
                    else {
                        this.router.navigate(['/game/player']);
                    }
                });
            }
        });
    }

    toggleAudio(): void {
        if (this.audioPlaying) {
            this.audioPlayer.nativeElement.pause();
        }
        else {
            this.audioPlayer.nativeElement.play();
        }

        this.audioPlaying = !this.audioPlaying;
    }
}
