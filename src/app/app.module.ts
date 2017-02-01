import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {HttpModule} from '@angular/http';
import {AngularFireModule, AuthProviders, AuthMethods} from 'angularfire2';
import {RouterModule, Routes} from '@angular/router';
import {ButtonsModule} from 'ng2-bootstrap';
import {CollapseModule} from 'ng2-bootstrap';
import {AppComponent} from './app.component';
import {HostScreenComponent} from './host-screen/host-screen.component';
import {PlayerScreenComponent} from './player-screen/player-screen.component';
import {ScoreboardScreenComponent} from './scoreboard-screen/scoreboard-screen.component';
import {MillisecondDatePipe} from "./date-with-milliseconds.pipe";
import {OrdinalPipe} from "./ordinal.pipe";
import {TitleCasePipe} from "./title-case.pipe";
import {HostRouteGuard} from "./host-screen/host-screen.guard";
import {WelcomeScreenComponent} from './welcome-screen/welcome-screen.component';
import {GameScreenComponent} from './game-screen/game-screen.component';

const myFirebaseConfig = {
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
        children: [
            {
                path: 'host',
                component: HostScreenComponent,
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

const myFirebaseAuthConfig = {
    provider: AuthProviders.Google,
    method: AuthMethods.Redirect
};

@NgModule({
    declarations: [
        AppComponent,
        HostScreenComponent,
        PlayerScreenComponent,
        ScoreboardScreenComponent,
        MillisecondDatePipe,
        OrdinalPipe,
        TitleCasePipe,
        WelcomeScreenComponent,
        GameScreenComponent
        // WaveComponent777
    ],
    imports: [
        BrowserModule,
        FormsModule,
        HttpModule,
        ButtonsModule,
        CollapseModule,
        AngularFireModule.initializeApp(myFirebaseConfig, myFirebaseAuthConfig),
        RouterModule.forRoot(appRoutes)
    ],
    providers: [HostRouteGuard],
    bootstrap: [AppComponent]
})
export class AppModule {
}
