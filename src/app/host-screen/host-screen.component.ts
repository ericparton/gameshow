import {Component, OnInit} from '@angular/core';
import {FirebaseObjectObservable, AngularFire} from "angularfire2";

@Component({
    selector: 'app-host-screen',
    templateUrl: './host-screen.component.html',
    styleUrls: ['./host-screen.component.css']
})
export class HostScreenComponent implements OnInit {

    public in_progress: FirebaseObjectObservable<any>;

    constructor(private af: AngularFire) {
        this.in_progress = af.database.object('/in_progress');
    }

    ngOnInit() {
    }

    toggleGame(event: MouseEvent) {
        this.in_progress.set(event.srcElement.innerHTML.startsWith("Start"));
    }
}
