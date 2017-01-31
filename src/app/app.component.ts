import {Component, OnInit} from '@angular/core';
import {FirebaseObjectObservable, AngularFire} from "angularfire2";
import {Router} from "@angular/router";
import {Observable} from "rxjs";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    public isHost: Observable<boolean>;
    public userName: Observable<string>;
    public isCollapsed: boolean = true;

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

                if (this.router.url !== '/scoreboard') {
                    let hosts: FirebaseObjectObservable<any> = this.af.database.object(`/hosts`);
                    hosts.subscribe(hosts => {
                        if (hosts[`${state.uid}`] === true) {
                            this.router.navigate(['/host']);
                        }
                        else {
                            this.router.navigate(['/player']);
                        }
                    });
                }
            }
            else {
                this.af.auth.login();
            }
        });

// this.af.auth.filter(state => state != null).flatMap(state => {
//     let user: FirebaseObjectObservable<any> = this.af.database.object(`/users/${state.uid}`);
//     return Observable.combineLatest(user, Observable.fromPromise(user.update({name: state.auth.displayName})));
// }).flatMap(arr => {
//     if (this.router.url === '/welcome') {
//         return this.af.database.object(`/hosts/${arr[0].uid}`);
//         host.subscribe(object => {
//             if (object.$value) {
//                 this.router.navigate(['/host']);
//             }
//             else {
//                 this.router.navigate(['/player']);
//             }
//         });
//     }
// });
//
// this.af.auth.filter(state => state == null).subscribe(state => this.router.navigate(['/welcome']));
    }

    getRoute(): string {
        return this.router.url;
    }
}