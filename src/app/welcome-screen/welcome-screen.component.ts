import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseObjectObservable} from "angularfire2";
import {Router} from "@angular/router";

@Component({
    selector: 'app-welcome-screen',
    templateUrl: './welcome-screen.component.html',
    styleUrls: ['./welcome-screen.component.css']
})
export class WelcomeScreenComponent implements OnInit {
    constructor(private af: AngularFire, private router: Router) {
    }

    ngOnInit(): void {
        this.af.auth.subscribe(state => {
            if (state) {
                let user: FirebaseObjectObservable<any> = this.af.database.object(`/users/${state.uid}`);
                user.update({name: state.auth.displayName});
                user.subscribe(object => {
                    let value = object.name;
                    if (value != null && this.router.url === '/welcome') {
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
    }

    login(): void {
        this.af.auth.login();
    }
}
