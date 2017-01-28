import {Component, OnInit} from '@angular/core';
import {AngularFire, FirebaseListObservable, FirebaseObjectObservable} from "angularfire2";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit {

    public submissions: FirebaseListObservable<any[]>;
    public questions: FirebaseListObservable<any[]>;
    public users: FirebaseObjectObservable<any>;

    public valueModel: number;
    public radioModel: string = 'correct';

    constructor(private af: AngularFire) {
        this.users = af.database.object('/users');

        this.questions = af.database.list('/questions', {
            query: {
                orderByKey: true,
                limitToLast: 1
            }
        });

        this.submissions = af.database.list('/submissions', {
            query: {
                orderByChild: 'submitted_on',
                startAt: this.questions
                    .filter(questions => questions.length == 1)
                    .map(questions => parseInt(questions[0].$key))
            }
        });
    }

    ngOnInit() {
    }

    getUser(users: any, uid: string): any {
        if (users) {
            return users[uid];
        }

        return null
    }

    onNewQuestionSubmit() {
        let now: Date = new Date();

        this.af.database.object(`/questions/${now.getTime()}`).set({
            value: this.valueModel
        });

        this.valueModel = null;
    }
}
