import {Component, OnInit} from '@angular/core';
import {AngularFire} from "angularfire2";
import {Observable, BehaviorSubject, Subject} from "rxjs";
import {DaterangepickerConfig} from 'ng2-daterangepicker';
import * as moment from 'moment';
import Moment = moment.Moment;

@Component({
    selector: 'app-scoreboard-screen',
    templateUrl: './scoreboard-screen.component.html',
    styleUrls: ['./scoreboard-screen.component.css']
})
export class ScoreboardScreenComponent implements OnInit {

    public userScores: any[];
    public dateRange: Observable<any>;

    private dateRangeSubject: Subject<any>;
    private dateRangeQuery: Observable<any>;
    private questions: Observable<any>;
    private answers: Observable<any>;
    private users: Observable<any>;

    constructor(private af: AngularFire, private daterangepickerOptions: DaterangepickerConfig) {

        this.dateRangeSubject = new BehaviorSubject({
            start: moment().startOf('month'),
            end: moment().endOf('month')
        });

        this.dateRange = this.dateRangeSubject.asObservable();

        this.daterangepickerOptions.settings = {
            alwaysShowCalendars: false,
            ranges: {
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
            }
        };

        this.dateRangeQuery = this.dateRange.map(dateRange => {
            return {
                query: {
                    orderByKey: true,
                    startAt: `${dateRange.start.toDate().getTime()}`,
                    endAt: `${dateRange.end.toDate().getTime()}`,
                }
            };
        });

        this.answers = this.dateRangeQuery.flatMap(query => this.af.database.list('/answersByQuestion', query));
        this.questions = this.dateRangeQuery.flatMap(query => this.af.database.list('/questions', query));
        this.users = this.af.database.object('/users');

        /*
         * TODO: use the join operator here when it gets added back to the BETA version of rxjs that angular 2
         * forces you to use (???)
         */
        Observable.combineLatest(this.answers, this.questions, this.users).subscribe(result => {

                let answers = result[0];
                let questions = result[1];
                let users = result[2];

                let userScoreMap: Map<string,number> = new Map<string,number>();
                let questionValueMap: Map<string,number> = new Map<string,number>();
                let userScoreList: any[] = [];

                questions.forEach(question => questionValueMap.set(question.$key, question.value));

                answers.forEach(answer => {
                    Object.keys(answer).filter(key => !key.startsWith('$')).forEach(key => {
                        if (!userScoreMap.has(key)) {
                            userScoreMap.set(key, 0);
                        }

                        let modifier: number = answer[key].correct === true ? 1 : -1;
                        let questionValue: number = questionValueMap.get(answer.$key);
                        let userTotalScore: number = userScoreMap.get(key) + (questionValue * modifier);

                        userScoreMap.set(key, userTotalScore);
                    })
                });

                userScoreMap.forEach((score, user) => {
                    userScoreList.push({
                        name: users[`${user}`].name,
                        value: score
                    })
                });

                userScoreList.sort((o1, o2) => {
                    let scoreComparison: number = ScoreboardScreenComponent.compare(o2.value, o1.value);

                    if (scoreComparison != 0) {
                        return scoreComparison;
                    }

                    return ScoreboardScreenComponent.compare(
                        ScoreboardScreenComponent.getLastName(o1.name),
                        ScoreboardScreenComponent.getLastName(o2.name));
                });

                this.userScores = userScoreList;
            }
        );
    }

    ngOnInit() {

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

    private static getLastName(name: string): string {
        let arr: string[] = name.split(' ');
        return arr[arr.length - 1].toUpperCase();
    }

    private selectedDate(value: any) {
        this.dateRangeSubject.next({
            start: value.start,
            end: value.end
        });
    }
}
