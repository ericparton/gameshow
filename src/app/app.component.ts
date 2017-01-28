import {Component, OnInit} from '@angular/core';
import {FirebaseObjectObservable, AngularFire} from "angularfire2";
import {Router} from "@angular/router";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {

    constructor(private af: AngularFire, private router: Router) {
    }

    ngOnInit(): void {
        this.af.auth.subscribe(state => {
            if (state) {
                let user: FirebaseObjectObservable<any> = this.af.database.object(`/users/${state.uid}`);
                user.update({name: state.auth.displayName});
                user.subscribe(object => {
                    let value = object.name;
                    if (value != null && this.router.url === '/') {
                        let host: FirebaseObjectObservable<any> = this.af.database.object(`/hosts/${state.uid}`);
                        host.subscribe(object => {
                            if (object.$value) {
                                this.router.navigate(['/host']);
                            }
                            else {
                                this.router.navigate(['/player']);
                            }
                        });
                    }
                });
            }
            else {
                this.router.navigate(['/welcome']);
            }
        })

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

}