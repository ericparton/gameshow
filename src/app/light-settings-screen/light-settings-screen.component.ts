import {Component, OnInit} from '@angular/core';
import {LightSettings} from "../shared/data/lightSettings";
import {LightSettingsService} from "../shared/services/light-settings.service";
import {AlertComponent} from "ngx-bootstrap";
import {first} from "rxjs/operators";

@Component({
    selector: 'app-light-settings-screen',
    templateUrl: './light-settings-screen.component.html',
    styleUrls: ['./light-settings-screen.component.css']
})
export class LightSettingsScreenComponent implements OnInit {

    public lightSettings: LightSettings = new LightSettings();
    public showLoadMask: boolean = true;
    public alerts: any[] = [];

    constructor(private lightSettingsService: LightSettingsService) {
    }

    ngOnInit() {
        this.lightSettingsService.getLightSettings().pipe(first()).subscribe(lightSettings => {
            this.lightSettings = lightSettings;
            this.showLoadMask = false;
        });
    }

    onAlertClosed(dismissedAlert: AlertComponent): void {
        this.alerts = this.alerts.filter(alert => alert !== dismissedAlert);
    }

    onSubmit() {
        this.showLoadMask = true;
        this.alerts = [];
        this.lightSettingsService.setLightSettings(this.lightSettings).then(() => {
            this.showLoadMask = false;
            this.alerts = [{
                type: 'success',
                msg: `Light settings updated successfully.`
            }];
        }).catch(() => {
            this.showLoadMask = false;
            this.alerts = [{
                type: 'danger',
                msg: `An unspecified error occurred while updating the light settings. Please cry at your desk until help arrives.`
            }];
        });
    }
}
