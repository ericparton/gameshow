import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit {

    public submissions: FirebaseListObservable<any[]>;
    public questions: FirebaseListObservable<any[]>;
    public users: FirebaseObjectObservable<any>;

    constructor(private af: AngularFire) {
        this.users = af.database.object('/users');

        this.questions = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        });

        this.questions.subscribe(questions => {
            if (questions.length > 0) {
                this.submissions = af.database.list('/submissions', {
                    query: {
                        orderByChild: 'submitted_on',
                        startAt: parseInt(questions[0].$key)
                    }
                });
            }
        });
    }

    ngOnInit() {
    }

    toggleGame(event: MouseEvent) {
        // this.in_progress.set(event.srcElement.innerHTML.startsWith("Start"));
    }

    getUser(users: any, uid: string): any {
        if (users) {
            return users[uid];
        }

        return null
    }

}
