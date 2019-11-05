import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {AngularFireDatabase} from "@angular/fire/database";
import {LightSettings} from "../data/lightSettings";

@Injectable()
export class LightSettingsService {

    constructor(private db: AngularFireDatabase) {
    }

    public getLightSettings(): Observable<LightSettings> {
        return this.db.object<LightSettings>(`/lightSettings`).valueChanges();
    }

    public setLightSettings(lightSettings: LightSettings): Promise<void> {
        return this.db.object<LightSettings>(`/lightSettings`).set(lightSettings);
    }
}
