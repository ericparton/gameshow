import {BrowserModule} from "@angular/platform-browser";
import {NgModule} from "@angular/core";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {RouterModule, Routes} from "@angular/router";
import {AlertModule, BsDropdownModule, ButtonsModule, CollapseModule, ModalModule} from "ngx-bootstrap";
import {AppComponent} from "./app.component";
import {HostScreenComponent} from "./host-screen/host-screen.component";
import {PlayerScreenComponent} from "./player-screen/player-screen.component";
import {ScoreboardScreenComponent} from "./scoreboard-screen/scoreboard-screen.component";
import {MillisecondDatePipe} from "./shared/date-with-milliseconds.pipe";
import {OrdinalPipe} from "./shared/ordinal.pipe";
import {TitleCasePipe} from "./shared/title-case.pipe";
import {HostRouteGuard} from "./host-screen/host-screen.guard";
import {WelcomeScreenComponent} from "./welcome-screen/welcome-screen.component";
import {GameScreenComponent} from "./game-screen/game-screen.component";
import {QuestionService} from "./shared/services/question.service";
import {AnswerService} from "./shared/services/answer.service";
import {SubmissionService} from "./shared/services/submission.service";
import {UserService} from "./shared/services/user.service";
import {GameService} from "./shared/services/game.service";
import {MillisecondTimePipe} from "./shared/time-with-milliseconds.pipe";
import {AngularFireDatabaseModule} from "@angular/fire/database";
import {AngularFireAuthModule} from "@angular/fire/auth";
import {AngularFireModule} from "@angular/fire";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {BsDatepickerModule} from 'ngx-bootstrap/datepicker';
import {AuthorizationGuard} from "./shared/authorization.guard";
import {WakeLockService} from "./shared/services/wake-lock.service";
import {WakeLockGuard} from "./shared/wake-lock.guard";
import {LightSettingsScreenComponent} from "./light-settings-screen/light-settings-screen.component";
import {LightSettingsService} from "./shared/services/light-settings.service";
import {LightService} from "./shared/services/light.service";
import {HttpClientModule} from "@angular/common/http";

const firebaseConfig = {
    apiKey: "AIzaSyCekug-L053u-Rt0-6LeI4797JdFniFb7w",
    authDomain: "game-show-5fced.firebaseapp.com",
    databaseURL: "https://game-show-5fced.firebaseio.com",
    storageBucket: "game-show-5fced.appspot.com",
    messagingSenderId: "37727258953"
};

const appRoutes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/welcome'
    },
    {
        path: 'welcome',
        component: WelcomeScreenComponent
    },
    {
        path: 'game',
        component: GameScreenComponent,
        canActivate: [AuthorizationGuard, WakeLockGuard],
        children: [
            {
                path: 'host',
                component: HostScreenComponent,
                canActivate: [HostRouteGuard]
            },
            {
                path: 'lighting',
                component: LightSettingsScreenComponent,
                canActivate: [HostRouteGuard]
            },
            {
                path: 'player',
                component: PlayerScreenComponent
            },
            {
                path: 'scoreboard',
                component: ScoreboardScreenComponent
            }
        ]
    },
    // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
    declarations: [
        AppComponent,
        HostScreenComponent,
        PlayerScreenComponent,
        ScoreboardScreenComponent,
        MillisecondDatePipe,
        MillisecondTimePipe,
        OrdinalPipe,
        TitleCasePipe,
        WelcomeScreenComponent,
        GameScreenComponent,
        LightSettingsScreenComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        ButtonsModule,
        BrowserAnimationsModule,
        CollapseModule,
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        AngularFireModule.initializeApp(firebaseConfig),
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        RouterModule.forRoot(appRoutes),
        ModalModule.forRoot(),
        AlertModule.forRoot(),
        HttpClientModule
    ],
    providers: [
        HostRouteGuard,
        AuthorizationGuard,
        QuestionService,
        AnswerService,
        SubmissionService,
        UserService,
        GameService,
        LightSettingsService,
        LightService,
        WakeLockService,
        WakeLockGuard
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}
