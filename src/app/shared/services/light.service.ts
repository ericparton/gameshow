import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {LightSettingsService} from "./light-settings.service";
import {flatMap} from "rxjs/operators";

@Injectable()
export class LightService {

    constructor(private http: HttpClient,
                private lightSettingsService: LightSettingsService) {
    }

    public blinkRed(): void {
        return this.blinkColor("red");
    }

    public blinkGreen(): void {
        return this.blinkColor("green");
    }

    private blinkColor(color: string): void {
        this.lightSettingsService.getLightSettings().pipe(flatMap(lightSettings => {
            if (!lightSettings.enabled) {
                return;
            }

            return this.http.post(`https://api.lifx.com/v1/lights/${lightSettings.lifxSelector}/effects/breathe`, {
                color: color,
                persist: false,
                power_on: true,
                period: 1.2,
                cycles: 3.0
            }, {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${lightSettings.lifxApiKey}`
                })
            });
        })).subscribe();
    }
}
