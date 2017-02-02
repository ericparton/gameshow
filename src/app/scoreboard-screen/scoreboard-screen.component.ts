import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable} from "rxjs";

@Component({
    selector: 'app-scoreboard-screen',
    templateUrl: './scoreboard-screen.component.html',
    styleUrls: ['./scoreboard-screen.component.css']
})
export class ScoreboardScreenComponent implements OnInit {

    public userPoints: Observable<any[]>;

    constructor(private af: AngularFire) {
        let date: Date = new Date();
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setMilliseconds(0);

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
            let questionPointsMap: Map<string,number> = new Map<string,number>();
            let userPointsList: any[] = [];

            // Object.keys(users).filter(key => !key.startsWith('$')).forEach(key => userPointsMap.set(key, 0));
            questions.forEach(question => questionPointsMap.set(question.$key, question.value));

            answers.forEach(answer => {
                Object.keys(answer).filter(key => !key.startsWith('$')).forEach(key => {
                    if(!userPointsMap.has(key)){
                        userPointsMap.set(key, 0);
                    }

                    let modifier: number = answer[key].correct === true ? 1 : -1;
                    let questionValue: number = questionPointsMap.get(answer.$key);
                    let userTotalPoints: number = userPointsMap.get(key) + (questionValue * modifier);

                    userPointsMap.set(key, userTotalPoints);
                })
            });

            userPointsMap.forEach((points, user) => {
                userPointsList.push({
                    name: users[`${user}`].name,
                    points: points
                })
            });

            userPointsList.sort((o1, o2) => {
                let pointComparison: number = ScoreboardScreenComponent.compare(o2.points, o1.points);

                if (pointComparison != 0) {
                    return pointComparison;
                }

                return ScoreboardScreenComponent.compare(
                    ScoreboardScreenComponent.getLastName(o1.name),
                    ScoreboardScreenComponent.getLastName(o2.name));
            });

            return userPointsList;
        });
    }

    private static compare(o1: any, o2: any): number {
        if (o1 > o2) {
            return 1;
        }
        else if (o1 < o2) {
            return -1;
        }
        else {
            return 0;
        }
    }

    private static getLastName(name: string): string
    {
        let arr : string[] = name.split(' ');
        return arr[arr.length - 1].toUpperCase();
    }

    ngOnInit() {
    }
}
