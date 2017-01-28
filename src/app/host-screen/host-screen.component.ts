import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit {

    public submissions: Observable<any[]>;
    public questions: Observable<any[]>;
    public users: Observable<any>;

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

        this.submissions = this.questions
            .filter(questions => questions.length > 0)
            .map(questions => questions[0].$key)
            .flatMap(question => {
                return af.database.list(`/submissions/${question}`, {
                    query: {
                        orderByChild: 'submitted_on'
                    }
                });
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
