import {Component} from "@angular/core";
import {Observable, BehaviorSubject, Subject} from "rxjs";
import {DaterangepickerConfig} from "ng2-daterangepicker";
import * as moment from "moment";
import {UserService} from "../shared/services/user.service";
import Utils from "../shared/utils";
import {AnswerService} from "../shared/services/answer.service";
import {QuestionService} from "../shared/services/question.service";
import Moment = moment.Moment;
import {isNullOrUndefined} from "util";

@Component({
    selector: 'app-scoreboard-screen',
    templateUrl: './scoreboard-screen.component.html',
    styleUrls: ['./scoreboard-screen.component.css']
})
export class ScoreboardScreenComponent {

    public userScores: any[];
    public dateRange: Observable<any>;

    private dateRangeSubject: Subject<any>;

    constructor(private dateRangePickerOptions: DaterangepickerConfig,
                private userService: UserService,
                private answerService: AnswerService,
                private questionService: QuestionService) {

        this.dateRangeSubject = new BehaviorSubject({
            start: moment().startOf('month'),
            end: moment().endOf('month')
        });

        this.dateRange = this.dateRangeSubject.asObservable();

        this.dateRangePickerOptions.settings = {
            alwaysShowCalendars: false,
            ranges: {
                'This Month': [moment().startOf('month'), moment().endOf('month')],
                'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')],
                'This Year': [moment().startOf('year'), moment().endOf('year')],
                'Last Year': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year')],
            }
        };

        let dateRangeQuery = this.dateRange.map(dateRange => {
            return {
                query: {
                    orderByKey: true,
                    startAt: `${dateRange.start.toDate().getTime()}`,
                    endAt: `${dateRange.end.toDate().getTime()}`,
                }
            };
        });

        let answers = this.answerService.listAnswersByQuestionWithQuery(dateRangeQuery);
        let questions = this.questionService.listQuestionsWithQuery(dateRangeQuery);
        let users = this.userService.getUsers();

        /*
         * TODO: use the join operator here when it gets added back to the BETA version of rxjs that angular 2
         * forces you to use (???)
         */
        Observable.combineLatest(answers, questions, users).subscribe(result => {

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
                        let questionValue: number = !isNullOrUndefined(answer[key].wager) ? answer[key].wager : questionValueMap.get(answer.$key);
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
                    let scoreComparison: number = Utils.compare(o2.value, o1.value);

                    if (scoreComparison != 0) {
                        return scoreComparison;
                    }
                    else {
                        return Utils.compare(Utils.getLastName(o1.name), Utils.getLastName(o2.name));
                    }
                });

                this.userScores = userScoreList;
            }
        );
    }

    public onDateSelection(value: any) {
        this.dateRangeSubject.next({start: value.start, end: value.end});
    }
}
