import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-scoreboard-screen',
    templateUrl: './scoreboard-screen.component.html',
    styleUrls: ['./scoreboard-screen.component.css']
})
export class ScoreboardScreenComponent implements OnInit {

    public userPoints : Observable<any[]>;

    constructor(private af: AngularFire) {
        let date: Date = new Date();
        date.setDate(1);
        date.setMinutes(0);
        date.setMinutes(0);

        let key: string = `${date.getTime()}`;

        let answers = af.database.list('/answersByQuestion', {
            query: {
                orderByKey: true,
                startAt: key
            }
        });

        let questions = af.database.list('/questions', {
            query: {
                orderByKey: true,
                startAt: key
            }
        });

        let users = af.database.object('/users');

        this.userPoints = Observable.combineLatest(answers, questions, users, (answers, questions, users) => {
            let userPointsMap: Map<string,number> = new Map<string,number>();
            let questionPointsMap : Map<string,number> = new Map<string,number>();
            let userPointsList : any[] = [];

            Object.keys(users).filter(key => !key.startsWith('$')).forEach(key => userPointsMap.set(key, 0));
            questions.forEach(question => questionPointsMap.set(question.$key, question.value));

            answers.forEach(answer => {
                Object.keys(answer).filter(key => !key.startsWith('$')).forEach(key => {
                    let modifier : number = answer[key].correct === true ? 1 : -1;
                    let questionValue = questionPointsMap.get(answer.$key);
                    let userTotalPoints = userPointsMap.get(key) + (questionValue * modifier);

                    userPointsMap.set(key, userTotalPoints);
                })
            });

            userPointsMap.forEach((points, user) => {
                userPointsList.push({
                    name: users[`${user}`].name,
                    points: points
                })
            });

            return userPointsList;
        });
    }

    ngOnInit() {
    }

}
