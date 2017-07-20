import {Component, OnInit, ViewChild} from "@angular/core";
import {FirebaseObjectObservable, AngularFire} from "angularfire2";
import {Observable} from "rxjs";
import {Router} from "@angular/router";

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

    constructor(private af: AngularFire, private router: Router) {
        this.isHost = Observable.combineLatest(
            af.auth.map(state => state.auth.uid),
            af.database.object('/hosts'),
            (uid, hosts) => {
                return hosts[uid] === true;
            });

        this.userName = af.auth.map(state => state.auth.uid)
            .flatMap(uid => af.database.object(`/users/${uid}`))
            .map(user => user.name);
    }

    ngOnInit(): void {
        //TODO: unscramble this
        this.af.auth.subscribe(state => {
            if (state) {
                let user: FirebaseObjectObservable<any> = this.af.database.object(`/users/${state.uid}`);
                user.update({name: state.auth.displayName});

                if (this.router.url !== '/game/scoreboard') {
                    let hosts: FirebaseObjectObservable<any> = this.af.database.object(`/hosts`);
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
                this.af.auth.login();
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
