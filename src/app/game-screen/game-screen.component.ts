import {Component, OnInit, ViewChild} from "@angular/core";
import {Observable} from "rxjs";
import {Router} from "@angular/router";
import { AngularFireDatabase, FirebaseObjectObservable } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';

@Component({
    selector: 'app-game-screen',
    templateUrl: './game-screen.component.html',
    styleUrls: ['./game-screen.component.css']
})
export class GameScreenComponent implements OnInit {

    public isHost: Observable<boolean>;
    public userName: Observable<string>;
    public isCollapsed: boolean = true;
    public audioPlaying: boolean = false;

    @ViewChild('audioPlayer')
    public audioPlayer;

    constructor(private db: AngularFireDatabase, private auth: AngularFireAuth, private router: Router) {
        this.isHost = Observable.combineLatest(
            auth.authState.map(state => state.uid),
            db.object('/hosts'),
            (uid, hosts) => {
                return hosts[uid] === true;
            });

        this.userName = auth.authState.map(state => state.uid)
            .flatMap(uid => db.object(`/users/${uid}`))
            .map(user => user.name);
    }

    ngOnInit(): void {
        //TODO: unscramble this
        this.auth.authState.subscribe(state => {
            if (state) {
                let user: FirebaseObjectObservable<any> = this.db.object(`/users/${state.uid}`);
                user.update({name: state.displayName});

                if (this.router.url !== '/game/scoreboard') {
                    let hosts: FirebaseObjectObservable<any> = this.db.object(`/hosts`);
                    hosts.subscribe(hosts => {
                        if (hosts[`${state.uid}`] === true) {
                            this.router.navigate(['/game/host']);
                        }
                        else {
                            this.router.navigate(['/game/player']);
                        }
                    });
                }
            }
            else {
              this.auth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
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
